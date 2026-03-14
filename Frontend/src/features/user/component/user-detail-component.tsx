import { Suspense, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import DetailsPage from "../../../shared/component/details-page/details-page.component";
import {
  useLazyGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from "../store/user.query";
import dateFormat from "dateformat";
import { Button, Modal, Spin, Tabs, message, Popconfirm } from "antd";
import { DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { ItemGuard } from "../../../shared/auth/component/auth-guard";
import { EnumRoles } from "../../../shared/constants/enum/app.enum";

export default function UserDetailComponent() {
  const params = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { confirm } = Modal;

  const [getUser, user] = useLazyGetUserQuery();
  const [updateUser, updatedUser] = useUpdateUserMutation();
  const [deleteUser, deleteResponse] = useDeleteUserMutation();
  const [restoreUser, restoreResponse] = useRestoreUserMutation();

  useEffect(() => {
    getUser({
      id: `${params?.id}`,
      includes: ["userLocations", "userLocations.location", "skill"],
    });
  }, [params?.id]);

  const data = [
    {
      key: "1",
      label: "First Name",
      value: user?.data?.firstName ?? "",
    },
    // {
    //   key: "2",
    //   label: "Middle Name",
    //   value: user?.data?.middleName ?? "",
    // },
    {
      key: "3",
      label: "Last Name",
      value: user?.data?.lastName ?? "",
    },
    {
      key: "4",
      label: "Email",
      value: user?.data?.email ?? "",
    },
    {
      key: "5",
      label: "Phone",
      value: user?.data?.phone ?? "",
    },
    {
      key: "6",
      label: "Skill",
      value: user?.data?.skill?.name ?? "",
    },
    {
      key: "6",
      label: "Status",
      value: user?.data?.isActive ? "Active" : "Inactive",
    },
  ];

  const profileData = {
    image: `${user?.data?.profilePicture ?? "/user-placeholder.png"}`,
    name: `${user?.data?.firstName} ${user?.data?.lastName}`,
    type: "User",
    code: user?.data?.email ?? "",
  };

  const config = {
    editUrl: `/users/edit/${params?.id}`,
    isProfile: true,
    title: `${user?.data?.firstName} ${user?.data?.lastName}`,
    widthClass: "w-full",
  };

  return (
    <div className="w-full flex-col mx-6 space-y-4">
      {contextHolder}
      <Tabs
        className="px-2"
        items={[
          {
            key: "user",
            label: "User Details",
            children: (
              <DetailsPage
                dataSource={[{ title: "Basic Information", source: data }]}
                config={config}
                isLoading={user.isLoading}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
