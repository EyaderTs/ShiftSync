import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Divider, Empty, Image, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { BsPencilFill } from "react-icons/bs";
import { MdVerified } from "react-icons/md";

import DetailsPageSkeleton from "./details-page-skeleton.component";
import dateFormat from "dateformat";

const { Title, Text } = Typography;

export interface DataType {
  key: string;
  label: string;
  value: any;
  type?: "string" | "date" | "number" | "boolean";
}

const columns: ColumnsType<DataType> = [
  {
    title: "Property",
    dataIndex: "label",
    rowScope: "row",
    width: "md:w-1/3 w-3/5",
  },
  {
    title: "Value",
    dataIndex: "value",
    render: (value, record) => {
      if (record.type === "date") {
        return dateFormat(value, "mmmm dS, yyyy ");
      }

      return value;
    },
  },
];

interface ProfileHeaderDataType {
  image?: string | false;
  name?: any;
  type?: any;
  address?: string;
  phone?: string;
  email?: string;
  isVerified?: boolean;
}

interface ProfileHeaderProps {
  profile: ProfileHeaderDataType;
  editUrl: string;
  hideEditButton: boolean;
  children?: ReactNode;
}

export interface DetailsConfig {
  isProfile: boolean;
  title: any;
  editUrl?: string;
  widthClass?: string;
  hideEditButton?: boolean;
}

interface Props {
  dataSource: Array<{
    title: string;
    source: DataType[];
  }>;
  config: DetailsConfig;
  profileData?: ProfileHeaderDataType;
  additionalActions?: ReactNode;
  isLoading: boolean;
}

export default function DetailsPage(props: Props): React.ReactElement {
  const { dataSource, profileData, additionalActions, config, isLoading } =
    props;
  const {
    isProfile,
    title,
    editUrl = "",
    widthClass = "max-w-2xl",
    hideEditButton = false,
  } = config;

  if (isLoading) {
    return (
      <DetailsPageSkeleton showProfile={isProfile} widthClass={widthClass} />
    );
  }

  if (!isLoading && dataSource.length === 0) {
    return <Empty />;
  }

  return (
    <div className={`p-4 items-center  ${widthClass}`}>
      {isProfile && profileData !== undefined ? (
        <ProfileHeader
          profile={profileData}
          editUrl={editUrl}
          hideEditButton={hideEditButton}
        >
          {additionalActions}
        </ProfileHeader>
      ) : (
        <div className="flex flex-col md:flex-row gap-2 w-full justify-between">
          <Title level={4} className="">
            {title}
          </Title>
          {!hideEditButton && <EditButton editUrl={editUrl} />}
          <div className="flex gap-2">{additionalActions}</div>
        </div>
      )}

      <Divider />

      {dataSource.map(({ title, source }) => (
        // <section className="mb-8 last:mb-0" key={title}>
        //   <Title level={5}>{title}</Title>
        //   <Table
        //     dataSource={source}
        //     columns={columns}
        //     showHeader={false}
        //     bordered
        //     pagination={false}
        //     size="middle"
        //   />
        // </section>
      <section 
        className="mb-8 last:mb-0 bg-white rounded-lg shadow-sm" 
        key={title}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <Title level={5} className="!mb-0 text-gray-700">
            {title}
          </Title>
        </div>
        <div className="p-6 mx-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
            {source.map((item) => (
              <div key={item.key} className="flex flex-col">
                <p className="text-sm text-gray-700 mb-1">
                  {item.label}
                </p>
                <p className="text-base text-gray-800 font-medium">
                  {item.type === "date" 
                    ? dateFormat(item.value, "mmmm dS, yyyy")
                    : item.type === "boolean"
                    ? item.value ? "Yes" : "No"
                    : item.value || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ))}
    </div>
  );
}

function ProfileHeader(props: ProfileHeaderProps): React.ReactElement {
  const { profile, editUrl, children = null, hideEditButton } = props;
  const { image, name, type, address, phone, email, isVerified } = profile;

  return (
    <section
      id="profile-header"
      className="flex gap-2 bg-fuchsia-50/60 p-4 rounded-lg"
    >
      <div className="flex flex-col md:flex-row gap-2 w-full justify-between">
      {image !== false && (
        <div className="w-24 h-24 flex-shrink-0 bg-gray-200 flex items-center justify-center rounded-full">
          <Image className="rounded-full" src={image} />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-0.5">
          {name}
          {/* {isVerified && <MdVerified color="slateblue" />} */}
          {/* { <MdVerified color="slateblue" />} */}
        </h1>
        <h2 className="text-xl">{type}</h2>

        <div className="mt-3">
          <Text className="block">{address}</Text>
          <Text className="block">{phone}</Text>
          <Text className="block">{email}</Text>
        </div>
      </div>

      <div className="ml-auto self-start flex flex-wrap items-center gap-2">
        {!hideEditButton && <EditButton editUrl={editUrl} />}
        {children}
      </div>
      </div>
    </section>
  );
}

function EditButton({ editUrl }: { editUrl: string }): React.ReactElement {
  const navigate = useNavigate();

  return (
    <Button
      shape="round"
      icon={<BsPencilFill size={12} />}
      className="w-max md:ml-auto flex items-center gap-0.5 bg-white"
      onClick={() => {
        navigate(editUrl);
      }}
    >
      Edit
    </Button>
  );
}
