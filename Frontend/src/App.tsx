import { ConfigProvider, notification } from "antd";
// import moment from "moment-timezone";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { AuthContextProvider } from "./shared/auth/context/authContext";
import AuthGuard from "./shared/auth/component/auth-guard";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Dashboard from "./layout/dashboard";
import { Login } from "./shared/auth/component/login";
import NotFound from "./shared/component/not-found/not-found-component";
import { store } from "./store/app.store";
import ResetPasswordPage from "./features/user/page/reset-password-page";

import { LocationRoute } from "./features/location/route/location-route";
import { UserRoute } from "./features/user/route/user-route";

import { SkillRoute } from "./features/skill/route/skill-route";
import { DashboardRoute } from "./features/dashboard/route/dashboard-route";
import { AvailabilityRoute } from "./features/availability/route/availability-route";
// import { ReportRoute } from "./features/report/route/report-route";

notification.config({
  placement: "bottomRight",
  bottom: 20,
  duration: 3,
  rtl: false,
});

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <AuthContextProvider>
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </AuthContextProvider>
      ),
      children: [
        DashboardRoute,
        UserRoute,
        SkillRoute,
        LocationRoute,
        AvailabilityRoute,

        // ReportRoute,
        { path: "*", element: <NotFound /> },
      ],
    },
    {
      path: "login",
      element: (
        <AuthContextProvider>
          <Login />
        </AuthContextProvider>
      ),
    },
    {
      path: "reset-password",
      element: (
        <AuthContextProvider>
          <ResetPasswordPage />
        </AuthContextProvider>
      ),
    },
    { path: "*", element: <NotFound /> },
  ]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3b82f6",
        },
      }}
    >
      <Provider store={store}>
        <div className="m-0 bg-gray-50">
          {/* {notification.config({
            placement: "bottomRight",
            bottom: 20,
            duration: 3,
            rtl: false,
          })} */}
          <RouterProvider router={router} />
          {/* <InternetConnectionStatus /> */}
        </div>
      </Provider>
    </ConfigProvider>
  );

}

export default App;
