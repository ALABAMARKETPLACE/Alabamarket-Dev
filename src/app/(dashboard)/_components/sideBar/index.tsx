"use client";
import React, { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";
import DynamicIcon from "./dynamicIcons";
import Routes from "./route.json";
import { signOut } from "next-auth/react";
import { clearReduxData } from "@/lib/clear_redux";
import { useAppDispatch } from "@/redux/hooks";

function SideBar(props: any) {
  const navigation = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const handleRouteClick = (route: string) => {
    navigation.push(route);
    // Close sidebar on mobile after navigation
    if (props?.onRouteClick) {
      props.onRouteClick();
    }
  };

  const handleSettingsClick = () => {
    navigation.push("/auth/settings");
    if (props?.onRouteClick) {
      props.onRouteClick();
    }
  };

  const handleLogout = () => {
    signOut();
    clearReduxData(dispatch);
    if (props?.onRouteClick) {
      props.onRouteClick();
    }
  };

  const userRole = props?.data?.role;
  const userType = props?.data?.type || props?.data?.user?.type;
  const isDeliveryCompany = userRole === "delivery_company" || userType === "delivery_company";
  const isDriver = userRole === "driver" || userType === "driver";

  // Filter routes based on user role
  let filteredRoutes = Routes;
  if (isDeliveryCompany) {
    // For delivery company, only show "Delivery Management" section
    filteredRoutes = Routes.filter((item: any) => item?.section === "Delivery Management");
  } else if (isDriver) {
    // For driver, only show "Driver Panel" section
    filteredRoutes = Routes.filter((item: any) => item?.section === "Driver Panel");
  }

  return (
    <main className="dashboard-SideBar">
      <div className="dashboard-SideBarBox1">
        {filteredRoutes.map((item: any, key) => {
          // Filter routes within each section
          const filteredSectionRoutes = item?.routes?.filter((i: any) => {
            const roleMatch = i?.role?.includes(userRole);
            const typeMatch = i?.type?.includes(userType);
            return roleMatch || typeMatch;
          });

          // Only show section if it has matching routes
          if (!filteredSectionRoutes || filteredSectionRoutes.length === 0) {
            return null;
          }

          return (
            <Fragment key={key}>
              <div className="dashboard-SideBarDevider">{item?.section}</div>
              {filteredSectionRoutes.map((section: any) => (
                <div
                  key={section?.id}
                  className={`dashboard-SideBarItem ${
                    pathname?.includes(section?.route) ? "active" : null
                  }`}
                  onClick={() => handleRouteClick(section?.route)}
                >
                  <div>
                    <DynamicIcon name={section?.icon} size={20} />
                  </div>
                  <div className="ashboard-SideBartext1">{section?.menu}</div>
                </div>
              ))}
            </Fragment>
          );
        })}
      </div>
      {props?.data?.role == "admin" ? (
        <div
          className={`dashboard-SideBarItem ${
            "/auth/settings" === pathname ? "active" : null
          }`}
          onClick={handleSettingsClick}
        >
          <div>
            <IoSettingsOutline />
          </div>
          <div className="ashboard-SideBartext1">Settings</div>
        </div>
      ) : null}
      <div
        className="dashboard-SideBarItem"
        style={{ color: "red" }}
        onClick={handleLogout}
      >
        <div>
          <IoLogOutOutline />
        </div>
        <div className="ashboard-SideBartext1">Logout</div>
      </div>
    </main>
  );
}

export default SideBar;
