import React from "react";
import { IconType } from "react-icons";
import { CgUnavailable } from "react-icons/cg";
import { SlHome } from "react-icons/sl";
import { PiShoppingCartSimple } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { FiUsers } from "react-icons/fi";
import { LuLayoutDashboard } from "react-icons/lu";
import { RiSettings5Fill } from "react-icons/ri";
import { HiUsers } from "react-icons/hi2";
import { FaWpforms, FaChartPie } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { IoStorefrontSharp, IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { BsFileLock2Fill, BsFillGridFill } from "react-icons/bs";
import { FaFileInvoice } from "react-icons/fa6";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import {
  TbInvoice,
  TbListDetails,
  TbCategory2,
  TbRocket,
} from "react-icons/tb";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { RiStore2Line, RiUserReceived2Line } from "react-icons/ri";
import { TfiLayoutSliderAlt } from "react-icons/tfi";
import { AiOutlineProduct } from "react-icons/ai";
import { LuBadgePercent } from "react-icons/lu";
import { MdOutlineCategory } from "react-icons/md";
function DynamicIcon(props: any) {
  type IconName =
    | "PiShoppingCartSimple"
    | "LuLayoutDashboard"
    | "CgUnavailable"
    | "SlHome"
    | "FiUsers"
    | "CgProfile"
    | "FaWpforms"
    | "FaChartPie"
    | "MdSpaceDashboard"
    | "IoStorefrontSharp"
    | "BsFileLock2Fill"
    | "FaFileInvoice"
    | "RiSettings5Fill"
    | "HiUsers"
    | "IoChatbubbleEllipsesSharp"
    | "BsFillGridFill"
    | "HiOutlineDesktopComputer"
    | "TbInvoice"
    | "HiOutlineDocumentReport"
    | "TbListDetails"
    | "RiStore2Line"
    | "RiUserReceived2Line"
    | "TfiLayoutSliderAlt"
    | "AiOutlineProduct"
    | "LuBadgePercent"
    | "TbCategory2"
    | "MdOutlineCategory"
    | "TbRocket";

  interface IconProps {
    iconName: IconName;
    size?: number;
    color?: string;
  }
  function Icon({ iconName, size = 26, color = "red" }: IconProps) {
    const icons: Record<IconName, IconType> = {
      PiShoppingCartSimple: PiShoppingCartSimple,
      LuLayoutDashboard: LuLayoutDashboard,
      CgUnavailable: CgUnavailable,
      SlHome: SlHome,
      FaWpforms: FaWpforms,
      FiUsers: FiUsers,
      CgProfile: CgProfile,
      FaChartPie: FaChartPie,
      MdSpaceDashboard: MdSpaceDashboard,
      IoStorefrontSharp: IoStorefrontSharp,
      BsFileLock2Fill: BsFileLock2Fill,
      RiSettings5Fill: RiSettings5Fill,
      FaFileInvoice: FaFileInvoice,
      HiUsers: HiUsers,
      IoChatbubbleEllipsesSharp: IoChatbubbleEllipsesSharp,
      BsFillGridFill: BsFillGridFill,
      HiOutlineDesktopComputer: HiOutlineDesktopComputer,
      TbInvoice: TbInvoice,
      HiOutlineDocumentReport: HiOutlineDocumentReport,
      TbListDetails: TbListDetails,
      RiStore2Line: RiStore2Line,
      RiUserReceived2Line: RiUserReceived2Line,
      TfiLayoutSliderAlt: TfiLayoutSliderAlt,
      AiOutlineProduct: AiOutlineProduct,
      LuBadgePercent: LuBadgePercent,
      TbCategory2: TbCategory2,
      MdOutlineCategory: MdOutlineCategory,
      TbRocket: TbRocket,
    };
    if (!icons.hasOwnProperty(iconName)) {
      console.warn(
        `Icon '${iconName}' not found. Rendering default icon instead.`
      );
      iconName = "CgUnavailable"; // set default icon name
    }
    const IconComponent = icons[iconName];
    return <IconComponent size={size} color={props.color} />;
  }
  return <Icon iconName={props.name} size={props.size} />;
}
export default DynamicIcon;
