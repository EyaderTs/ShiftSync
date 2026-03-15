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
  Tabs,
  Checkbox,
  TimePicker,
  DatePicker,
  Select,
  Tag,
  Input,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { StaffAvailability } from "@/models/availability-model";
import Card from "../../../shared/component/Card/card-component";
import InputWrapper from "../../../shared/component/input-wrapper/input-wrapper";
import {
  useCreateAvailabilityMutation,
  useUpdateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useLazyGetAvailabilityQuery,
} from "@/features/availability/store/availability.query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AuthContext from "@/shared/auth/context/authContext";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { TabPane } = Tabs;
const { confirm } = Modal;

interface Props {
  editMode: "new" | "detail";
  onCreating?: (isCreating: boolean) => void;
}

interface WeeklyAvailability {
  [key: number]: {
    enabled: boolean;
    locationId: string;
    startTime: string;
    endTime: string;
  };
}


export default function NewAvailabilityComponent(props: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const { editMode, onCreating } = props;
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("1");

  // Get user's locations from userLocations
  const userLocations = user?.userLocations || [];
  const locationOptions = userLocations.map((userLocation: any) => ({
    label: userLocation?.location?.name || 'Unknown Location',
    value: userLocation?.location?.locationId,
  }));

  // Get first location as default
  const defaultLocationId = locationOptions.length > 0 ? locationOptions[0].value : "";

  // Create default weekly availability with first location
  const getDefaultWeeklyAvailability = (): WeeklyAvailability => ({
    0: { enabled: false, locationId: defaultLocationId, startTime: "09:00 AM", endTime: "05:00 PM" },
    1: { enabled: false, locationId: defaultLocationId, startTime: "09:00 AM", endTime: "05:00 PM" },
    2: { enabled: false, locationId: defaultLocationId, startTime: "09:00 AM", endTime: "05:00 PM" },
    3: { enabled: false, locationId: defaultLocationId, startTime: "09:00 AM", endTime: "05:00 PM" },
    4: { enabled: false, locationId: defaultLocationId, startTime: "09:00 AM", endTime: "05:00 PM" },
    5: { enabled: false, locationId: defaultLocationId, startTime: "09:00 AM", endTime: "05:00 PM" },
    6: { enabled: false, locationId: defaultLocationId, startTime: "09:00 AM", endTime: "05:00 PM" },
  });

  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(getDefaultWeeklyAvailability());
  const [exceptionDate, setExceptionDate] = useState<any>(null);
  const [exceptionReason, setExceptionReason] = useState<string>('');
  const [exceptionStartTime, setExceptionStartTime] = useState<string>('09:00 AM');
  const [exceptionEndTime, setExceptionEndTime] = useState<string>('05:00 PM');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<any>({
    defaultValues: {
      locationId: defaultLocationId,
    },
    mode: "onBlur",
  });

  const [createAvailability, createResponse] = useCreateAvailabilityMutation();
  const [updateAvailability, updateResponse] = useUpdateAvailabilityMutation();
  const [deleteAvailability, deleteResponse] = useDeleteAvailabilityMutation();
  const [getAvailability, availability] = useLazyGetAvailabilityQuery();
  const [currentAvailabilityId, setCurrentAvailabilityId] = useState<string | null>(null);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function onSubmitRecurring(data: any) {
    const availabilityRecords = Object.entries(weeklyAvailability)
      .filter(([_, value]) => value.enabled && value.locationId)
      .map(([dayOfWeek, value]) => ({
        type: 'recurring' as const,
        dayOfWeek: parseInt(dayOfWeek),
        startTime: value.startTime,
        endTime: value.endTime,
        locationId: value.locationId,
        isAvailable: true,
      }));

    if (availabilityRecords.length === 0) {
      Modal.warning({
        title: 'No Days Selected',
        content: 'Please select at least one day with availability and location.',
      });
      return;
    }

    onCreating?.(true);

    // Check if we're editing or creating
    if (editMode === 'detail' && currentAvailabilityId) {
      // For recurring, we only update the single record (one day)
      if (availabilityRecords.length > 1) {
        Modal.warning({
          title: 'Multiple Days Selected',
          content: 'When editing, you can only update one day at a time. Please select only one day.',
        });
        onCreating?.(false);
        return;
      }

      updateAvailability({
        ...availabilityRecords[0],
        availabilityId: currentAvailabilityId,
      }).then(() => {
        onCreating?.(false);
        navigate('/availability');
      });
    } else {
      // Create new records - send all records as a single array in one request
      createAvailability(availabilityRecords as any).then(() => {
        onCreating?.(false);
        navigate('/availability');
      });
    }
  }

  function onSubmitException(data: any) {
    if (!exceptionDate) {
      Modal.warning({
        title: 'Date Required',
        content: 'Please select a date for the exception.',
      });
      return;
    }

    // Get the selected location's timezone
    const selectedLocation = userLocations.find(
      (ul: any) => ul?.location?.locationId === data.locationId
    );
    const locationTimezone = selectedLocation?.location?.timeZone || 'UTC';

    // Parse the date and times in the location's timezone
    const dateStr = dayjs(exceptionDate).format('YYYY-MM-DD');
    const startTimeParsed = dayjs(exceptionStartTime, 'hh:mm A');
    const endTimeParsed = dayjs(exceptionEndTime, 'hh:mm A');

    // Create datetime strings in location timezone and convert to UTC
    const startDateTimeInLocationTz = `${dateStr} ${startTimeParsed.format('HH:mm')}`;
    const endDateTimeInLocationTz = `${dateStr} ${endTimeParsed.format('HH:mm')}`;

    const exceptionRecord = {
      type: 'exception' as const,
      locationId: data.locationId,
      exceptionDate: dateStr, // Store as date string only (e.g., "2026-03-15")
      exceptionStartTimeUtc: dayjs.tz(startDateTimeInLocationTz, locationTimezone).utc().toISOString(),
      isAvailable: false, // Exceptions are for unavailability
      exceptionEndTimeUtc: dayjs.tz(endDateTimeInLocationTz, locationTimezone).utc().toISOString(),
      notes: exceptionReason,
    } as any;

    onCreating?.(true);

    // Check if we're editing or creating
    if (editMode === 'detail' && currentAvailabilityId) {
      // Update existing record
      updateAvailability({
        ...exceptionRecord,
        availabilityId: currentAvailabilityId,
      }).then(() => {
        onCreating?.(false);
        navigate('/availability');
      });
    } else {
      // Create new record
      createAvailability(exceptionRecord).then(() => {
        onCreating?.(false);
        navigate('/availability');
      });
    }
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };

  useEffect(() => {
    if (params?.id && params?.id !== "new") {
      getAvailability({
        id: `${params?.id}`,
        includes: ['location'],
      }).then((response: any) => {
        if (response?.data) {
          setCurrentAvailabilityId(response.data.availabilityId);

          if (response.data.type === 'recurring') {
            setActiveTab("1");
            // Load recurring data
            const dayOfWeek = response.data.dayOfWeek;
            if (dayOfWeek !== undefined && dayOfWeek !== null) {
              setWeeklyAvailability(prev => ({
                ...prev,
                [dayOfWeek]: {
                  enabled: true,
                  locationId: response.data.locationId,
                  startTime: response.data.startTime || '09:00 AM',
                  endTime: response.data.endTime || '05:00 PM',
                },
              }));
            }
          } else {
            setActiveTab("2");
            reset({
              locationId: response.data.locationId,
            });
            setExceptionDate(response.data.exceptionDate ? dayjs(response.data.exceptionDate) : null);
            setExceptionReason(response.data.notes || '');

            // Convert UTC times back to location timezone for display
            // Try to get timezone from the response location first, then from userLocations
            let locationTimezone = 'UTC';
            if (response.data.location?.timeZone) {
              locationTimezone = response.data.location.timeZone;
            } else {
              const selectedLocation = userLocations.find(
                (ul: any) => ul?.location?.locationId === response.data.locationId
              );
              locationTimezone = selectedLocation?.location?.timeZone || 'UTC';
            }

            if (response.data.exceptionStartTimeUtc) {
              setExceptionStartTime(dayjs(response.data.exceptionStartTimeUtc).tz(locationTimezone).format('hh:mm A'));
            }
            if (response.data.exceptionEndTimeUtc) {
              setExceptionEndTime(dayjs(response.data.exceptionEndTimeUtc).tz(locationTimezone).format('hh:mm A'));
            }
          }
        }
      });
    }
  }, [params.id]);

  const handleDayToggle = (dayOfWeek: number, checked: boolean) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        enabled: checked,
      },
    }));
  };

  const handleLocationChange = (dayOfWeek: number, locationId: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        locationId: locationId,
      },
    }));
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };


  return (
    <Card className="w-full" title={editMode === "detail" ? "Edit Availability" : "New Availability"}>
      <Spin spinning={availability.isLoading || availability.isFetching}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined />
                Weekly Pattern
              </span>
            }
            key="1"
          >
            <Form
              name="weekly-availability-form"
              onFinish={handleSubmit(onSubmitRecurring, onError)}
              layout="vertical"
              className="w-full"
            >
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Set your regular weekly availability. Check the box to indicate available days and select the location.
                </p>
              </div>

              <div className="space-y-3">
                {dayNames.map((day, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${weeklyAvailability[index].enabled
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Checkbox
                        checked={weeklyAvailability[index].enabled}
                        onChange={(e) => handleDayToggle(index, e.target.checked)}
                      >
                        <span className="font-medium">{day}</span>
                      </Checkbox>
                      {weeklyAvailability[index].enabled && (
                        <Tag color="success" className="hidden sm:inline">Available</Tag>
                      )}
                    </div>

                    {weeklyAvailability[index].enabled && (
                      <div className="flex flex-col gap-3">
                        <Select
                          value={weeklyAvailability[index].locationId || undefined}
                          onChange={(value) => handleLocationChange(index, value)}
                          placeholder="Select location"
                          className="w-full"
                          size="large"
                          showSearch
                          filterOption={(input, option) =>
                            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={locationOptions}
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <TimePicker
                            value={dayjs(weeklyAvailability[index].startTime, 'hh:mm A')}
                            format="hh:mm A"
                            use12Hours
                            onChange={(time) =>
                              handleTimeChange(index, 'startTime', time ? time.format('hh:mm A') : '09:00 AM')
                            }
                            size="large"
                            className="w-full sm:w-auto"
                          />
                          <span className="text-gray-500 hidden sm:inline">to</span>
                          <span className="text-gray-500 sm:hidden text-sm">to</span>
                          <TimePicker
                            value={dayjs(weeklyAvailability[index].endTime, 'hh:mm A')}
                            format="hh:mm A"
                            use12Hours
                            onChange={(time) =>
                              handleTimeChange(index, 'endTime', time ? time.format('hh:mm A') : '05:00 PM')
                            }
                            size="large"
                            className="w-full sm:w-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <Button
                  htmlType="button"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setWeeklyAvailability(getDefaultWeeklyAvailability());
                    reset({ locationId: defaultLocationId });
                  }}
                  size="large"
                  className="w-full sm:w-auto"
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={createResponse.isLoading}
                  size="large"
                  className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                >
                  Save Availability
                </Button>
              </div>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                One-Off Exceptions
              </span>
            }
            key="2"
          >
            <Form
              name="exception-availability-form"
              onFinish={handleSubmit(onSubmitException, onError)}
              layout="vertical"
              className="w-full"
            >
              <div className="mb-4">
                <p className="text-gray-600">
                  Add specific dates where you're unavailable or have different availability hours.
                </p>
              </div>

              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <InputWrapper
                    label="Location"
                    required
                    error={errors?.locationId?.message}
                    className="mb-6"
                  >
                    <Select
                      {...field}
                      placeholder="Select location"
                      size="large"
                      status={errors?.locationId ? "error" : ""}
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={locationOptions}
                    />
                  </InputWrapper>
                )}
              />

              <div className="border border-dashed border-gray-300 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Add One-Off Exception</h3>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <DatePicker
                        value={exceptionDate}
                        onChange={(date) => setExceptionDate(date)}
                        placeholder="mm/dd/yyyy"
                        size="large"
                        className="w-full"
                        format="MM/DD/YYYY"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                      <Input
                        value={exceptionReason}
                        onChange={(e) => setExceptionReason(e.target.value)}
                        placeholder="e.g., Doctor's appointment"
                        size="large"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">From</label>
                      <TimePicker
                        value={dayjs(exceptionStartTime, 'hh:mm A')}
                        onChange={(time) => setExceptionStartTime(time ? time.format('hh:mm A') : '09:00 AM')}
                        format="hh:mm A"
                        size="large"
                        className="w-full"
                        use12Hours
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">To</label>
                      <TimePicker
                        value={dayjs(exceptionEndTime, 'hh:mm A')}
                        onChange={(time) => setExceptionEndTime(time ? time.format('hh:mm A') : '05:00 PM')}
                        format="hh:mm A"
                        size="large"
                        className="w-full"
                        use12Hours
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 mt-6">
                <Button
                  htmlType="button"
                  size="large"
                  onClick={() => navigate('/availability')}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={createResponse.isLoading || updateResponse.isLoading}
                  size="large"
                  className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto order-1 sm:order-2"
                >
                  Save Availability
                </Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Spin>
    </Card>
  );
}
