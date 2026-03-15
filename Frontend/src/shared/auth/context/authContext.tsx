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
  const [user, setUser] = useState<User>(userDefault);
  const [authenticated, setAuthenticated] = useState(false);

  async function Login(account: Account) {
    const data = await userInfo(account);
    if (data?.userId) {
      setUser(data);
      setAuthenticated(true);
      navigate("/");
    }
  }

  async function logOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    setUser(userDefault);
    setAuthenticated(false);
    navigate("/login");
  }

  useEffect(() => {
    async function init() {
      if ((await localStorage.userInfo) !== undefined) {
        setUser(JSON.parse(await localStorage.userInfo));
        setAuthenticated(true);
      }
    }
    init();
  }, []);

  const contextValue = {
    user,
    authenticated,
    login: Login,
    logOut: logOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
export default AuthContext;
