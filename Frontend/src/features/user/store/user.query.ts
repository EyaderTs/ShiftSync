/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import { User } from "@/models/user-model";
import { Collection, CollectionQuery } from "@/models/collection.model";
import { collectionQueryBuilder } from "@/shared/utility/collection-builder/collection-query-builder";
import { appApi } from "@/store/app.api";
import { USER_ENDPOINT } from "../user.endpoint";

let userCollection: CollectionQuery;
let userDetail: any;
const userQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, { id: string; includes?: string[] }>({
      query: (data: { id: string; includes?: string[] }) => ({
        url: `${USER_ENDPOINT.detail}/${data?.id}`,
        method: "get",
        params: collectionQueryBuilder({ includes: data?.includes }),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            userDetail = param;
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
    getUsers: builder.query<Collection<User>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: USER_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            userCollection = param;
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
    createUser: builder.mutation<User, User | FormData>({
      query: (newData: any) => ({
        url: `${USER_ENDPOINT.create}`,
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
              userQuery.util.updateQueryData(
                "getUsers",
                userCollection,
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
    updateUser: builder.mutation<User, User | FormData>({
      query: (newData: any) => ({
        url: `${USER_ENDPOINT.update}`,
        method: "patch",
        data: newData,
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              userQuery.util.updateQueryData(
                "getUsers",
                userCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((user) => {
                      if (user.userId === data.userId) return data;
                      else {
                        return user;
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
    archiveUser: builder.mutation<User, string>({
      query: (id: string) => ({
        url: `${USER_ENDPOINT.archive}/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              userQuery.util.updateQueryData(
                "getUsers",
                userCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((user) => {
                      if (user.userId === data.userId) return data;
                      else {
                        return user;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              userQuery.util.updateQueryData(
                "getUser",
                userDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data?.archivedAt;
                  }
                }
              )
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
    restoreUser: builder.mutation<User, string>({
      query: (id: string) => ({
        url: `${USER_ENDPOINT.restore}/${id}`,
        method: "POST",
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              userQuery.util.updateQueryData(
                "getUsers",
                userCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((user) => {
                      if (user.userId === data.userId)
                        return { ...data, archivedDate: null };
                      else {
                        return user;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              userQuery.util.updateQueryData(
                "getUser",
                userDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = "";
                  }
                }
              )
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
    deleteUser: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${USER_ENDPOINT.delete}/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              userQuery.util.updateQueryData(
                "getUsers",
                userCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.filter(
                      (user) => user.userId !== id
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
    getMyProfile: builder.query<User, void>({
      query: () => ({
        url: `${USER_ENDPOINT.user_profile}`,
        method: "GET",
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            //
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
  useLazyGetUserQuery,
  useLazyGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useArchiveUserMutation,
  useRestoreUserMutation,
  useLazyGetMyProfileQuery,
} = userQuery; 