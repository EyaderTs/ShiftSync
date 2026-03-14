import { Suspense, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import DetailsPage from "../../../shared/component/details-page/details-page.component";
import {
  useLazyGetLocationQuery,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useRestoreLocationMutation,
} from "../store/location.query";
import dateFormat from "dateformat";
import { Button, Modal, Spin, Tabs, message, Popconfirm } from "antd";
import { DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { ItemGuard } from "../../../shared/auth/component/auth-guard";
import { EnumRoles } from "../../../shared/constants/enum/app.enum";

export default function LocationDetailComponent() {
  const params = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { confirm } = Modal;

  const [getLocation, location] = useLazyGetLocationQuery();
  const [updateLocation, updatedLocation] = useUpdateLocationMutation();
  const [deleteLocation, deleteResponse] = useDeleteLocationMutation();
  const [restoreLocation, restoreResponse] = useRestoreLocationMutation();

  useEffect(() => {
    getLocation({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  const data = [
    {
      key: "1",
      label: "Name",
      value: location?.data?.name ?? "",
    },
    {
      key: "2",
      label: "Address",
      value: location?.data?.address ?? "",
    },
    {
      key: "3",
      label: "Time Zone",
      value: location?.data?.timeZone ?? "",
    },
  ];

  const profileData = {
    image: "/location-placeholder.png",
    name: location?.data?.name ?? "",
    type: "Location",
    address: location?.data?.address ?? "",
    timeZone: location?.data?.timeZone ?? "",
  };

  const config = {
    editUrl: `/locations/edit/${params?.id}`,
    isProfile: true,
    title: location?.data?.name ?? "",
    widthClass: "w-full",
  };



  return (
    <div className="w-full flex-col mx-6 space-y-4">
      {contextHolder}
      <Tabs
        className="px-2"
        items={[
          {
            key: "location",
            label: "Location Details",
            children: (
              <DetailsPage
                dataSource={[{ title: "Basic Information", source: data }]}
                config={config}
                isLoading={location.isLoading}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
