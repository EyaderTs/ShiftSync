/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import { Skill } from "@/models/skill-model";
import { Collection, CollectionQuery} from "@/models/collection.model"
import { collectionQueryBuilder } from "@/shared/utility/collection-builder/collection-query-builder";
import { appApi } from "@/store/app.api";
import { SKILL_ENDPOINT } from "../skill.endpoint";

let skillCollection: CollectionQuery;
let skillDetail: any;
const skillQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getSkill: builder.query<Skill, { id: string; includes?: string[] }>({
      query: (data: { id: string; includes?: string[] }) => ({
        url: `${SKILL_ENDPOINT.detail}/${data?.id}`,
        method: "get",
        params: collectionQueryBuilder({ includes: data?.includes }),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try { 
          const { data } = await queryFulfilled;
          if (data) {
            skillDetail = param;
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
          });
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    getSkills: builder.query<Collection<Skill>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: SKILL_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            skillCollection = param;
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
    createSkill: builder.mutation<Skill, Skill>({
      query: (newData: any) => ({
        url: `${SKILL_ENDPOINT.create}`,
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
              skillQuery.util.updateQueryData(
                "getSkills",
                skillCollection,
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
    updateSkill: builder.mutation<Skill, any>({
      query: (newData: any) => ({
        url: `${SKILL_ENDPOINT.update}`,
        method: "patch",
        data: newData,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              skillQuery.util.updateQueryData(
                "getSkills",
                skillCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((skill) => {
                      if (skill.skillId === data.skillId) return data;
                      else {
                        return skill;
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
    archiveSkill: builder.mutation<Skill, string>({
      query: (id: string) => ({
        url: `${SKILL_ENDPOINT.archive}/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              skillQuery.util.updateQueryData(
                "getSkills",
                skillCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((skill) => {
                      if (skill.skillId === data.skillId) return data;
                      else {
                        return skill;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              skillQuery.util.updateQueryData(
                "getSkill",
                skillDetail,
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
    restoreSkill: builder.mutation<Skill, string>({
      query: (id: string) => ({
        url: `${SKILL_ENDPOINT.restore}/${id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              skillQuery.util.updateQueryData(
                "getSkills",
                skillCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((skill) => {
                      if (skill.skillId === data.skillId)
                        return { ...data, archivedDate: null };
                      else {
                        return skill;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              skillQuery.util.updateQueryData(
                "getSkill",
                skillDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data.archivedAt;
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
    deleteSkill: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${SKILL_ENDPOINT.delete}/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            skillQuery.util.updateQueryData(
              "getSkills",
              skillCollection,
              (draft) => {
                if (draft?.data) {
                  draft.data = draft.data.filter(
                    (skill) => skill.skillId !== id
                  );
                  draft.count -= 1;
                }
              }
            )
          );
          notification.success({
            message: "Success",
            description: "Successfully deleted",
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
  useGetSkillQuery,
  useLazyGetSkillQuery,
  useGetSkillsQuery,
  useLazyGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useArchiveSkillMutation,
  useRestoreSkillMutation,
  useDeleteSkillMutation,
} = skillQuery; 