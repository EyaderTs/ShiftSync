// import { UserOutlined, DashboardOutlined } from "@ant-design/icons";
import {
  MdOutlineDashboard,
  MdOutlinePersonOutline,
  MdOutlinePerson3,
  MdOutlineAdminPanelSettings,
  MdOutlineApproval,
} from "react-icons/md";
import { LuSchool } from "react-icons/lu";
import { TbMapDollar } from "react-icons/tb";
import { NavigateFunction } from "react-router-dom";
import { FaHandHoldingDollar, FaSackDollar } from "react-icons/fa6";
import { IoAnalyticsSharp } from "react-icons/io5";
import { AiOutlineClockCircle, AiOutlineCalendar } from "react-icons/ai";
import { EnumRoles } from "../enum/app.enum";
export const getMenuItems = (
  navigate: NavigateFunction,
  selectedKey: string
) => {
  const iconSize = 18; // Increased icon size (default is usually around 14-16px)

  return [
    {
      key: "dashboard",
      icon: <MdOutlineDashboard size={iconSize} />,
      label: "Dashboard",
      onClick: () => {
        navigate("/");
      },
    },
    {
      key: "Skill",
      icon: <LuSchool size={iconSize} />,
      label: "Skill",
      roles: [EnumRoles.Admin, EnumRoles.Manager],
      onClick: () => {
        navigate("skills");
      },
      className: selectedKey === "skill" ? "bg-primary text-white" : "",
    },
    {
      key: "Location",
      icon: <FaSackDollar size={iconSize} />,
      label: "Location",
      roles: [EnumRoles.Admin, EnumRoles.Manager],
      onClick: () => {
        navigate("locations");
      },
    },
    {
      key: "User",
      icon: <MdOutlinePersonOutline size={iconSize} />,
      label: "User",
      // roles: [EnumRoles.Admin, EnumRoles.Manager],
      onClick: () => {
        navigate("users");
      },
    },
    {
      key: "Shift",
      icon: <AiOutlineCalendar size={iconSize} />,
      label: "Shifts",
      roles: [EnumRoles.Manager],
      onClick: () => {
        navigate("shifts");
      },
    },
    {
      key: "Availability",
      icon: <AiOutlineClockCircle size={iconSize} />,
      label: "My Availability",
      roles: [EnumRoles.Staff],
      onClick: () => {
        navigate("availability");
      },
    },

    // {
    //   key: "User Management",
    //   icon: <MdOutlinePerson3 size={iconSize} />,
    //   label: "User Management",
    //   roles: [EnumRoles.SuperAdmin],
    //   children: [
    //     {
    //       key: "users",
    //       icon: <MdOutlinePersonOutline size={iconSize} />,
    //       label: "Users",
    //       roles: [EnumRoles.SuperAdmin],
    //       onClick: () => {
    //         navigate("users");
    //       },
    //     },

    //   ],
    // },
    // {
    //   key: "Report",
    //   icon: <IoAnalyticsSharp size={iconSize} />,
    //   label: "Report & Analytics",
    //   onClick: () => {
    //     navigate("reports");
    //   },
    // },
  ];
};
