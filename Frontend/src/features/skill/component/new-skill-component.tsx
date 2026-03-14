import {
  SaveOutlined, DeleteOutlined,
  RollbackOutlined,
  ClearOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button, Collapse,
  Form,
  Input,
  Modal,
  Select,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { Skill } from "@/models/skill-model";
import Card from "../../../shared/component/Card/card-component";
import InputWrapper from "../../../shared/component/input-wrapper/input-wrapper";
import {
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useArchiveSkillMutation,
  useDeleteSkillMutation,
  useLazyGetSkillQuery,
  useRestoreSkillMutation,
} from "@/features/skill/store/skill.query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface Props {
  editMode: "new" | "detail";
  onCreating?: (isCreating: boolean) => void;
}
const { Panel } = Collapse;
const { confirm } = Modal;

const schema = yup
  .object<Skill>({
    name: yup.string().required("Name is required"),
    description: yup.string().required("Description is required"),
  })
  .required();

const defaultValue: Partial<Skill> = {
  name: "",
  description: "",
};

export default function NewSkillComponent(props: Props) {
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

  const [createSkill, createResponse] = useCreateSkillMutation();
  const [updateSkill, updateResponse] = useUpdateSkillMutation();
  const [archiveSkill, archiveResponse] = useArchiveSkillMutation();
  const [deleteSkill, deleteResponse] = useDeleteSkillMutation();
  const [restoreSkill, restoreResponse] = useRestoreSkillMutation();

  const [getSkill, skill] = useLazyGetSkillQuery();

  function onSubmit(data: any) {
    if (editMode === "new") {
      onCreating?.(true);
      createSkill({
        ...data,
      }).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          if (!onCreating) {
            navigate(`/skills/detail/${response?.data?.skillId}`);
          }
        }
      });
    } else {
      updateSkill({
        ...data,
        skillId: `${params.id}`,
      }).then((response: any) => {
        if (response?.data) {
          navigate(`/skills/detail/${response?.data?.skillId}`);
        }
      });
    }
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };

  useEffect(() => {
    if (params?.id !== "new") {
      getSkill({
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
      title={
        editMode === "detail" ? skill?.data?.name : "New Skill"
      }
    >
      <Spin spinning={skill.isLoading || skill.isFetching}>
        <div className="w-full flex justify-center">
          <Form
            name="Skill form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={handleSubmit(onSubmit, onError)}
            autoComplete="off"
            className="w-full"
          >
            <div className="rounded">
              <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <InputWrapper
                      label="Skill Name"
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
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <InputWrapper
                      label="Description"
                      required
                      error={errors?.description?.message}
                      className="w-full"
                    >
                      <Input
                        required
                        placeholder="Description"
                        status={errors?.description ? "error" : ""}
                        {...field}
                      />
                    </InputWrapper>
                  )}
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-4">
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
                <Form.Item>
                  <Button
                    type="primary"
                    className={`${skill?.data?.archivedAt
                      ? "bg-green-400"
                      : "bg-danger"
                      } shadow-none rounded flex items-center`}
                    htmlType="button"
                    onClick={() =>
                      confirm({
                        title: `Warning`,
                        okButtonProps: {
                          className: `${skill?.data?.archivedAt
                            ? "bg-green-400"
                            : "bg-danger"
                            } shadow-none`,
                        },
                        cancelButtonProps: {
                          className: "shadow-none",
                        },
                        icon: <ExclamationCircleFilled />,
                        content: `Are you sure you want to ${skill?.data?.archivedAt ? "restore" : "delete"
                          } this budget type?`,
                        onOk() {
                          skill?.data?.archivedAt
                            ? restoreSkill(`${params.id}`)
                            : deleteSkill(`${params.id}`);
                        },
                      })
                    }
                    loading={deleteResponse.isLoading || restoreResponse.isLoading}
                  >
                    {skill?.data?.archivedAt ? "Restore" : "Delete"}
                  </Button>
                </Form.Item>
              )}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={createResponse.isLoading || updateResponse.isLoading}
                >
                  {editMode === "detail" ? "Update" : "Save"}
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Spin>
    </Card>
  );
} 