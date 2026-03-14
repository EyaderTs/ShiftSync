import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  DownOutlined,
  LogoutOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Drawer,
  Image,
  Input,
  Layout,
  Menu,
  Tooltip,
  theme,
  Breadcrumb,
  Dropdown,
} from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import AuthContext from "../shared/auth/context/authContext";

import { EnumRoles } from "@/shared/constants/enum/app.enum";
import { getMenuItems } from "../shared/constants/dashboard/items";
import { useLazyGetMyProfileQuery } from "@/features/user/store/user.query";

const { Header, Sider, Content, Footer } = Layout;
const { Search } = Input;
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logOut } = useContext(AuthContext);
  // const [showMessage, setShowMessage] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("home");
  const dispatch = useDispatch();

  const [filteredItems, setFilteredItems] = useState<any>();

  const handleOpenChange = (flag: boolean) => {
    setOpen(flag);
  };
  const [getMyProfile, userProfile] = useLazyGetMyProfileQuery();
  // Get current page path for breadcrumb
  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const items = [
      {
        title: 'Dashboard',
        href: '/',
      },
    ];

    // Add breadcrumb items based on all path segments
    let breadcrumbPath = '';
    pathSnippets.forEach((segment) => {
      breadcrumbPath += `${segment}`;
      
      // Format segment name for display (capitalize first letter of each word)
      const segmentName = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      items.push({
        title: segmentName,
        href: breadcrumbPath,
      });
    });

    return items;
  };

  //   useEffect(()=>{
  //     setShowMessage(localStorage?.showMessage !== undefined ? localStorage?.showMessage&&false:true);
  // },[])

  useEffect(() => {
    void getMyProfile(undefined, true);
  }, []);

  const grantAccess = (roles: string[]) => {
    if (roles && roles?.length > 0) {
      const isAuthorized = roles.some((r) =>
        userProfile?.data?.userRoles
          ?.map((role: any) => role?.role?.key)
          ?.includes(r)
      );
      if (!isAuthorized && userProfile?.data) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };

  const itemFilteringFunc = (items: any) => {
    let menuItems: any[] = [];
    let children: any[] = [];
    items?.forEach((item: any) => {
      children = [];
      if (item?.roles) {
        const truth = grantAccess(item?.roles);
        if (truth) {
          if (
            !menuItems
              ?.map((menuItem: any) => menuItem?.key)
              ?.includes(item?.key)
          ) {
            menuItems = [...menuItems, item];
          }
        }
      } else if (
        item?.roles === undefined &&
        item?.children &&
        item?.children?.length > 0
      ) {
        children = itemFilteringFunc(item.children);
        menuItems = [...menuItems, { ...item, children: children }];
      } else if (items?.roles === undefined) {
        menuItems = [...menuItems, item];
      }
    });

    return menuItems;
  };

  // const {
  //   token: { colorBgContainer },
  // } = theme.useToken();
  const items = getMenuItems(navigate, selectedKey);

  return (
    <>
      <Layout className="h-screen flex">
        <Sider
          trigger={null}
          width={240}
          collapsible
          collapsed={collapsed}
          className="overflow-auto hidden md:flex flex-col h-screen"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div
                style={{ height: "100px", backgroundColor: "#FCFCFF" }}
                className={`py-1 w-full flex justify-start border-r-2 shadow-lg shadow-fuchsia-200 border-gray-200 px-2  items-center font-bold text-2xl text-black`}
                onClick={() => navigate("/")}
              >
                {/* <span className={collapsed ? "hidden" : "block"}>EDU Budget</span>
                <span className={collapsed ? "block text-base text-center justify-center items-center" : "hidden"}>Ease</span> */}
                {collapsed ? (
                  <Image src="/assets/images/logo-2.png" alt="logo-collapsed" width={200} preview={false} className="cursor-pointer" />
                ) : (
                  <Image src="/assets/images/logo-1.png" alt="logo" width={300} preview={false} className="cursor-pointer" />
                )}
                {/* <div className="text-xs text-gray-500 ml-1">{!collapsed && "Ease"}</div> */}
              </div>

              <Menu
                mode="inline"
                theme="light"
                defaultSelectedKeys={["1"]}
                onSelect={(selectInfo) => {
                  setSelectedKey(selectInfo.key);
                }}
                items={itemFilteringFunc(items)}
                className="font-semibold !text-gray-600 !border-r-2 shadow-lg shadow-fuchsia-200 border-gray-200 overflow-auto"
                style={{ height: "calc(100vh - 161px)", backgroundColor: "#FCFCFF" }}
              />
            </div>
            
            {/* User profile section at bottom of sidebar */}
            <div className="flex items-center justify-center" style={{ backgroundColor: "#FCFCFF" }}>
              <hr className="text-gray-200 w-full mx-6" />
            </div>
            <div className={`border-r border-gray-200 p-3 ${collapsed ? "text-center" : "flex items-center gap-x-3"}`} style={{ backgroundColor: "#FCFCFF" }}>            
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      label: 'Profile',
                      icon: <UserOutlined />,
                      onClick: () => navigate(`/users/detail/${user?.userId}`)
                    },
                    {
                      key: 'logout',
                      label: 'Logout',
                      icon: <LogoutOutlined />,
                      onClick: () => logOut()
                    }
                  ]
                }}
                placement="topRight"
              >
                <div className="flex items-center justify-between gap-x-3 cursor-pointer">
                  <Avatar
                    style={{ backgroundColor: "#8B5CF6" }}
                    size="default"
                    
                  >
                    {user?.firstName?.charAt(0)}
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center justify-between gap-x-1">
                        <span className="font-medium ">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <UpOutlined className="text-xs" />
                      </div>
                      <span className="text-gray-500 text-xs">
                        {user?.email}
                      </span>
                    </div>
                  )}
                </div>
              </Dropdown>
            </div>
          </div>
        </Sider>
        <div className="md:hidden lg:hidden">
          <Drawer
            rootClassName="md:hidden"
            placement="left"
            onClose={() => setCollapsed(!collapsed)}
            open={collapsed}
            className="md:hidden w-10/12"
            title={
              <div
                className="flex items-center pl-4 text-lg text-black font-semibold hover:cursor-pointer"
                onClick={() => navigate("/")}
              >
                {/* EDU Budget
                <div className="text-xs text-gray-500 ml-1">Ease</div> */}
                <Image src="/assets/images/logo-1.png" alt="logo" width={200} preview={false} className="cursor-pointer" />
              </div>
            }
          >
            <div className="flex flex-col h-full justify-between">
              <div className="h-full overflow-y-auto pb-8">
                <Menu
                  mode="inline"
                  defaultSelectedKeys={["1"]}
                  onSelect={(selectInfo) => {
                    setCollapsed(!collapsed);
                    setSelectedKey(selectInfo.key);
                  }}
                  items={itemFilteringFunc(items)}
                  className="font-semibold text-gray-600 overflow-auto"
                />
              </div>
              
              {/* User profile section at bottom of mobile drawer */}
              <div className="border-t border-gray-200 p-3 flex items-center space-x-2 gap-x-3">
                <Avatar
                  style={{ backgroundColor: "#8B5CF6" }}
                  size="default"
                >
                  {user?.firstName?.charAt(0)}
                </Avatar>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </Drawer>
        </div>
        <Layout className="overflow-auto !bg-white">
          <Header className="!bg-white  border-gray-200 !px-6">
            <div className="flex h-full w-full items-center">
              <div className="flex items-center">
                {React.createElement(
                  collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                  {
                    className: "trigger mr-4 md:hidden",
                    onClick: () => setCollapsed(!collapsed),
                  }
                )}
                <Breadcrumb
                  items={getBreadcrumbItems()}
                  className="text-lg "
                />
              </div>
            </div>
          </Header>
          <Content
            className="overflow-auto md:mx-2 md:p-6 p-4 bg-white"
            style={{
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
          {/* <Footer
            style={{ textAlign: "center", height: "10px" }}
            className="p-0 text-gray-500"
          >
            Frontend Starter Pack ©2025
          </Footer> */}
        </Layout>
      </Layout>
    </>
  );
};

export default Dashboard;
