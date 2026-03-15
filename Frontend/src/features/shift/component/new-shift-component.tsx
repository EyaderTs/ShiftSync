import {
  SaveOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Form,
  Modal,
  Spin,
  DatePicker,
  TimePicker,
  Select,
  InputNumber,
  Checkbox,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { Shift } from "@/models/shift-model";
import Card from "../../../shared/component/Card/card-component";
import InputWrapper from "../../../shared/component/input-wrapper/input-wrapper";
import {
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useLazyGetShiftQuery,
} from "@/features/shift/store/shift.query";
import { useLazyGetSkillsQuery } from "@/features/skill/store/skill.query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AuthContext from "@/shared/auth/context/authContext";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  editMode: "new" | "detail";
  onCreating?: (isCreating: boolean) => void;
}

const shiftSchema = yup.object().shape({
  locationId: yup.string().required("Location is required"),
  skillId: yup.string().required("Skill is required"),
  requiredHeadcount: yup
    .number()
    .required("Required headcount is required")
    .min(1, "Headcount must be at least 1"),
});

export default function NewShiftComponent(props: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const { editMode, onCreating } = props;
  const { user } = useContext(AuthContext);

  const [shiftDate, setShiftDate] = useState<any>(null);
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);

  // Get user's locations from userLocations
  const userLocations = user?.userLocations || [];
  const locationOptions = userLocations.map((userLocation: any) => ({
    label: userLocation?.location?.name || 'Unknown Location',
    value: userLocation?.location?.locationId,
    timezone: userLocation?.location?.timeZone || 'UTC',
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<any>({
    resolver: yupResolver(shiftSchema),
    defaultValues: {
      locationId: locationOptions.length > 0 ? locationOptions[0].value : "",
      requiredHeadcount: 1,
    },
    mode: "onBlur",
  });

  const selectedLocationId = watch("locationId");
  const selectedLocation = locationOptions.find((loc: any) => loc.value === selectedLocationId);
  const locationTimezone = selectedLocation?.timezone || 'UTC';

  const [createShift, createResponse] = useCreateShiftMutation();
  const [updateShift, updateResponse] = useUpdateShiftMutation();
  const [getShift, shift] = useLazyGetShiftQuery();
  const [getSkills, skills] = useLazyGetSkillsQuery();

  useEffect(() => {
    getSkills({});
  }, []);

  useEffect(() => {
    if (params?.id && params?.id !== "new" && editMode === "detail") {
      getShift({
        id: `${params?.id}`,
        includes: ['location', 'skill'],
      }).then((response: any) => {
        if (response?.data) {
          const shiftData = response.data;
          reset({
            locationId: shiftData.locationId,
            skillId: shiftData.skillId,
            requiredHeadcount: shiftData.requiredHeadcount,
          });

          // Convert UTC times to location timezone
          const loc = locationOptions.find((l: any) => l.value === shiftData.locationId);
          const tz = loc?.timezone || shiftData.location?.timeZone || 'UTC';

          if (shiftData.startTimeUtc) {
            const startMoment = dayjs(shiftData.startTimeUtc).tz(tz);
            setShiftDate(startMoment);
            setStartTime(startMoment);
          }

          if (shiftData.endTimeUtc) {
            const endMoment = dayjs(shiftData.endTimeUtc).tz(tz);
            setEndTime(endMoment);
          }

          setIsPremium(shiftData.isPremium || false);
        }
      });
    }
  }, [params.id, editMode]);

  function onSubmit(data: any) {
    if (!shiftDate || !startTime || !endTime) {
      Modal.warning({
        title: 'Missing Information',
        content: 'Please select date, start time, and end time.',
      });
      return;
    }

    // Combine date with times in location timezone
    const dateStr = dayjs(shiftDate).format('YYYY-MM-DD');
    const startTimeStr = dayjs(startTime).format('HH:mm');
    const endTimeStr = dayjs(endTime).format('HH:mm');

    const startDateTimeStr = `${dateStr} ${startTimeStr}`;
    const endDateTimeStr = `${dateStr} ${endTimeStr}`;

    // Convert to UTC
    const startTimeUtc = dayjs.tz(startDateTimeStr, locationTimezone).utc().toISOString();
    let endTimeUtc = dayjs.tz(endDateTimeStr, locationTimezone).utc().toISOString();

    // Handle overnight shifts (end time before start time means next day)
    if (dayjs(endTime).isBefore(dayjs(startTime))) {
      const nextDayEndDateTime = `${dayjs(shiftDate).add(1, 'day').format('YYYY-MM-DD')} ${endTimeStr}`;
      endTimeUtc = dayjs.tz(nextDayEndDateTime, locationTimezone).utc().toISOString();
    }

    // Check if it's a Friday/Saturday evening shift for premium marking
    const shiftStart = dayjs.tz(startDateTimeStr, locationTimezone);
    const dayOfWeek = shiftStart.day();
    const hour = shiftStart.hour();
    const autoIsPremium = (dayOfWeek === 5 || dayOfWeek === 6) && hour >= 18; // Friday or Saturday after 6 PM

    const shiftData = {
      ...data,
      startTimeUtc,
      endTimeUtc,
      isPremium: isPremium || autoIsPremium,
      status: 'draft',
    };

    onCreating?.(true);

    if (editMode === "detail" && params?.id) {
      updateShift({
        ...shiftData,
        shiftId: params.id,
      }).then(() => {
        onCreating?.(false);
        navigate('/shifts');
      });
    } else {
      createShift(shiftData).then(() => {
        onCreating?.(false);
        navigate('/shifts');
      });
    }
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };

  const handleReset = () => {
    reset({
      locationId: locationOptions.length > 0 ? locationOptions[0].value : "",
      requiredHeadcount: 1,
    });
    setShiftDate(null);
    setStartTime(null);
    setEndTime(null);
    setIsPremium(false);
  };

  const skillOptions = skills.data?.data?.map((skill: any) => ({
    label: skill.name,
    value: skill.skillId,
  })) || [];

  return (
    <Card className="w-full" title={editMode === "detail" ? "Edit Shift" : "New Shift"}>
      <Spin spinning={shift.isLoading || shift.isFetching || createResponse.isLoading || updateResponse.isLoading}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit, onError)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <InputWrapper
              label="Location"
              error={errors?.locationId?.message}
              required
            >
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select location"
                    options={locationOptions}
                    size="large"
                    className="w-full"
                  />
                )}
              />
            </InputWrapper>

            {/* Skill */}
            <InputWrapper
              label="Required Skill"
              error={errors?.skillId?.message}
              required
            >
              <Controller
                name="skillId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select skill"
                    options={skillOptions}
                    size="large"
                    className="w-full"
                    loading={skills.isLoading}
                  />
                )}
              />
            </InputWrapper>

            {/* Date */}
            <InputWrapper label="Shift Date" required>
              <DatePicker
                value={shiftDate}
                onChange={setShiftDate}
                format="YYYY-MM-DD"
                size="large"
                className="w-full"
                placeholder="Select date"
                prefix={<CalendarOutlined />}
              />
            </InputWrapper>

            {/* Required Headcount */}
            <InputWrapper
              label="Required Headcount"
              error={errors?.requiredHeadcount?.message}
              required
            >
              <Controller
                name="requiredHeadcount"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={1}
                    max={50}
                    size="large"
                    className="w-full"
                    placeholder="Number of staff needed"
                  />
                )}
              />
            </InputWrapper>

            {/* Start Time */}
            <InputWrapper label="Start Time" required>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                format="hh:mm A"
                use12Hours
                size="large"
                className="w-full"
                placeholder="Select start time"
                prefix={<ClockCircleOutlined />}
              />
            </InputWrapper>

            {/* End Time */}
            <InputWrapper label="End Time" required>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                format="hh:mm A"
                use12Hours
                size="large"
                className="w-full"
                placeholder="Select end time"
                prefix={<ClockCircleOutlined />}
              />
            </InputWrapper>
          </div>

          {/* Premium Shift Checkbox */}
          <div className="mt-4">
            <Checkbox
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            >
              Mark as Premium Shift
            </Checkbox>
            <p className="text-xs text-gray-500 mt-1">
              Note: Friday/Saturday evening shifts (after 6 PM) are automatically marked as premium
            </p>
          </div>

          {/* Timezone Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              <strong>Timezone:</strong> {locationTimezone} (times will be stored in UTC)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              className="w-full sm:w-auto"
              loading={createResponse.isLoading || updateResponse.isLoading}
            >
              {editMode === "detail" ? "Update Shift" : "Create Shift"}
            </Button>
            <Button
              type="default"
              icon={<ClearOutlined />}
              size="large"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
            <Button
              type="default"
              size="large"
              onClick={() => navigate('/shifts')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Spin>
    </Card>
  );
}
