import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";
import NewAvailabilityComponent from "../component/new-availability-component";
import AvailabilityPage from "../page/availability-page";

export const AvailabilityRoute = {
  path: "availability",
  children: [
    {
      index: true,
      element: (
        // <ItemGuard roles={[EnumRoles.Staff, EnumRoles.Manager, EnumRoles.SuperAdmin]}>
        <AvailabilityPage />
        // </ItemGuard>
      ),
    },
    {
      path: "new",
      element: <NewAvailabilityComponent editMode="new" />
    },
    {
      path: "edit/:id",
      element: <NewAvailabilityComponent editMode="detail" />
    },
  ],
};
