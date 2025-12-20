"use client";
import React, { useState, useEffect } from "react";
import "./style.scss";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import CONFIG from "@/config/configuration";
import { useGetSettings, useTokenExpiration } from "./services";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "react-bootstrap";
import Logo from "../../assets/images/new-logo.jpeg";

import {
  IoGlobeOutline,
  IoCartOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { BsShopWindow } from "react-icons/bs";
import { PiUserCircle } from "react-icons/pi";

import Search from "./search";
import dynamic from "next/dynamic";
const Location = dynamic(() => import("./location"), { ssr: false });
import { Badge, Button, Popover } from "antd";
import { reduxSettings } from "../../redux/slice/settingsSlice";
import { signOut, useSession } from "next-auth/react";
import ProfileMenu from "./profileMenu";
const CateogreyList = dynamic(() => import("./categoryList"), {
  ssr: false,
});

function Header() {
  const Settings = useSelector(reduxSettings);
  const cart = useSelector((state: any) => state.Cart);
  const location = useSelector((state: any) => state?.Location);
  const pathname = usePathname();
  const { data: user, status }: any = useSession();
  const [issharepopovervisible, setissharepopovervisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigation = useRouter();

  useGetSettings();
  useTokenExpiration();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlepopovervisiblechange = () => {
    setissharepopovervisible(!issharepopovervisible);
  };
  const showSellerCta =
    isMounted && (Settings?.type === "multi" || user?.user?.role === "admin");
  const sellerCtaLabel =
    isMounted && user?.user && user?.user?.type !== "user"
      ? "Manage Store"
      : "Join Us";
  const handleSellerNavigation = () => {
    if (user?.user) {
      if (user?.user?.type === "user") {
        navigation.push("/seller");
      } else {
        navigation.push("/auth/");
      }
    } else {
      navigation.push("/seller");
    }
  };
  return pathname?.includes("/auth") ? null : (
    <Container fluid className="Header-container">
      <header className="position-sticky top-0" style={{ zIndex: 1000 }}>
        <div className="Header py-2 ">
          <div className="Header-Box">
            <Link href={"/"} className="Header_logoBox">
              <div>
                <Image
                  alt="AlabaMarketplace"
                  src={Logo}
                  className="Header_logo"
                />
              </div>
              {/* <div style={{ marginTop: 5 }}>{CONFIG.NAME}</div> */}
            </Link>
            <div className="Header-location desktop">
              {isMounted && Settings?.isLocation ? <Location /> : null}
            </div>
            <div className="Header-search desktop">
              <Search type={"input"} />
            </div>
            {/* <div className="Header-menu desktop">
              <Button
                size="large"
                type="text"1
                icon={<IoGlobeOutline size={25} color={"#262941"} />}
              ></Button>
            </div> */}
            {showSellerCta ? (
              <div className="Header-sellerCTA">
                <Button
                  size="large"
                  // type="primary"
                  icon={<BsShopWindow size={18} />}
                  className="Header-sellerBtn"
                  onClick={handleSellerNavigation}
                >
                  <span className="Header-sellerBtn-text">
                    {sellerCtaLabel}
                  </span>
                </Button>
              </div>
            ) : null}
            <div className="Header-menu">
              {/* {user ? (
                <div onClick={() => signOut()}>{user?.user?.first_name}</div>
              ) : (
                <Link href={"/login"}>
                  <Button
                    size="large"
                    type="text"
                    icon={<IoPersonOutline size={25} color={"#262941"} />}
                  >
                    <div className="Header-text3">Login</div>
                  </Button>
                </Link>
              )} */}
              <Popover
                placement="bottomRight"
                trigger="click"
                content={
                  <ProfileMenu
                    close={handlepopovervisiblechange}
                    isVisible={issharepopovervisible}
                  />
                }
                arrow={false}
                open={issharepopovervisible}
                onOpenChange={handlepopovervisiblechange}
              >
                <div
                  className={
                    user?.user
                      ? "Header-desk-menu Header-deskactive border"
                      : "Header-desk-menu"
                  }
                >
                  <div style={{ color: "#FF5F15" }}>
                    {user?.user?.first_name}
                  </div>
                  <div style={{ margin: 4 }} />
                  {user?.user?.image ? (
                    <img
                      style={{ marginTop: -4, marginBottom: -4 }}
                      src={user?.user?.image}
                      className="Header-ProfileImag"
                      alt="profile"
                    />
                  ) : (
                    <PiUserCircle size={25} color="grey" />
                  )}
                </div>
              </Popover>
            </div>
            <div className="Header-menu">
              <Link href={"/cart"}>
                <Button
                  size="large"
                  icon={
                    <Badge count={cart.items.length} size="small">
                      <IoCartOutline size={20} color={"#262941"} />
                    </Badge>
                  }
                >
                  <div className="Header-text3">Cart</div>
                </Button>
              </Link>
            </div>
          </div>
          <div className="Header-search tablet">
            <Search type={"box"} />
          </div>
          <div className="Header-search mobile">
            <Search type={"box"} />
          </div>
        </div>
        <div className="Header-sectionBox" />
        {/* <CateogreyList /> */}
      </header>
    </Container>
  );
}
export default Header;
