export const grantAccess = (roles: string[], userRoles:any[]) => {
    if (roles && roles?.length > 0) {
      const isAuthorized = roles.some((r) =>
        userRoles
          ?.map((role: any) => role?.role?.key)
          ?.includes(r)
      );
      if (!isAuthorized ) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };