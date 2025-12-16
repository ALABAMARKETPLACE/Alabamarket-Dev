"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { IoChevronBackOutline } from "react-icons/io5";
function PageHeader(props: any) {
  const router = useRouter();
  return (
    <div className="dashboard-pageHeader">
      <div className="dashboard-pageHeaderBox2" onClick={() => router.back()}>
        <IoChevronBackOutline size={30} />
      </div>
      <div>
        <div className="dashboard-pageHeadertxt1">{props?.title}</div>
        <div className="dashboard-pageHeadertxt2">{props?.bredcume}</div>
      </div>
      {props?.children ? (
        <div className="dashboard-pageHeaderBox">
          <div className="d-flex gap-3 align-items-center">
            {props?.children}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default PageHeader;
