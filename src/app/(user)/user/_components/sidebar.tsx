"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CgProfile } from "react-icons/cg";
import { FaRegAddressBook, FaShoppingCart } from "react-icons/fa";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { RiNotification2Line } from "react-icons/ri";
const iconSize = 20;
const routes = [
  {
    title: "Profile",
    icon: <CgProfile size={iconSize} />,
    path: "/user/profile",
    route: "home",
  },
  {
    title: "Orders",
    icon: <FaShoppingCart size={iconSize} />,
    path: "/user/orders",
    route: "orders",
  },
  {
    title: "Favourites",
    icon: <MdOutlineFavoriteBorder size={iconSize} />,
    path: "/user/favorites",
    route: "favourites",
  },
  {
    title: "Address",
    icon: <FaRegAddressBook size={iconSize} />,
    path: "/user/address",
    route: "address",
  },
  {
    title: "Notifications",
    icon: <RiNotification2Line size={iconSize} />,
    path: "/user/notifications",
    route: "notifications",
  },
] as const;
function Sidebar() {
  const pathname = usePathname();
  return (
    <div>
      {routes.map((item: any, key: number) => {
        return (
          <Link href={item.path} className="text-dark text-decoration-none">
            <div
              key={key}
              className={`d-flex py-2 gap-2 sidebar-item ${
                pathname?.includes(item.route) ? "profile-menu-selected" : "profile-menu"
              }`}
            >
              {item.icon}
              <div className="profile-sidebar-txt1 ">{item.title}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default Sidebar;
