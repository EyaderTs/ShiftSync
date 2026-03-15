import NewShiftComponent from "@/features/shift/component/new-shift-component";
import ShiftListPage from "@/features/shift/page/shift-list-page";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";

export const ShiftRoute = {
  path: "shifts",
  children: [
    {
      index: true,
      element: (
        <ItemGuard roles={[EnumRoles.Manager]}>
          <ShiftListPage />
        </ItemGuard>
      ),
    },
    { path: "new", element: <NewShiftComponent editMode="new" /> },
    { path: "edit/:id", element: <NewShiftComponent editMode="detail" /> },
  ],
};
