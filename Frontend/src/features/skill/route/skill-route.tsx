import NewSkillComponent from "@/features/skill/component/new-skill-component";
import SkillListPage from "@/features/skill/page/skill-list-page";
import SkillDetailComponent from "../component/skill-detail-component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";

export const SkillRoute = {
  path: "skills",
  element: (
    <ItemGuard roles={[EnumRoles.Admin, EnumRoles.Manager]}>
      <SkillListPage />
    </ItemGuard>
  ),
  children: [
    { path: "edit/:id", element: <NewSkillComponent editMode="detail" /> },
    { path: ":id", element: <NewSkillComponent editMode="new" /> },
    { path: "detail/:id", element: <SkillDetailComponent /> },
  ],
};
