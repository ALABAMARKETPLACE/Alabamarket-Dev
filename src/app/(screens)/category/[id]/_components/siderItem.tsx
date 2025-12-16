"use client";
import { Checkbox, Select } from "antd";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const SiderItem = ({ item }: any) => {
  const pathname = usePathname();
  const router = useRouter();
  const { Option } = Select;

  const Navigate = (path: string) => {
    router.push(path);
  };

  return (
    <div
      onClick={() => ""}
      className={pathname === item?.route ? "sideItem-selected" : "sideItem"}
    >
      <Select value={item?.menu} style={{ width: '100%' }}>
        <Option>
          {item?.options?.map((option: string) => (
            <Checkbox key={option} value={option}>{option}</Checkbox>
          ))}
        </Option>
      </Select>
    </div>
  );
};

export default SiderItem;