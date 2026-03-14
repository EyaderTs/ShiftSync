import { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

let tokenRefreshed = true;

const refreshToken = async () => {
  tokenRefreshed = false;
  const config: AxiosRequestConfig = {
    url: `${import.meta.env.VITE_API}/auth/refresh-token`,
    method: "get",
    headers: {
      "x-refresh-token": localStorage.getItem("refreshToken") ?? "",
      refresh_token: localStorage.getItem("refreshToken") ?? "",
    },
  };
  try {
    const { data } = await axios(config);
    tokenRefreshed = true;
    localStorage.setItem("accessToken", data?.token);
    return true;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 403 || err.response?.status === 401) {
      localStorage.clear();
      window.location.href = `${window.location.origin}/login`;
    }
    return false;
  }
};

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" }
  ): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      headers?: AxiosRequestConfig["headers"];
      params?: AxiosRequestConfig["params"];
      responseType?: AxiosRequestConfig["responseType"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers, responseType }) => {
    try {
      // Check if data is FormData - if so, don't set Content-Type header
      const isFormData = data instanceof FormData;
      
      const config: AxiosRequestConfig = {
        url: baseUrl + url,
        method: method,
        data: data,
        params: params,
        responseType: responseType,
        headers: {
          ...headers,
          Authorization: `Bearer ${
            localStorage.accessToken ? localStorage.accessToken : ""
          }`,
          // Only set Content-Type if not FormData (browser will set it automatically for FormData)
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
      };

      const result = await axios(config);
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      if (err.response?.status === 401) {
        // Try to refresh token   
      await refreshToken();
      const result = await axios({
        ...err.config,
        headers: {
          Authorization: `Bearer ${await localStorage.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return { data: result.data };
    }
    return {
      error: { status: err.response?.status, data: err.response?.data },
    };
    }
  };
