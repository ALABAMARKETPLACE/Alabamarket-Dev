"use client";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("./index"), { ssr: false });
export default Header;
