import NewUserComponent from "@/features/user/component/new-user-component";
import UserListPage from "@/features/user/page/user-list-page";
import UserDetailComponent from "../component/user-detail-component";
import { EnumRoles } from "@/shared/constants/enum/app.enum";
import { ItemGuard } from "@/shared/auth/component/auth-guard";

export const UserRoute = {
  path: "users",
  element: (
    // <ItemGuard roles={[EnumRoles.SuperAdmin]}>
    <UserListPage />
    // </ItemGuard>
  ),
  children: [
    { path: "edit/:id", element: <NewUserComponent editMode="detail" /> },
    { path: ":id", element: <NewUserComponent editMode="new" /> },
    { path: "detail/:id", element: <UserDetailComponent /> },
  ],
};
