"use client";

import React from "react";
import { Button, Dropdown, Input, Select } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { LuFilter } from "react-icons/lu";

interface StatusOption {
  value: string;
  label: string;
}

interface BoostRequestFilterBarProps {
  isCompactFilters: boolean;
  filtersDropdownOpen: boolean;
  onFiltersDropdownChange: (open: boolean) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  statusOptions: StatusOption[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

const BoostRequestFilterBar = ({
  isCompactFilters,
  filtersDropdownOpen,
  onFiltersDropdownChange,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
  onRefresh,
  isRefreshing,
}: BoostRequestFilterBarProps) => {
  const renderControls = (variant: "inline" | "dropdown") => {
    const isDropdown = variant === "dropdown";
    const controlStyle = isDropdown ? { width: "100%" } : undefined;

    const wrapperProps =
      variant === "dropdown"
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
          placeholder="Search seller name..."
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="boostRequests-filterItem boostRequests-filterItem--search"
          value={searchValue}
          size="large"
          style={controlStyle}
        />
        <Select
          value={statusValue}
          options={statusOptions}
          onChange={onStatusChange}
          className="boostRequests-filterItem boostRequests-filterItem--status"
          size="large"
          style={controlStyle}
        />
      </>
    );

    return (
      <div
        className={`boostRequests-filterControls boostRequests-filterControls-${variant}`}
        {...wrapperProps}
      >
        <div className="boostRequests-filterRow">{controls}</div>
      </div>
    );
  };

  const filterButton = (
    <Dropdown
      trigger={["click"]}
      open={filtersDropdownOpen}
      onOpenChange={onFiltersDropdownChange}
      dropdownRender={() => renderControls("dropdown")}
      overlayClassName="boostRequests-filterDropdownOverlay"
    >
      <Button
        icon={<LuFilter size={18} />}
        className="boostRequests-filterTrigger"
        size="large"
      >
        Filters
      </Button>
    </Dropdown>
  );

  if (!isCompactFilters) {
    return renderControls("inline");
  }

  return filterButton;
};

export default BoostRequestFilterBar;
