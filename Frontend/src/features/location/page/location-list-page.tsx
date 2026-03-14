import { Button } from "antd";
import { useEffect, useState } from "react";
import { CollectionQuery, Order } from "../../../models/collection.model";
import {
  EntityConfig,
  entityViewMode,
} from "../../../models/entity-config.model";
import { Location } from "../../../models/location-model";
import EntityList from "../../../shared/component/entity-list/entity-list.component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";
import { useLocation, useParams } from "react-router-dom";
import { useLazyGetLocationsQuery } from "../store/location.query";

export default function LocationListPage() {
  const params = useParams();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");

  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  const [getLocations, locations] = useLazyGetLocationsQuery();

  useEffect(() => {
    getLocations(collection);
  }, [collection]);

  useEffect(() => {
    if (params?.id !== undefined) {
      setViewMode("detail");
    } else {
      setViewMode("list");
    }
  }, [setViewMode, params?.id]);

  const config: EntityConfig<Location> = {
    primaryColumn: {
      key: "name",
      name: "Location Name",
      render: (location: Location) => {
        return (
          <div className="flex wrap items-center space-x-1">
            <span className="cursor-pointer">{location?.name}</span>
          </div>
        );
      },
    },
    rootUrl: "/locations",
    identity: "locationId",
    visibleColumn: [
      {
        key: "name",
        name: "Location Name",
        render: (location: Location) => {
          return (
            <div className="flex wrap items-center space-x-1">
              <span className="cursor-pointer">{location?.name}</span>
            </div>
          );
        },
      },
      { key: "address", name: "Address" },
      { key: "timeZone", name: "Time Zone" },
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


  const items = locations.data?.data;
  const total = locations.data?.count;

  return (
    <div className="flex">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        tableKey="locations"
        showArchived={false}
        showSelector={false}
        showExport={false}
        title={"Locations"}
        detailTitle={<span className="cursor-pointer">Location Details</span>}
        newButtonText="New Location"
        total={total}
        collectionQuery={collection}
        itemsLoading={locations.isLoading}
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
              searchFrom: ["name", "timeZone"],
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
