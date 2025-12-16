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
      signOut();
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
          />
        ) : (
          <HiOutlineUserCircle size={45} color="#d9d9d9" />
        )}
        <div style={{ marginTop: 5, marginBottom: 5, fontWeight: "900" }}>
          {User?.user?.first_name || "Guest User"}
        </div>
      </div>

      {User?.user && (
        <>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/profile")}
          >
            <div>
              <FiUser size={iconSize} className="profileMenu-Img1" />
            </div>
            <div className="profileMenu-Txt1">Profile</div>
          </div>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/orders")}
          >
            <div>
              <RiListUnordered size={iconSize} className="profileMenu-Img1" />
            </div>
            <div className="profileMenu-Txt1">Orders</div>
          </div>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/favorites")}
          >
            <div>
              <MdFavoriteBorder size={iconSize} className="profileMenu-Img1" />
            </div>
            <Badge
              count={User?.user?.wishlist ?? ""}
              size="small"
              color={API.COLOR}
            >
              <div className="profileMenu-Txt1">favourite</div>
            </Badge>
          </div>
          <div
            className="profileMenu-Box2"
            onClick={() => OpenLink("/user/address")}
          >
            <div>
              <PiAddressBook size={iconSize} className="profileMenu-Img1" />
            </div>
            <div className="profileMenu-Txt1">Address</div>
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
            <Badge
              count={User?.user?.notifications ?? ""}
              size="small"
              color={API.COLOR}
            >
              <div className="profileMenu-Txt1">Notifications</div>
            </Badge>
          </div>
        </>
      )}
      <div style={{ margin: 5 }} />
      <div className="profileMenu-mobileCTA">
        <Button size="large" block onClick={handleBecomeUser}>
          {User?.user ? "View user profile" : "Become a user"}
        </Button>
        <Button
          size="large"
          type="primary"
          block
          icon={<BsShopWindow size={18} />}
          onClick={handleSellerNavigation}
        >
          Become a seller
        </Button>
      </div>
      <Button
        size="large"
        type="primary"
        block
        onClick={() => logotFunction()}
        loading={loading}
      >
        {User?.user ? "Logout" : "Login"}
      </Button>
      {User?.user ? null : (
        <div style={{ marginTop: "10px" }}>
          New Customer? &nbsp;&nbsp;
          <Link
            href="/signup"
            onClick={() => {
              if (typeof props.close === "function") {
                props.close();
              }
            }}
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
