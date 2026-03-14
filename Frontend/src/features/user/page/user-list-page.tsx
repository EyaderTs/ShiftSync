import { Button } from "antd";
import { useEffect, useState } from "react";
import { CollectionQuery, Order } from "../../../models/collection.model";
import {
  EntityConfig,
  entityViewMode,
} from "../../../models/entity-config.model";
import { User } from "../../../models/user-model";
import EntityList from "../../../shared/component/entity-list/entity-list.component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";
import { useLocation, useParams } from "react-router-dom";
import { useLazyGetUsersQuery } from "../store/user.query";

export default function UserListPage() {
  const params = useParams();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");

  const [getUsers, users] = useLazyGetUsersQuery();
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
    includes: ["skill"],
  });

  useEffect(() => {
    getUsers(collection);
  }, [collection]);

  useEffect(() => {
    if (params?.id !== undefined) {
      setViewMode("detail");
    } else {
      setViewMode("list");
    }
  }, [setViewMode, params?.id]);

  const config: EntityConfig<User> = {
    primaryColumn: {
      key: "firstName",
      name: "User Name",
      render: (user: User) => {
        return (
          <div className="flex wrap items-center space-x-1">
            <span className="cursor-pointer">{`${user?.firstName} ${user?.lastName}`}</span>
          </div>
        );
      },
    },
    rootUrl: "/users",
    identity: "userId",
    visibleColumn: [
      {
        key: "firstName",
        name: "First Name",
        render: (user: User) => {
          return (
            <div className="flex wrap items-center space-x-1">
              <span className="cursor-pointer">{user?.firstName}</span>
            </div>
          );
        },
      },
      { key: "lastName", name: "Last Name" },
      { key: "email", name: "Email" },
      {
        key: ["skill", "name"],
        name: "Skill",
        render: (user: User) => {
          return (
            <div className="flex wrap items-center space-x-1">
              <span className="cursor-pointer">
                {user?.skill?.name ?? "---"}
              </span>
            </div>
          );
        },
      },
      { key: "role", name: "Role" },
      { key: "createdAt", name: "Created At", isDate: true },
    ],

    // filter: [
    //   [
    //     {
    //       field: "isActive",
    //       name: "Active",
    //       operator: "=",
    //       value: true,
    //     },
    //     {
    //       field: "isActive",
    //       name: "Inactive",
    //       operator: "=",
    //       value: false,
    //     },
    //   ],
    // ],
  };

  const items = users.data?.data;
  const total = users.data?.count;
  return (
    <div className="flex">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        tableKey="users"
        showArchived={false}
        showSelector={false}
        showExport={false}
        title={"Users"}
        detailTitle={<span className="cursor-pointer">User Details</span>}
        newButtonText="New User"
        total={total}
        collectionQuery={collection}
        itemsLoading={users.isLoading}
        config={config}
        items={items}
        initialPage={1}
        defaultPageSize={collection.top}
        pageSize={[20, 30, 50, 100]}
        onPaginationChange={(skip: number, top: number) => {
          const after = (skip - 1) * top;
          setCollection({ ...collection, skip: after, top: top });
        }}
        onSearch={(data: any) => {
          if (data === "") {
            setCollection({
              ...collection,
              search: "",
              searchFrom: [],
            });
          } else {
            setCollection({
              ...collection,
              search: data,
              searchFrom: ["firstName", "lastName", "email", "phone"],
            });
          }
        }}
        // onFilterChange={(data: any) => {
        //   if (collection?.filter || data.length > 0) {
        //     setCollection({ ...collection, filter: data });
        //   }
        // }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
      />
    </div>
  );
}
