import {
  SaveOutlined,
  DeleteOutlined,
  RollbackOutlined,
  ClearOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Collapse, Form, Input, Modal, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { Location } from "@/models/location-model";
import Card from "../../../shared/component/Card/card-component";
import InputWrapper from "../../../shared/component/input-wrapper/input-wrapper";
import {
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useArchiveLocationMutation,
  useDeleteLocationMutation,
  useLazyGetLocationQuery,
  useRestoreLocationMutation,
} from "@/features/location/store/location.query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { EnumTimeZones } from "@/shared/constants/enum/app.enum";

dayjs.extend(customParseFormat);

interface Props {
  editMode: "new" | "detail";
  onCreating?: (isCreating: boolean) => void;
}

const { Panel } = Collapse;
const { confirm } = Modal;

const schema = yup
  .object<Location>({
    name: yup.string().required("Name is required"),
    address: yup.string().required("Address is required"),
    timeZone: yup.string().required("Time Zone is required"),
  })
  .required();

const defaultValue: Location = {
  name: "",
  address: "",
  timeZone: "",
};

const timeZoneOptions = [
  { value: EnumTimeZones.NewYork, label: "America/New_York (Eastern Time)" },
  { value: EnumTimeZones.LosAngeles, label: "America/Los_Angeles (Pacific Time)" },
];

export default function NewLocationComponent(props: Props) {
  const params = useParams();
  const navigate = useNavigate();
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
  });

  const [createLocation, createResponse] = useCreateLocationMutation();
  const [updateLocation, updateResponse] = useUpdateLocationMutation();
  const [archiveLocation, archiveResponse] = useArchiveLocationMutation();
  const [deleteLocation, deleteResponse] = useDeleteLocationMutation();
  const [restoreLocation, restoreResponse] = useRestoreLocationMutation();
  const [getLocation, location] = useLazyGetLocationQuery();

  function onSubmit(data: any) {
    if (editMode === "new") {
      onCreating?.(true);
      createLocation({
        ...data,
      }).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          if (!onCreating) {
            navigate(`/locations/detail/${response?.data?.locationId}`);
          }
        }
      });
    } else {
      updateLocation({
        ...data,
        locationId: `${params.id}`,
      }).then((response: any) => {
        if (response?.data) {
          navigate(`/locations/detail/${response?.data?.locationId}`);
        }
      });
    }
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };

  useEffect(() => {
    if (params?.id !== "new") {
      getLocation({
        id: `${params?.id}`,
      }).then((response: any) => {
        if (response?.data) {
          reset({
            ...response?.data,
          });
        }
      });
    } else {
      reset(defaultValue);
    }
  }, [params.id]);

  return (
    <Card
      className="w-full"
      title={editMode === "detail" ? location?.data?.name : "New Location"}
    >
      <Spin spinning={location.isLoading || location.isFetching}>
        <div className="w-full flex justify-center">
          <Form
            name="Location form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={handleSubmit(onSubmit, onError)}
            autoComplete="off"
            className="w-full"
          >
            <div className="">
              <div className=" rounded">
                <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Name"
                        required
                        error={errors?.name?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="Name"
                          status={errors?.name ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Address"
                        required
                        error={errors?.address?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="Address"
                          status={errors?.address ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <Controller
                    name="timeZone"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Time Zone"
                        required
                        error={errors?.timeZone?.message}
                        className="w-full md:w-1/2"
                      >
                        <Select
                          className="w-full"
                          placeholder="Select Time Zone"
                          status={errors?.timeZone ? "error" : ""}
                          {...field}
                          options={timeZoneOptions}
                        />
                      </InputWrapper>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 justify-end mt-4 gap-2">
              <Form.Item>
                <Button
                  htmlType="button"
                  icon={<ClearOutlined />}
                  onClick={() => reset(defaultValue)}
                >
                  Reset
                </Button>
              </Form.Item>
              {editMode === "detail" && (
                <>
                  <Form.Item>
                    <Button
                      type="primary"
                      className={`${location?.data?.archivedAt ? "bg-green-400" : "bg-danger"
                        } shadow-none rounded flex items-center`}
                      htmlType="button"
                      onClick={() =>
                        confirm({
                          title: `Warning`,
                          okButtonProps: {
                            className: `${location?.data?.archivedAt
                              ? "bg-green-400"
                              : "bg-danger"
                              } rounded shadow-none`,
                          },
                          cancelButtonProps: {
                            className: "shadow-none",
                          },
                          icon: <ExclamationCircleFilled />,
                          content: `Do you want to ${location?.data?.archivedAt ? "restore" : "delete"
                            }  ${location?.data?.name}`,
                          onOk() {
                            location?.data?.archivedAt
                              ? restoreLocation(`${params.id}`)
                              : deleteLocation(`${params.id}`);
                          },
                        })
                      }
                      loading={
                        archiveResponse?.isLoading || restoreResponse?.isLoading
                      }
                      icon={
                        location?.data?.archivedAt ? (
                          <RollbackOutlined />
                        ) : (
                          <DeleteOutlined />
                        )
                      }
                    >
                      {location?.data?.archivedAt ? "Restore" : "Delete"}
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
