import { Suspense, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import DetailsPage from "../../../shared/component/details-page/details-page.component";
import {
  useLazyGetSkillsQuery,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useRestoreSkillMutation,
  useLazyGetSkillQuery,
} from "../store/skill.query";
import dateFormat from "dateformat";
import {
  Button,
  Modal,
  Spin,
  Tabs,
  message,
  Popconfirm
} from "antd";
import { DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { ItemGuard } from "../../../shared/auth/component/auth-guard";
import { EnumRoles } from "../../../shared/constants/enum/app.enum";

export default function SkillDetailComponent() {
  const params = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { confirm } = Modal;

  const [getSkill, skill] = useLazyGetSkillQuery();
  const [updateSkill, updatedSkill] = useUpdateSkillMutation();
  const [deleteSkill, deleteResponse] = useDeleteSkillMutation();
  const [restoreSkill, restoreResponse] = useRestoreSkillMutation();

  useEffect(() => {
    getSkill({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  const data = [
    {
      key: "1",
      label: "Name",
      value: skill?.data?.name ?? "",
    },
    {
      key: "2",
      label: "Description",
      value: skill?.data?.description ?? "",
    },
  ];

  const profileData = {
    image: "/skill-placeholder.png", // You can replace with a budget type icon
    name: skill?.data?.name ?? "",
    type: "Budget Type",
  };

  const config = {
    editUrl: `/skills/edit/${params?.id}`,
    isProfile: true,
    title: skill?.data?.name ?? "",
    widthClass: "w-full",
  };

  return (
    <div className="w-full flex-col mx-6 space-y-4">
      {contextHolder}
      <Tabs
        className="px-2"
        items={[
          {
            key: "skill",
            label: "Budget Type Details",
            children: (
              <DetailsPage
                dataSource={[{ title: "Basic Information", source: data }]}
                config={config}
                isLoading={skill.isLoading}
              />
            ),
          },
        ]}
      />
    </div>
  );
} 