import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { RootState } from "../../../store/app.store";
import { notification } from "antd";
import { ReactNode, useContext, useEffect } from "react";
import AuthContext from "../context/authContext";

interface Props {
  children: any;
  userRoles?: string[];
}
function AuthGuard(props: Props) {
  const { children, userRoles } = props;
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  function authenticate() {
    if (localStorage.userInfo !== undefined) {
      return true;
    } else {
      return false;
    }
  }
  function userInfo() {
    if (localStorage.userInfo !== undefined) {
      return localStorage.userInfo;
    } else {
      return undefined;
    }
  }

  if (authenticate()) {
    if (userRoles !== undefined) {
      if (userRoles.includes(user?.role || '')) {
        return children;
      } else {
        notification.error({
          message: "Error",
          description: `You need to have these roles ${userRoles?.join()}`,
        });
        navigate(-1);
      }
    } else return children;
  } else {
    const truth = authenticate();
    if (!truth) {
      return <Navigate to="/login" />;
    }
  }
}
interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
}
export function ItemGuard(props: RoleGuardProps) {
  const { children, roles } = props;

  const { user } = useContext(AuthContext);

  const grantAccess = () => {
    if (roles && roles?.length > 0) {
      const isAuthorized = roles.includes(user?.role || '');
      if (!isAuthorized && user) {
        return null;
      } else {
        return children;
      }
    } else {
      return children;
    }
  };

  return <>{grantAccess()}</>;
}

export default AuthGuard;
