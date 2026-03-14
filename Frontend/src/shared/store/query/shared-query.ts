/* eslint-disable @typescript-eslint/no-explicit-any */
import { appApi } from "../../../store/app.api";


const dispatchQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getFile: builder.mutation<any, any>({
      query: (data: any) => ({
        url: `${import.meta.env.VITE_API}/get-file`,
        method: "post",
        data: data,
      }),
    }),
  }),
  overrideExisting: true,
});
export const { useGetFileMutation } = dispatchQuery;
