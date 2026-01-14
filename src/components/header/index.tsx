"use client";
import React, { useState, useEffect } from "react";
import "./style.scss";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { reduxIsSideMenuOpen, setSideMenuOpen } from "@/redux/slice/layoutSlice";
import CONFIG from "@/config/configuration";
import { useGetSettings, useTokenExpiration } from "./services";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "react-bootstrap";
import Image from "next/image";
import Logo from "../../assets/images/new-logo.jpeg";
import Search from "./search"; // or wherever your Search component is

import {
  IoGlobeOutline,
  IoCartOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { BsShopWindow } from "react-icons/bs";
import { PiUserCircle } from "react-icons/pi";

import dynamic from "next/dynamic";
const SideMenu = dynamic(() => import("./sideMenu"), { ssr: false });
const Location = dynamic(() => import("./location"), { ssr: false });
const CategoryNav = dynamic(() => import("./categoryNav"), { ssr: false });
import { Badge, Button, Popover } from "antd";
import { reduxSettings } from "../../redux/slice/settingsSlice";
import { signOut, useSession } from "next-auth/react";
import ProfileMenu from "./profileMenu";
const CateogreyList = dynamic(() => import("./categoryList"), {
  ssr: false,
});

// Add these imports - adjust paths as needed

function Header() {
  const dispatch = useDispatch();
  const sideMenuOpen = useSelector(reduxIsSideMenuOpen);
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
        navigation.push("/auth/dashboard");
      }
    } else {
      navigation.push("/seller");
    }
  };

  // Show SideMenu on all pages except /auth
  return pathname?.includes("/auth") ? null : (
    <>
      <SideMenu
        open={sideMenuOpen}
        onClose={() => dispatch(setSideMenuOpen(false))}
      />
      <div className="Header-wrapper position-sticky top-0" style={{ zIndex: 1000 }}>
        <Container fluid className="Header-container">
          <header className="Header">
            <div className="Header-top">
              {/* Left Section: Logo & Location */}
              <div className="Header-left">
                <Link href="/">
                  <div className="Header_logoBox">
                    <Image
                      alt="AlabaMarketplace"
                      src={Logo}
                      className="Header_logo"
                      priority
                    />
                  </div>
                </Link>
                <div className="Header-location d-none d-lg-block">
                  {isMounted && Settings?.isLocation ? <Location /> : null}
                </div>
              </div>

              {/* Center Section: Search (Desktop) */}
              <div className="Header-center d-none d-lg-block">
                <Search type={"input"} />
              </div>

              {/* Right Section: CTA, Account, Cart */}
              <div className="Header-right">
                {showSellerCta ? (
                  <div className="Header-sellerCTA d-none d-md-block">
                    <Button
                      size="large"
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

                <div className="Header-actions">
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
                    <div className="Header-action-item user-profile">
                      {user?.user?.image ? (
                        <img
                          src={user?.user?.image}
                          className="Header-ProfileImag"
                          alt="profile"
                        />
                      ) : (
                        <PiUserCircle size={28} color="#475569" />
                      )}
                      <span className="d-none d-xl-block ms-2 text-dark fw-medium">
                         {user?.user ? `Hi, ${user.user.first_name}` : 'Account'}
                      </span>
                    </div>
                  </Popover>

                  <Link href={"/cart"}>
                    <div className="Header-action-item">
                      <Badge count={cart.items.length} size="small" offset={[0, -5]}>
                        <IoCartOutline size={28} color={"#475569"} />
                      </Badge>
                      <span className="d-none d-xl-block ms-2 text-dark fw-medium">Cart</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Search Row */}
            <div className="Header-bottom d-lg-none py-2">
              <Search type={"box"} />
            </div>
          </header>
        </Container>

        {/* Category Navigation Bar */}
        {pathname === "/" && (
          <div className="Header-nav-bar">
             <Container fluid className="Header-container">
               <CategoryNav onOpenMenu={() => dispatch(setSideMenuOpen(true))} />
             </Container>
          </div>
        )}
      </div>
    </>
  );
}

export default Header;
