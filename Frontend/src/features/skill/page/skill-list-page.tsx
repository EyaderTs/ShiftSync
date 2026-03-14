import { Button } from "antd";
import { useEffect, useState } from "react";
import { CollectionQuery, Order } from "../../../models/collection.model";
import {
  EntityConfig,
  entityViewMode,
} from "../../../models/entity-config.model";
import { Skill } from "../../../models/skill-model";
import EntityList from "../../../shared/component/entity-list/entity-list.component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";
import { useLocation, useParams } from "react-router-dom";
import { useLazyGetSkillsQuery } from "../store/skill.query";

export default function SkillListPage() {
  const params = useParams();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");

  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  const [getSkills, skills] = useLazyGetSkillsQuery();

  useEffect(() => {
    getSkills(collection);
  }, [collection]);

  useEffect(() => {
    if (params?.id !== undefined) {
      setViewMode("detail");
    } else {
      setViewMode("list");
    }
  }, [setViewMode, params?.id]);

  const config: EntityConfig<Skill> = {
    primaryColumn: {
      key: "name",
      name: "Skill Name",
      render: (skill: Skill) => {
        return (
          <div className="flex wrap items-center space-x-1">
            <span className="cursor-pointer">{skill?.name}</span>
          </div>
        );
      },
    },
    rootUrl: "/skills",
    identity: "skillId",
    visibleColumn: [
      {
        key: "name",
        name: "Skill Name",
        render: (skill: Skill) => {
          return (
            <div className="flex wrap items-center space-x-1">
              <span className="cursor-pointer">{skill?.name}</span>
            </div>
          );
        },
      },
      { key: "description", name: "Description" },
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


  const items = skills.data?.data;
  const total = skills.data?.count;
  return (
    <div className="flex">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        tableKey="skills"
        showArchived={false}
        showSelector={false}
        showExport={false}
        title={"Skills"}
        detailTitle={
          <span className="cursor-pointer">Skill Details</span>
        }
        newButtonText="New Skill"
        total={total}
        collectionQuery={collection}
        itemsLoading={skills.isLoading}
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
              searchFrom: [
                "name",
                "description"
              ],
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