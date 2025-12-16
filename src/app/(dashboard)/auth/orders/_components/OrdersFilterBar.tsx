"use client";

import React from "react";
import { Button, DatePicker, Dropdown, Input, Select } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { LuFilter } from "react-icons/lu";
import dayjs from "dayjs";
import orderStatusOptions from "@/config/order_status.json";

const { RangePicker } = DatePicker;

interface OrdersFilterBarProps {
  isCompactFilters: boolean;
  filtersDropdownOpen: boolean;
  onFiltersDropdownChange: (open: boolean) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  dateRangeValue: [string | null, string | null];
  onDateRangeChange: (from: string | null, to: string | null) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const OrdersFilterBar = ({
  isCompactFilters,
  filtersDropdownOpen,
  onFiltersDropdownChange,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  dateRangeValue,
  onDateRangeChange,
  onRefresh,
  isRefreshing,
}: OrdersFilterBarProps) => {
  const rangeValue =
    dateRangeValue[0] && dateRangeValue[1]
      ? ([dayjs(dateRangeValue[0]), dayjs(dateRangeValue[1])] as [
          dayjs.Dayjs,
          dayjs.Dayjs
        ])
      : undefined;

  const handleRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    const [from, to] = dateStrings;
    onDateRangeChange(from || null, to || null);
  };

  const isDropdown = isCompactFilters;
  const controlStyle = isDropdown ? { width: "100%" } : undefined;

  const renderFilters = (variant: "inline" | "dropdown") => (
    <div
      className={`orders-filterRow orders-filterRow--${variant}`}
      {...(variant === "dropdown"
        ? {
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
            },
          }
        : {})}
    >
      <Input
        suffix={<IoSearchOutline />}
        placeholder="Search order id"
        type="number"
        onChange={(e) => onSearchChange(e?.target?.value)}
        className="orders-filterItem orders-filterItem--search"
        value={searchValue}
        size="large"
        style={controlStyle}
      />
      <RangePicker
        className="orders-filterItem orders-filterItem--range"
        onChange={handleRangeChange}
        value={rangeValue}
        allowClear
        size="large"
        style={controlStyle}
      />
      <Select
        value={statusValue}
        options={orderStatusOptions}
        onChange={onStatusChange}
        className="orders-filterItem"
        placeholder="Select status"
        size="large"
        style={controlStyle}
      />
      <Button
        type="primary"
        ghost
        onClick={onRefresh}
        loading={isRefreshing}
        className="orders-filterItem"
        size="large"
        style={controlStyle}
      >
        Refresh
      </Button>
    </div>
  );

  if (isDropdown) {
    return (
      <Dropdown
        trigger={["click"]}
        open={filtersDropdownOpen}
        onOpenChange={onFiltersDropdownChange}
        dropdownRender={() => (
          <div className="orders-filterDropdownContent">
            {renderFilters("dropdown")}
          </div>
        )}
        overlayClassName="orders-filterDropdownOverlay"
      >
        <Button
          icon={<LuFilter size={18} />}
          className="orders-filterTrigger"
          size="large"
        >
          Filters
        </Button>
      </Dropdown>
    );
  }

  return <div className="orders-filterWrapper">{renderFilters("inline")}</div>;
};

export default OrdersFilterBar;
