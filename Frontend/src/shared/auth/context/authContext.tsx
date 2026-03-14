/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../../models/user-model";
import { userInfo } from "../api/auth-api";
interface Account {
  email: string;
  password: string;
}

const userDefault: User = {
  userId: "",
  firstName: "",
  // middleName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
};

const AuthContext = React.createContext({
  user: userDefault,
  authenticated: false,
  login: (account: Account) => { },
  logOut: () => { },
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [context, setContext] = useState({
    user: userDefault,
    authenticated: false,
    login: Login,
    logOut: logOut,
  });

  async function Login(account: Account) {
    const data = await userInfo(account);
    if (data?.userId) {
      setContext({ ...context, user: data, authenticated: true });
      navigate("/");
    }
  }

  async function logOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    setContext({ ...context, user: userDefault, authenticated: false });
    navigate("/login");
  }

  useEffect(() => {
    async function init() {
      if ((await localStorage.userInfo) !== undefined) {
        setContext({
          ...context,
          user: JSON.parse(await localStorage.userInfo),
          authenticated: true,
        });
      }
    }
    init();
  }, []);

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};
export default AuthContext;
