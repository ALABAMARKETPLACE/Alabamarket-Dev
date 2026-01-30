import { Badge, Button, notification } from "antd";
import React, { useEffect, useState } from "react";
import { MdFavoriteBorder } from "react-icons/md";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { RiListUnordered } from "react-icons/ri";
import { PiAddressBook } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { FiUser } from "react-icons/fi";
import API from "../../config/API";
import { RiNotification2Line } from "react-icons/ri";
import { BsShopWindow } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { GET } from "@/util/apicall";

const ProfileMenu = (props: any) => {
  const navigation = useRouter();
  const { data: User, update: updateSession }: any = useSession();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [Notifications, contextHolder] = notification.useNotification();
  const iconSize = 17;
  const OpenLink = (link: any) => {
    if (User?.user) {
      navigation.push(link);
    } else {
      navigation.push("/login");
    }
    props.close?.();
  };

  useEffect(() => {
    let ignore = false;
    const refreshProfileStats = async () => {
      if (
        !props?.isVisible ||
        !User?.user ||
        typeof updateSession !== "function"
      ) {
        return;
      }
      try {
        const response: any = await GET(API.USER_REFRESH);
        if (!response?.status || ignore) return;
        const refreshedUser = response?.data ?? {};
        const wishlistCount =
          typeof refreshedUser?.wishlist === "number"
            ? refreshedUser?.wishlist
            : User?.user?.wishlist ?? 0;
        const notificationCount =
          typeof refreshedUser?.notifications === "number"
            ? refreshedUser?.notifications
            : User?.user?.notifications ?? 0;

        await updateSession({
          user: {
            ...User.user,
            wishlist: wishlistCount,
            notifications: notificationCount,
          },
        });
      } catch (error) {
        console.error("Failed to refresh profile stats", error);
      }
    };
    refreshProfileStats();
    return () => {
      ignore = true;
    };
  }, [props?.isVisible, User?.user, updateSession]);

  const logotFunction = () => {
    if (User?.user) {
      signOut({ callbackUrl: "/" });
    } else {
      navigation.push("/login");
      props.close();
    }
  };

  // const signout = async () => {
  //   const url = API.USER_LOGOUT;
  //   try {
  //     setLoading(true);
  //     const response: any = await GET(url);
  //     if (response?.status) {
  //       Notifications["success"]({
  //         message: `You have been Logged Out.`,
  //         description: "",
  //       });
  //       props.close();
  //       signOut();
  //     } else {
  //       alert("Unable to logout.. please try again..");
  //     }
  //   } catch (err) {
  //     alert("Unable to logout.. please try again..");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSellerNavigation = () => {
    if (User?.user) {
      if (User?.user?.type === "user") {
        navigation.push("/seller");
      } else {
        navigation.push("/auth/");
      }
    } else {
      navigation.push("/seller");
    }
    props.close?.();
  };

  const handleBecomeUser = () => {
    if (User?.user) {
      navigation.push("/user/profile");
    } else {
      navigation.push("/signup");
    }
    props.close?.();
  };

  return (
    <div className="profileMenu-Box1">
      {contextHolder}
      <div className="profileMenu-Icon">
        {User?.user?.image ? (
          <img
            src={User?.user?.image}
            className="Header-ProfileImag"
            alt="profile"
            style={{ width: 50, height: 50 }}
          />
        ) : (
          <HiOutlineUserCircle size={50} color="#d9d9d9" />
        )}
        <div style={{ marginTop: 8, marginBottom: 4, fontWeight: "600", fontSize: 16 }}>
          {User?.user?.first_name || "Guest User"}
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {User?.user?.email || "Welcome to Alabamarket"}
        </div>
      </div>

      <hr style={{ margin: "10px 0", borderColor: "#f0f0f0" }} />

      {User?.user && (
        <div style={{ padding: "0 4px" }}>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/profile")}
          >
            <div>
              <FiUser size={iconSize} className="profileMenu-Img1" />
            </div>
            <div className="profileMenu-Txt1">My Profile</div>
          </div>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/orders")}
          >
            <div>
              <RiListUnordered size={iconSize} className="profileMenu-Img1" />
            </div>
            <div className="profileMenu-Txt1">My Orders</div>
          </div>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/favorites")}
          >
            <div>
              <MdFavoriteBorder size={iconSize} className="profileMenu-Img1" />
            </div>
            <div className="d-flex justify-content-between w-100 align-items-center">
              <div className="profileMenu-Txt1">Wishlist</div>
              {User?.user?.wishlist > 0 && (
                <Badge
                  count={User?.user?.wishlist}
                  size="small"
                  color={API.COLOR}
                />
              )}
            </div>
          </div>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/address")}
          >
            <div>
              <PiAddressBook size={iconSize} className="profileMenu-Img1" />
            </div>
            <div className="profileMenu-Txt1">Saved Addresses</div>
          </div>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/notifications")}
          >
            <div>
              <RiNotification2Line
                size={iconSize}
                className="profileMenu-Img1"
              />
            </div>
            <div className="d-flex justify-content-between w-100 align-items-center">
              <div className="profileMenu-Txt1">Notifications</div>
              {User?.user?.notifications > 0 && (
                <Badge
                  count={User?.user?.notifications}
                  size="small"
                  color={API.COLOR}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ margin: "10px 0" }} />
      
      <div className="profileMenu-mobileCTA">
        {!User?.user && (
           <Button 
             size="large" 
             block 
             onClick={() => navigation.push("/signup")} 
             className="profileMenu-btn profileMenu-btn-outline"
             style={{marginBottom: 8}}
           >
             Create Account
           </Button>
        )}
        {User?.user?.type !== "user" && (
          <Button
            size="large"
            block
            className="profileMenu-btn profileMenu-btn-primary"
            icon={<BsShopWindow size={18} />}
            onClick={handleSellerNavigation}
          >
            Manage Store
          </Button>
        )}
      </div>

      <div style={{ padding: "0 4px" }}>
        <Button
          size="large"
          className={User?.user ? "profileMenu-btn profileMenu-btn-danger w-100 mt-2" : "profileMenu-btn profileMenu-btn-primary w-100 mt-2"}
          onClick={() => logotFunction()}
          loading={loading}
        >
          {User?.user ? "Logout" : "Login"}
        </Button>
      </div>

      {!User?.user && (
        <div style={{ marginTop: "12px", textAlign: "center", fontSize: 13, color: "#666" }}>
          New customer?{" "}
          <Link
            href="/signup"
            style={{ color: API.COLOR, fontWeight: 600 }}
            onClick={() => {
              if (typeof props.close === "function") {
                props.close();
              }
            }}
          >
            Start here
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
