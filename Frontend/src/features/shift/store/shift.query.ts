/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import { Shift } from "@/models/shift-model";
import { Collection, CollectionQuery } from "@/models/collection.model";
import { collectionQueryBuilder } from "@/shared/utility/collection-builder/collection-query-builder";
import { appApi } from "@/store/app.api";
import { SHIFT_ENDPOINT } from "../shift.endpoint";

let shiftCollection: CollectionQuery;
let shiftDetail: any;

const shiftQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getShift: builder.query<Shift, { id: string; includes?: string[] }>({
      query: (data: { id: string; includes?: string[] }) => ({
        url: `${SHIFT_ENDPOINT.detail}/${data?.id}`,
        method: "get",
        params: collectionQueryBuilder({ includes: data?.includes }),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            shiftDetail = param;
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
    getShifts: builder.query<Collection<Shift>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: SHIFT_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            shiftCollection = param;
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
    createShift: builder.mutation<Shift, Shift>({
      query: (newData: any) => ({
        url: `${SHIFT_ENDPOINT.create}`,
        method: "post",
        data: newData,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            notification.success({
              message: "Success",
              description: "Shift successfully created",
            });
            dispatch(
              shiftQuery.util.updateQueryData(
                "getShifts",
                shiftCollection,
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
    updateShift: builder.mutation<Shift, any>({
      query: (newData: any) => ({
        url: `${SHIFT_ENDPOINT.update}`,
        method: "patch",
        data: newData,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              shiftQuery.util.updateQueryData(
                "getShifts",
                shiftCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((shift) => {
                      if (shift.shiftId === data.shiftId) return data;
                      else {
                        return shift;
                      }
                    });
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Shift successfully updated",
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
    archiveShift: builder.mutation<Shift, string>({
      query: (id: string) => ({
        url: `${SHIFT_ENDPOINT.archive}/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              shiftQuery.util.updateQueryData(
                "getShifts",
                shiftCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((shift) => {
                      if (shift.shiftId === data.shiftId) return data;
                      else {
                        return shift;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              shiftQuery.util.updateQueryData(
                "getShift",
                shiftDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data?.archivedAt;
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Shift successfully archived",
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
    restoreShift: builder.mutation<Shift, string>({
      query: (id: string) => ({
        url: `${SHIFT_ENDPOINT.restore}/${id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              shiftQuery.util.updateQueryData(
                "getShifts",
                shiftCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((shift) => {
                      if (shift.shiftId === data.shiftId) return data;
                      else {
                        return shift;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              shiftQuery.util.updateQueryData(
                "getShift",
                shiftDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data?.archivedAt;
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Shift successfully restored",
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
    deleteShift: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `${SHIFT_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            shiftQuery.util.updateQueryData(
              "getShifts",
              shiftCollection,
              (draft) => {
                draft.data = draft?.data?.filter(
                  (shift) => shift.shiftId !== param
                );
                draft.count -= 1;
              }
            )
          );
          notification.success({
            message: "Success",
            description: "Shift successfully deleted",
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
    publishShift: builder.mutation<Shift, string>({
      query: (id: string) => ({
        url: `${SHIFT_ENDPOINT.publish}/${id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              shiftQuery.util.updateQueryData(
                "getShifts",
                shiftCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((shift) => {
                      if (shift.shiftId === data.shiftId) return data;
                      else {
                        return shift;
                      }
                    });
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Shift successfully published",
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
    assignStaff: builder.mutation<any, { shiftId: string; userIds: string[] }>({
      query: (data: { shiftId: string; userIds: string[] }) => ({
        url: SHIFT_ENDPOINT.assignStaff,
        method: "POST",
        data: data,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            // Refresh the shifts list to get updated assignment counts
            dispatch(
              shiftQuery.util.invalidateTags(['Shift'] as any)
            );
            
            if (data.success > 0) {
              notification.success({
                message: "Success",
                description: `Successfully assigned ${data.success} staff member(s) to the shift${data.failed > 0 ? `. ${data.failed} assignment(s) failed.` : ''}`,
              });
            }
            
            if (data.errors && data.errors.length > 0) {
              // Show first error in detail
              notification.warning({
                message: "Assignment Issues",
                description: data.errors[0],
                duration: 6,
              });
            }
          }
        } catch (error: any) {
          notification.error({
            message: "Assignment Failed",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error assigning staff. Please try again.",
            duration: 6,
          });
        }
      },
    }),
  }),
});

export const {
  useGetShiftQuery,
  useLazyGetShiftQuery,
  useGetShiftsQuery,
  useLazyGetShiftsQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useArchiveShiftMutation,
  useRestoreShiftMutation,
  useDeleteShiftMutation,
  usePublishShiftMutation,
  useAssignStaffMutation,
} = shiftQuery;

export default shiftQuery;
