/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { store } from "../../../store/app.store";

import { setLoading } from "../auth-slice/auth-slice";
import { notification } from "antd";
export let loading = false;

async function getAccessToken(account: any) {
  store.dispatch(setLoading(true));
  try{
    const response = await axios.post(`${import.meta.env.VITE_API}/auth/login`, account
    );
    localStorage.setItem("accessToken", response.data?.accessToken);
    localStorage.setItem("refreshToken", response.data?.refreshToken);
    localStorage.setItem("userInfo", JSON.stringify(response.data?.profile));
    store.dispatch(setLoading(false));
    return response.data;
  }
  catch(error:any){
    store.dispatch(setLoading(false));
    if (error.response) {
      notification.error({
        message: "Error",
        description: error.response.data.message,
      });
    } else if (error.request) {
      notification.error({
        message: "Error",
        description: "Check your internet connection",
      });
    } else {
      console.log("Error", error.message);
    }
  }
 
//  return await axios
//     .post(`${import.meta.env.VITE_API}/auth/login`, account)
//     .then((response) => {
//       localStorage.setItem("accessToken", response.data?.accessToken);
//       localStorage.setItem("refreshToken", response.data?.refreshToken);
//       localStorage.setItem("userInfo", JSON.stringify(response.data?.profile));
//       return response.data;
//     })
//     .catch(function (error) {
//       store.dispatch(setLoading(false));
//       if (error.response) {
//         notification.error({
//           message: "Error",
//           description: error.response.data.message,
//         });
//       } else if (error.request) {
//         notification.error({
//           message: "Error",
//           description: "Check your internet connection",
//         });
//       } else {
//         console.log("Error", error.message);
//       }
//     });
}

export async function userInfo(account: any) {
  const data = await getAccessToken(account);
  store.dispatch(setLoading(false));
  return data?.profile;
}

export async function switchRole(roleId: string) {
  return axios
    .get(`${import.meta.env.VITE_API}/auth/switch-role/${roleId}`, {
      headers: {
        Authorization: `Bearer ${
          localStorage.accessToken ? await localStorage.accessToken : ""
        }`,
      },
    })
    .then((response) => {
      localStorage.setItem("accessToken", response.data?.accessToken);
      localStorage.setItem("refreshToken", response.data?.refreshToken);
      localStorage.setItem(
        "currentRole",
        JSON.stringify(response?.data?.currentRole)
      );
      localStorage.setItem(
        "userRolePermissions",
        JSON.stringify(response?.data?.permissions)
      );
      return response.data;
    })
    .catch(function (error) {
      if (error.response) {
      } else if (error.request) {
        notification.error({
          message: "Error",
          description: "Check your internet connection",
        });
      } else {
        console.log("Error", error.message);
      }
    });
}

export async function requestPasswordReset(email: string) {
  store.dispatch(setLoading(true));
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API}/auth/request-password-reset`,
      { email }
    );
    store.dispatch(setLoading(false));
    notification.success({
      message: "Success",
      description: "Password reset code has been sent to your email",
    });
    return response.data;
  } catch (error: any) {
    store.dispatch(setLoading(false));
    if (error.response) {
      notification.error({
        message: "Error",
        description: error.response.data.message || "Failed to send reset code",
      });
    } else if (error.request) {
      notification.error({
        message: "Error",
        description: "Check your internet connection",
      });
    } else {
      notification.error({
        message: "Error",
        description: error.message,
      });
    }
    throw error;
  }
}

export async function verifyPasswordResetCode(email: string, code: string) {
  store.dispatch(setLoading(true));
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API}/auth/verify-password-reset-code`,
      { email, passwordResetCode: code }
    );
    store.dispatch(setLoading(false));
    notification.success({
      message: "Success",
      description: "Code verified successfully",
    });
    return response.data;
  } catch (error: any) {
    store.dispatch(setLoading(false));
    if (error.response) {
      notification.error({
        message: "Error",
        description: error.response.data.message || "Invalid verification code",
      });
    } else if (error.request) {
      notification.error({
        message: "Error",
        description: "Check your internet connection",
      });
    } else {
      notification.error({
        message: "Error",
        description: error.message,
      });
    }
    throw error;
  }
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  store.dispatch(setLoading(true));
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API}/auth/reset-password`,
      {
        email,
        passwordResetCode: code,
        newPassword,
      }
    );
    store.dispatch(setLoading(false));
    notification.success({
      message: "Success",
      description: "Password reset successfully",
    });
    return response.data;
  } catch (error: any) {
    store.dispatch(setLoading(false));
    if (error.response) {
      notification.error({
        message: "Error",
        description: error.response.data.message || "Failed to reset password",
      });
    } else if (error.request) {
      notification.error({
        message: "Error",
        description: "Check your internet connection",
      });
    } else {
      notification.error({
        message: "Error",
        description: error.message,
      });
    }
    throw error;
  }
}
