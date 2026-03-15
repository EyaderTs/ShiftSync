import NewLocationComponent from "@/features/location/component/new-location-component";
import LocationListPage from "@/features/location/page/location-list-page";
import LocationDetailComponent from "../component/location-detail-component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";

// eslint-disable-next-line import/prefer-default-export
export const LocationRoute = {
  path: "locations",
  element: (
    <ItemGuard roles={[EnumRoles.Admin, EnumRoles.Manager]}>
      <LocationListPage />
    </ItemGuard>
  ),
  children: [
    { path: "edit/:id", element: <NewLocationComponent editMode="detail" /> },
    { path: ":id", element: <NewLocationComponent editMode="new" /> },
    { path: "detail/:id", element: <LocationDetailComponent /> },
  ],
};
