"use client";

import React from "react";
import { Button, Dropdown, Input } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { LuFilter } from "react-icons/lu";

interface BannersFilterBarProps {
  isCompactFilters: boolean;
  filtersDropdownOpen: boolean;
  onFiltersDropdownChange: (open: boolean) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const BannersFilterBar = ({
  isCompactFilters,
  filtersDropdownOpen,
  onFiltersDropdownChange,
  searchValue,
  onSearchChange,
  onRefresh,
  isRefreshing,
}: BannersFilterBarProps) => {
  const renderControls = (variant: "inline" | "dropdown") => {
    const isDropdown = variant === "dropdown";
    const controlStyle = isDropdown ? { width: "100%" } : undefined;

    const wrapperProps =
      isDropdown
        ? {
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
            },
          }
        : {};

    const controls = (
      <>
        <Input
          allowClear
          suffix={<IoSearchOutline />}
          placeholder="Search . . ."
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="banners-filterItem banners-filterItem--search"
          value={searchValue}
          size="large"
          style={controlStyle}
        />
        <Button
          type="primary"
          ghost
          onClick={onRefresh}
          loading={isRefreshing}
          className="banners-filterItem"
          size="large"
          style={controlStyle}
        >
          Refresh
        </Button>
      </>
    );

    return (
      <div
        className={`banners-filterControls banners-filterControls-${variant}`}
        {...wrapperProps}
      >
        <div
          className="banners-filterRow"
          style={
            isDropdown
              ? {
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: 12,
                }
              : undefined
          }
        >
          {controls}
        </div>
      </div>
    );
  };

  if (!isCompactFilters) {
    return renderControls("inline");
  }

  return (
    <Dropdown
      trigger={["click"]}
      open={filtersDropdownOpen}
      onOpenChange={onFiltersDropdownChange}
      dropdownRender={() => renderControls("dropdown")}
      overlayClassName="banners-filterDropdownOverlay"
    >
      <Button
        icon={<LuFilter size={18} />}
        className="banners-filterTrigger"
        size="large"
      >
        Filters
      </Button>
    </Dropdown>
  );
};

export default BannersFilterBar;

