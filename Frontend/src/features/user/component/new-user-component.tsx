import {
  SaveOutlined,
  DeleteOutlined,
  RollbackOutlined,
  ClearOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  UserOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { debounce } from "lodash-es";
import {
  Empty,
  Button,
  Collapse,
  Form,
  Input,
  Modal,
  Select,
  SelectProps,
  Spin,
  Upload,
  Avatar,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import type { RcFile } from "antd/es/upload";
import ImgCrop from "antd-img-crop";
import { User } from "@/models/user-model";
import Card from "../../../shared/component/Card/card-component";
import InputWrapper from "../../../shared/component/input-wrapper/input-wrapper";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useArchiveUserMutation,
  useDeleteUserMutation,
  useLazyGetUserQuery,
  useRestoreUserMutation,
} from "@/features/user/store/user.query";
import { useLazyGetLocationsQuery } from "@/features/location/store/location.query";
import { CollectionQuery } from "@/models/collection.model";
import { Location } from "@/models/location-model";
import { Skill } from "@/models/skill-model";
import { useLazyGetSkillsQuery } from "@/features/skill/store/skill.query";
import countryJson from "@/shared/constants/country-json.json";
import { EnumRoles } from "@/shared/constants/enum/app.enum";

const { Panel } = Collapse;
const { confirm } = Modal;

// Priority map for countries that share dial codes
const countryPriorityMap: { [dialCode: string]: string } = {
  "+1": "US", // Prioritize US over Canada, etc.
  "+44": "GB", // Prioritize UK over other +44 countries
  "+61": "AU", // Prioritize Australia over other +61 countries
};

// Updated country codes mapping
const countryCodes = countryJson.map((country: any) => {
  return {
    value: country.code, // Country code like 'US', 'CA', etc.
    label: `${country.name} (${country.dial_code})`,
    name: country.name,
    dialCode: country.dial_code
  };
});

// Role options
const roleOptions = [
  { value: EnumRoles.Admin, label: "Admin" },
  { value: EnumRoles.Manager, label: "Manager" },
  { value: EnumRoles.Staff, label: "Staff" },
];

const schema = yup
  .object<User>({
    firstName: yup.string().required("First Name is required"),
    middelName: yup.string().nullable(),
    lastName: yup.string().required("Last Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup.string().nullable().test('phone-validation', 'Invalid phone number format', function (value) {
      if (!value || value === '') return true; // Allow empty values
      // Simple validation - adjust as needed
      return /^\d{7,15}$/.test(value.replace(/[^\d]/g, ''));
    }),
    role: yup.string().required("Role is required"),
    skillId: yup.string().nullable().when("role", {
      is: (role: string) => role === EnumRoles.Staff,
      then: (schema) => schema.required("Skill is required for Staff role"),
      otherwise: (schema) => schema.nullable(),
    }),
    userLocations: yup.array().nullable().when("role", {
      is: (role: string) => role === EnumRoles.Manager || role === EnumRoles.Staff,
      then: (schema) => schema.min(1, "At least one location is required").required("Location is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    password: yup.string().when("editMode", {
      is: "new",
      then: (schema) => schema.required("Password is required"),
      otherwise: (schema) => schema.optional(),
    }),
  })
  .required();

const defaultValue: User = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  skillId: "",
  password: "",
  userLocations: [],
  isActive: true,
};

interface Props {
  editMode: "new" | "detail";
  onCreating?: (isCreating: boolean) => void;
}

export default function NewUserComponent(props: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { editMode, onCreating } = props;
  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<any>({
    defaultValues: defaultValue,
    resolver: yupResolver(schema),
    mode: "onBlur",
    context: { editMode },
  });

  const [selectedCountry, setSelectedCountry] = useState<string>("US"); // Default to US
  const [locationOptions, setLocationOptions] = useState<SelectProps["options"]>([]);
  const [skillOptions, setSkillOptions] = useState<SelectProps["options"]>(
    []
  );

  // Watch role field for conditional rendering
  const selectedRole = watch("role");
  const [profilePictureFile, setProfilePictureFile] = useState<RcFile | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | undefined>(undefined);
  const [originalProfilePictureUrl, setOriginalProfilePictureUrl] = useState<string | undefined>(undefined);
  const [createUser, createResponse] = useCreateUserMutation();
  const [updateUser, updateResponse] = useUpdateUserMutation();
  const [archiveUser, archiveResponse] = useArchiveUserMutation();
  const [deleteUser, deleteResponse] = useDeleteUserMutation();
  const [restoreUser, restoreResponse] = useRestoreUserMutation();
  const [getUser, user] = useLazyGetUserQuery();

  const [getLocations, locations] = useLazyGetLocationsQuery();
  const [getSkills, skills] = useLazyGetSkillsQuery();

  const [locationCollection, setLocationCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
  });
  const [skillCollection, setSkillCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
  });

  // Helper function to parse phone number 
  const parsePhoneNumberHelper = (fullPhoneNumber: string) => {
    if (!fullPhoneNumber) return { countryCode: "US", phoneNumber: "" };

    // Simple parsing - look for country code in the full number
    const cleaned = fullPhoneNumber.replace(/[^\d+]/g, "");

    // Sort countries by dial code length (longest first) to match longer codes first
    const sortedCountries = [...countryCodes].sort((a, b) => b.dialCode.length - a.dialCode.length);

    // Find all matching countries by dial code
    const matchingCountries = sortedCountries.filter(country =>
      cleaned.startsWith(country.dialCode)
    );

    if (matchingCountries.length > 0) {
      let selectedCountry = matchingCountries[0];

      // Check if there's a priority country for this dial code
      const dialCode = matchingCountries[0].dialCode;
      const priorityCountryCode = countryPriorityMap[dialCode];

      if (priorityCountryCode) {
        const priorityCountry = matchingCountries.find(country => country.value === priorityCountryCode);
        if (priorityCountry) {
          selectedCountry = priorityCountry;
        }
      }

      const phoneNumber = cleaned.substring(selectedCountry.dialCode.length);
      return {
        countryCode: selectedCountry.value,
        phoneNumber: phoneNumber
      };
    }

    // Default to US if no match found
    return { countryCode: "US", phoneNumber: cleaned.replace(/^\+?1?/, "") };
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicturePreview);
      }
    };
  }, [profilePicturePreview]);

  useEffect(() => {
    if (editMode === "detail") {
      getUser({ id: `${params.id}`, includes: ["userLocations", "skill"] }).then(
        (response: any) => {
          if (response?.data) {
            // Handle phone number parsing
            let countryToSet = "US";
            let phoneToSet = "";

            if (response?.data?.countryCode) {
              // Use stored country code
              countryToSet = response?.data?.countryCode;

              // Extract phone number by removing the dial code
              if (response?.data?.phone) {
                const countryData = countryCodes.find(c => c.value === countryToSet);
                if (countryData && response?.data?.phone.startsWith(countryData.dialCode)) {
                  phoneToSet = response?.data?.phone.substring(countryData.dialCode.length);
                } else {
                  phoneToSet = response?.data?.phone.replace(/[^\d]/g, "");
                }
              }
            } else {
              // Fallback to parsing from phone number
              const { countryCode: parsedCountryCode, phoneNumber } = parsePhoneNumberHelper(response?.data?.phone);
              countryToSet = parsedCountryCode;
              phoneToSet = phoneNumber;
            }

            setSelectedCountry(countryToSet);
            // Set profile picture preview from server
            if (response?.data?.profilePicture) {
              setProfilePicturePreview(response?.data?.profilePicture);
            } else {
              setProfilePicturePreview(undefined);
            }

            reset({
              firstName: response?.data?.firstName,
              // middleName: response?.data?.middleName,
              lastName: response?.data?.lastName,
              jobTitle: response?.data?.jobTitle,
              email: response?.data?.email,
              phone: phoneToSet,
              role: response?.data?.role || "",
              skillId: response?.data?.skill?.skillId || response?.data?.skillId,
              userLocations: response?.data?.userLocations?.map(
                (location: any) => location?.locationId
              ),
            });
          }
        }
      );
    } else {
      reset(defaultValue);
      setSelectedCountry("US"); // Reset to default country code for new entries
      setProfilePicturePreview(undefined);
      setProfilePictureFile(null);
    }
  }, [params.id]);

  useEffect(() => {
    getLocations(locationCollection).then((response: any) => {
      if (response?.data) {
        const data = response?.data?.data?.map((item: Location) => {
          return {
            value: item?.locationId,
            label: item?.name,
          };
        });

        setLocationOptions(data);
      }
    });
  }, [locationCollection]);

  useEffect(() => {
    if (editMode === "new" && searchParams.get("skillId") !== null) {

      getSkills({
        filter: [
          [
            {
              field: "skillId",
              operator: "=",
              value: searchParams.get("skillId"),
            },
          ],
        ],
      }).then((response: any) => {
        if (response?.data?.data) {
          console.log("response?.data?.data", response?.data?.data[0]?.name);
          setSkillOptions([
            {
              label: response?.data?.data[0]?.name,
              value: response?.data?.data[0]?.skillId,
            },
          ]);
          setValue("skillId", response?.data?.data[0]?.skillId);
          console.log("SChoolId", response?.data?.data[0]?.skillId);
        }
      });
    }
  }, [searchParams.get("skillId")]);

  useEffect(() => {
    getSkills(skillCollection).then((response: any) => {
      if (response?.data) {
        let exist = false;
        const data = response?.data?.data?.map((item: Skill) => {
          if (item?.skillId === user?.data?.skillId) {
            exist = true;
          }
          return {
            value: item?.skillId,
            label: item?.name,
          };
        });
        if (!exist && user?.data?.skillId) {
          data.unshift({
            value: user?.data?.skillId,
            label: user?.data?.skill?.name,
          });
        }
        setSkillOptions(data);
      }
    });
  }, [skillCollection, skills?.data?.data, user?.data]);

  function onSubmit(data: any) {
    console.log("to update", data);

    // Format phone number with country code
    let formattedPhoneNumber = "";

    if (data.phone) {
      // Get dial code for selected country
      const selectedCountryData = countryCodes.find(c => c.value === selectedCountry);
      const dialCode = selectedCountryData?.dialCode || "+1";

      // Format: dialCode + phoneNumber (remove any non-digits from phone number)
      const cleanPhoneNumber = data.phone.replace(/[^\d]/g, "");
      formattedPhoneNumber = `${dialCode}${cleanPhoneNumber}`;
    }

    const submitData = {
      ...data,
      phone: formattedPhoneNumber,
      // Optionally store the country code for better parsing later
      countryCode: selectedCountry,
    };

    // Always use FormData for consistency - backend can handle optional profilePicture
    const formData = new FormData();

    // Append all form fields
    formData.append("firstName", submitData.firstName || "");
    formData.append("lastName", submitData.lastName || "");
    formData.append("email", submitData.email || "");
    formData.append("phone", formattedPhoneNumber || "");
    formData.append("countryCode", selectedCountry || "");
    formData.append("role", submitData.role || "");

    if (submitData.middleName) formData.append("middleName", submitData.middleName);
    if (submitData.skillId) formData.append("skillId", submitData.skillId);
    if (submitData.password) formData.append("password", submitData.password);

    // Append profile picture only if it exists
    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
    }

    if (editMode === "new") {
      const locations = submitData?.userLocations?.map((location: any) => {
        return {
          locationId: location,
        };
      });

      formData.append("userLocations", JSON.stringify(locations));

      onCreating?.(true);
      createUser(formData).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          if (!onCreating) {
            navigate(`/users/detail/${response?.data?.userId}`);
          }
        }
      });
    } else {
      const locations = submitData?.userLocations?.map((location: any) => {
        return {
          locationId: location,
          userLocationId:
            user?.data?.userLocations?.find((item: any) => item?.locationId === location)
              ?.userLocationId ?? null,
        };
      });

      formData.append("userId", `${params.id}`);
      formData.append("userLocations", JSON.stringify(locations));

      updateUser(formData).then((response: any) => {
        if (response?.data) {
          navigate(`/users/detail/${response?.data?.userId}`);
        }
      });
    }
  }

  // Handle profile picture upload
  const handleProfilePictureChange = (file: RcFile) => {
    setProfilePictureFile(file);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfilePicturePreview(previewUrl);
    return false; // Prevent auto upload
  };

  // Handle profile picture removal
  const handleProfilePictureRemove = () => {
    // Clean up blob URL if it exists
    if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePicturePreview);
    }
    setProfilePictureFile(null);
    setProfilePicturePreview(undefined);
  };

  // Before crop validation
  const beforeCrop = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return false;
    }

    const isLessThan2MB = file.size / 1024 / 1024 < 2;
    if (!isLessThan2MB) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }

    return true;
  };

  const onError = (error: any) => {
    console.log("Error", error);
  };

  return (
    <Card
      className="w-full"
      title={
        editMode === "detail"
          ? `${user?.data?.firstName} ${user?.data?.lastName}`
          : "New User"
      }
    >
      <Spin spinning={user.isLoading || user.isFetching}>
        <div className="w-full flex justify-center">
          <Form
            name="User form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={handleSubmit(onSubmit, onError)}
            autoComplete="off"
            className="w-full"
          >
            <div className="">
              <div className=" rounded">
                {/* Profile Picture Section */}
                {/* <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Avatar
                      size={120}
                      src={profilePicturePreview}
                      icon={<UserOutlined />}
                      className="border-4 border-gray-200"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <ImgCrop
                        beforeCrop={beforeCrop}
                        modalProps={{
                          okButtonProps: {
                            className: "bg-primary",
                          },
                        }}
                        modalOk="Crop"
                        rotationSlider
                      >
                        <Upload
                          beforeUpload={handleProfilePictureChange}
                          showUploadList={false}
                          accept="image/jpeg,image/png"
                          maxCount={1}
                        >
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            className="bg-primary shadow-lg hover:shadow-xl"
                            size="small"
                          />
                        </Upload>
                      </ImgCrop>
                    </div>
                    {profilePicturePreview && (
                      <Button
                        type="text"
                        danger
                        shape="circle"
                        icon={<DeleteFilled />}
                        className="absolute -top-2 -right-2 bg-white shadow-md hover:bg-red-50"
                        size="small"
                        onClick={handleProfilePictureRemove}
                      />
                    )}
                  </div>
                </div> */}

                <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="First Name"
                        required
                        error={errors?.firstName?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="First Name"
                          status={errors?.firstName ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                  {/* <Controller
                    name="middleName"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Middle Name"
                        error={errors?.middleName?.message}
                        className="w-full"
                      >
                        <Input
                          placeholder="Middle Name"
                          status={errors?.middleName ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  /> */}
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Last Name"
                        required
                        error={errors?.lastName?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="Last Name"
                          status={errors?.lastName ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                </div>
                <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0 mt-4">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Email"
                        required
                        error={errors?.email?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="Email"
                          status={errors?.email ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Phone"
                        error={errors?.phone?.message}
                        className="w-full"
                      >
                        <div className="flex">
                          <Select
                            status={errors?.phone ? "error" : ""}
                            showSearch
                            popupClassName="w-48"
                            className={`rounded-r-none ant-input border border-gray-300 rounded-l w-full ${errors?.phone ? "border-danger" : ""
                              }`}
                            value={selectedCountry}
                            style={{ width: 250, borderTopRightRadius: 0, borderBottomRightRadius: 0, }}
                            onChange={(value) => {
                              setSelectedCountry(value);
                            }}
                            filterOption={(input, option) =>
                              (
                                option?.label?.toString().toLowerCase() ?? ""
                              ).includes(input.toLowerCase())
                            }
                            filterSort={(optionA, optionB) =>
                              (optionA?.label?.toString() ?? "")
                                .toLowerCase()
                                .localeCompare(
                                  (
                                    optionB?.label?.toString() ?? ""
                                  ).toLowerCase()
                                )
                            }
                            options={countryCodes}
                          />
                          <Input
                            {...field}
                            placeholder="Enter phone number"
                            className={`rounded-l-none ant-input border border-gray-300 rounded-r w-full ${errors?.phone ? "border-danger" : ""
                              }`}
                            onChange={(e) => {
                              // Allow only digits and basic formatting characters
                              const value = e.target.value.replace(/[^\d\-\s\(\)]/g, '');
                              field.onChange(value);
                            }}
                            value={field.value || ""}
                          />
                        </div>
                      </InputWrapper>
                    )}
                  />
                </div>
                <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0 mt-4">
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Role"
                        required
                        error={errors?.role?.message}
                        className="w-full"
                      >
                        <Select
                          className="w-full"
                          placeholder="Select Role"
                          status={errors?.role ? "error" : ""}
                          {...field}
                          options={roleOptions}
                          onChange={(value) => {
                            field.onChange(value);
                            // Clear skill and location when role changes
                            if (value === EnumRoles.Admin) {
                              setValue("skillId", "");
                              setValue("userLocations", []);
                            } else if (value === EnumRoles.Manager) {
                              setValue("skillId", "");
                            }
                          }}
                        />
                      </InputWrapper>
                    )}
                  />
                </div>
                {/* Conditional rendering based on role */}
                {selectedRole && selectedRole !== EnumRoles.Admin && (
                  <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0 mt-4">
                    {/* Show Skill field only for Staff role */}
                    {selectedRole === EnumRoles.Staff && (
                      <Controller
                        name="skillId"
                        control={control}
                        render={({ field }) => (
                          <InputWrapper
                            label="Skill"
                            required
                            error={errors?.skillId?.message}
                            className="w-full"
                          >
                            <Select
                              filterOption={false}
                              className="w-full"
                              showSearch
                              allowClear
                              // disabled={editMode === "detail"}
                              status={errors?.skillId ? "error" : ""}
                              {...field}
                              onSearch={debounce(
                                (value: any) =>
                                  setSkillCollection({
                                    ...skillCollection,
                                    search: value,
                                    searchFrom: ["name"],
                                  }),
                                1000
                              )}
                              loading={skills?.isLoading || skills?.isFetching}
                              notFoundContent={
                                <div className="w-full flex items-center justify-center">
                                  {skills?.isLoading || skills?.isFetching ? (
                                    <Spin size="small" />
                                  ) : (
                                    <Empty
                                      description={
                                        <div className="flex justify-center">
                                          <Button
                                            className="flex border-none  items-center space-x-1"
                                            size="small"
                                            // onClick={() =>
                                            //   setSkillModalOpen(true)
                                            // }
                                            icon={<PlusOutlined />}
                                          >
                                            Add
                                          </Button>
                                        </div>
                                      }
                                    />
                                  )}
                                </div>
                              }
                              options={skillOptions}
                            />
                          </InputWrapper>
                        )}
                      />
                    )}
                    {/* Show Location field for both Manager and Staff roles */}
                    {(selectedRole === EnumRoles.Manager || selectedRole === EnumRoles.Staff) && (
                      <Controller
                        name="userLocations"
                        control={control}
                        render={({ field }) => (
                          <InputWrapper
                            label="Location"
                            required
                            error={errors?.userLocations?.message}
                            className="w-full"
                          >
                            <Select
                              filterOption={false}
                              className="w-full"
                              showSearch
                              mode="multiple"
                              status={errors?.userLocations ? "error" : ""}
                              {...field}
                              onSearch={debounce(
                                (value: any) =>
                                  setLocationCollection({
                                    ...locationCollection,
                                    search: value,
                                    searchFrom: ["name", "key"],
                                  }),
                                1000
                              )}
                              loading={locations?.isLoading || locations?.isFetching}
                              notFoundContent={
                                <div className="w-full flex items-center justify-center">
                                  {locations?.isLoading || locations?.isFetching ? (
                                    <Spin size="small" />
                                  ) : (
                                    <Empty />
                                  )}
                                </div>
                              }
                              options={locationOptions}
                            />
                          </InputWrapper>
                        )}
                      />
                    )}
                  </div>
                )}
                <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0 mt-4">
                  {editMode === "new" && (
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <InputWrapper
                          label="Password"
                          required
                          error={errors?.password?.message}
                          className="w-full md:w-1/2"
                        >
                          <Input.Password
                            required
                            placeholder="Password"
                            status={errors?.password ? "error" : ""}
                            {...field}
                          />
                        </InputWrapper>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2 justify-end mt-4 gap-2">
              <Form.Item>
                <Button
                  htmlType="button"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    reset(defaultValue);
                    setProfilePictureFile(null);
                    setProfilePicturePreview(undefined);
                  }}
                >
                  Reset
                </Button>
              </Form.Item>
              {editMode === "detail" && (
                <>
                  <Form.Item>
                    <Button
                      type="primary"
                      className={`${user?.data?.archivedAt ? "bg-green-400" : "bg-danger"
                        } shadow-none rounded flex items-center`}
                      htmlType="button"
                      onClick={() =>
                        confirm({
                          title: `Warning`,
                          okButtonProps: {
                            className: `${user?.data?.archivedAt
                              ? "bg-green-400"
                              : "bg-danger"
                              } rounded shadow-none`,
                          },
                          cancelButtonProps: {
                            className: "shadow-none",
                          },
                          icon: <ExclamationCircleFilled />,
                          content: `Do you want to ${user?.data?.archivedAt ? "restore" : "delete"
                            }  ${user?.data?.firstName} ${user?.data?.lastName}`,
                          onOk() {
                            user?.data?.archivedAt
                              ? restoreUser(`${params.id}`)
                              : deleteUser(`${params.id}`);
                          },
                        })
                      }
                      loading={
                        archiveResponse?.isLoading || restoreResponse?.isLoading
                      }
                      icon={
                        user?.data?.archivedAt ? (
                          <RollbackOutlined />
                        ) : (
                          <DeleteOutlined />
                        )
                      }
                    >
                      {user?.data?.archivedAt ? "Restore" : "Delete"}
                    </Button>
                  </Form.Item>
                </>
              )}
              <Form.Item>
                <Button
                  type="primary"
                  className="bg-primary shadow-none rounded flex items-center"
                  htmlType="submit"
                  loading={
                    editMode === "new"
                      ? createResponse?.isLoading
                      : updateResponse?.isLoading
                  }
                  icon={<SaveOutlined />}
                >
                  {editMode === "new" ? "Save" : "Update"}
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Spin>
    </Card>
  );
}
