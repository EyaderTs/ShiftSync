/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import { StaffAvailability } from "@/models/availability-model";
import { Collection, CollectionQuery } from "@/models/collection.model";
import { collectionQueryBuilder } from "@/shared/utility/collection-builder/collection-query-builder";
import { appApi } from "@/store/app.api";
import { AVAILABILITY_ENDPOINT } from "../availability.endpoint";

let availabilityCollection: CollectionQuery;
let availabilityDetail: any;

const availabilityQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailability: builder.query<StaffAvailability, { id: string; includes?: string[] }>({
      query: (data: { id: string; includes?: string[] }) => ({
        url: `${AVAILABILITY_ENDPOINT.detail}/${data?.id}`,
        method: "get",
        params: collectionQueryBuilder({ includes: data?.includes }),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            availabilityDetail = param;
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
    getAvailabilities: builder.query<Collection<StaffAvailability>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: AVAILABILITY_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            availabilityCollection = param;
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
    createAvailability: builder.mutation<StaffAvailability, StaffAvailability>({
      query: (newData: any) => ({
        url: `${AVAILABILITY_ENDPOINT.create}`,
        method: "post",
        data: newData,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            notification.success({
              message: "Success",
              description: "Availability successfully created",
            });
            dispatch(
              availabilityQuery.util.updateQueryData(
                "getAvailabilities",
                availabilityCollection,
                (draft) => {
                  if (data) {
                    draft.data.unshift(data);
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
    updateAvailability: builder.mutation<StaffAvailability, any>({
      query: (newData: any) => ({
        url: `${AVAILABILITY_ENDPOINT.update}`,
        method: "patch",
        data: newData,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              availabilityQuery.util.updateQueryData(
                "getAvailabilities",
                availabilityCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((availability) => {
                      if (availability.availabilityId === data.availabilityId) return data;
                      else {
                        return availability;
                      }
                    });
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Availability successfully updated",
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
    archiveAvailability: builder.mutation<StaffAvailability, string>({
      query: (id: string) => ({
        url: `${AVAILABILITY_ENDPOINT.archive}/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              availabilityQuery.util.updateQueryData(
                "getAvailabilities",
                availabilityCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((availability) => {
                      if (availability.availabilityId === data.availabilityId) return data;
                      else {
                        return availability;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              availabilityQuery.util.updateQueryData(
                "getAvailability",
                availabilityDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data?.archivedAt;
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Availability successfully archived",
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
    restoreAvailability: builder.mutation<StaffAvailability, string>({
      query: (id: string) => ({
        url: `${AVAILABILITY_ENDPOINT.restore}/${id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              availabilityQuery.util.updateQueryData(
                "getAvailabilities",
                availabilityCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((availability) => {
                      if (availability.availabilityId === data.availabilityId)
                        return { ...data, archivedAt: undefined };
                      else {
                        return availability;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              availabilityQuery.util.updateQueryData(
                "getAvailability",
                availabilityDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data.archivedAt;
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Availability successfully restored",
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
    deleteAvailability: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${AVAILABILITY_ENDPOINT.delete}/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            availabilityQuery.util.updateQueryData(
              "getAvailabilities",
              availabilityCollection,
              (draft) => {
                if (draft?.data) {
                  draft.data = draft.data.filter(
                    (availability) => availability.availabilityId !== id
                  );
                  draft.count -= 1;
                }
              }
            )
          );
          notification.success({
            message: "Success",
            description: "Availability successfully deleted",
          });
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
});

export const {
  useGetAvailabilityQuery,
  useLazyGetAvailabilityQuery,
  useGetAvailabilitiesQuery,
  useLazyGetAvailabilitiesQuery,
  useCreateAvailabilityMutation,
  useUpdateAvailabilityMutation,
  useArchiveAvailabilityMutation,
  useRestoreAvailabilityMutation,
  useDeleteAvailabilityMutation,
} = availabilityQuery;
