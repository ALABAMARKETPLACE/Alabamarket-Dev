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

  return (
    <main className="dashboard-SideBar">
      <div className="dashboard-SideBarBox1">
        {Routes.map((item: any, key) => (
          <Fragment key={key}>
            <div className="dashboard-SideBarDevider">{item?.section}</div>
            {item?.routes
              ?.filter((i: any) => i?.role?.includes(props?.data?.role))
              .map((section: any) => (
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
        ))}
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
