/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import { Location } from "@/models/location-model";
import { Collection, CollectionQuery } from "@/models/collection.model";
import { collectionQueryBuilder } from "@/shared/utility/collection-builder/collection-query-builder";
import { appApi } from "@/store/app.api";
import { LOCATION_ENDPOINT } from "../location.endpoint";

let locationCollection: CollectionQuery;
let locationDetail: any;
const locationQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocation: builder.query<Location, { id: string; includes?: string[] }>({
      query: (data: { id: string; includes?: string[] }) => ({
        url: `${LOCATION_ENDPOINT.detail}/${data?.id}`,
        method: "get",
        params: collectionQueryBuilder({ includes: data?.includes }),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            locationDetail = param;
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    getLocations: builder.query<Collection<Location>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: LOCATION_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            locationCollection = param;
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    createLocation: builder.mutation<Location, Location>({
      query: (newData: any) => ({
        url: `${LOCATION_ENDPOINT.create}`,
        method: "post",
        data: newData,
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            notification.success({
              message: "Success",
              description: "Successfully created",
            });
            dispatch(
              locationQuery.util.updateQueryData(
                "getLocations",
                locationCollection,
                (draft) => {
                  if (data) {
                    draft.data.push(data);
                    draft.count += 1;
                  }
                }
              )
            );
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    updateLocation: builder.mutation<Location, any>({
      query: (newData: any) => ({
        url: `${LOCATION_ENDPOINT.update}`,
        method: "patch",
        data: newData,
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              locationQuery.util.updateQueryData(
                "getLocations",
                locationCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((location) => {
                      if (location.locationId === data.locationId) return data;
                      else {
                        return location;
                      }
                    });
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Successfully Updated",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    archiveLocation: builder.mutation<Location, string>({
      query: (id: string) => ({
        url: `${LOCATION_ENDPOINT.archive}/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              locationQuery.util.updateQueryData(
                "getLocations",
                locationCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((location) => {
                      if (location.locationId === data.locationId) return data;
                      else {
                        return location;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              locationQuery.util.updateQueryData("getLocation", locationDetail, (draft) => {
                if (data) {
                  draft.archivedAt = data?.archivedAt;
                }
              })
            );
            notification.success({
              message: "Success",
              description: "Successfully deleted",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    restoreLocation: builder.mutation<Location, string>({
      query: (id: string) => ({
        url: `${LOCATION_ENDPOINT.restore}/${id}`,
        method: "POST",
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              locationQuery.util.updateQueryData(
                "getLocations",
                locationCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((location) => {
                      if (location.locationId === data.locationId)
                        return { ...data, archivedDate: null };
                      else {
                        return location;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              locationQuery.util.updateQueryData("getLocation", locationDetail, (draft) => {
                if (data) {
                  draft.archivedAt = "";
                }
              })
            );
            notification.success({
              message: "Success",
              description: "Successfully restored",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    deleteLocation: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${LOCATION_ENDPOINT.delete}/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              locationQuery.util.updateQueryData(
                "getLocations",
                locationCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.filter(
                      (location) => location.locationId !== id
                    );
                    draft.count -= 1;
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Successfully Deleted",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useLazyGetLocationQuery,
  useLazyGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useArchiveLocationMutation,
  useRestoreLocationMutation,
} = locationQuery;
