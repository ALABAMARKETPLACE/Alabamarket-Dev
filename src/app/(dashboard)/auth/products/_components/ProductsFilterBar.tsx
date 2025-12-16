"use client";

import React from "react";
import {
  Button,
  Dropdown,
  Input,
  Select,
  TreeSelect,
  type TreeSelectProps,
} from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { LuFilter } from "react-icons/lu";
import options from "./options.json";

type StoreOption = {
  value: string | number;
  label: string;
};

interface ProductsFilterBarProps {
  isAdmin: boolean;
  isCompactFilters: boolean;
  filtersDropdownOpen: boolean;
  onFiltersDropdownChange: (open: boolean) => void;
  onUploadImage: () => void;
  onUploadFile: () => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
  statusValue: string;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value?: string | number | null) => void;
  categoryValue: string;
  treeData: TreeSelectProps["treeData"];
  storeSelect: {
    value: string | number | "all" | null;
    onChange: (value: string | number | "all") => void;
    options: StoreOption[];
    loading: boolean;
  };
}

const ProductsFilterBar = ({
  isAdmin,
  isCompactFilters,
  filtersDropdownOpen,
  onFiltersDropdownChange,
  onUploadImage,
  onUploadFile,
  onSearchChange,
  searchValue,
  statusValue,
  onStatusChange,
  onCategoryChange,
  categoryValue,
  treeData,
  storeSelect,
}: ProductsFilterBarProps) => {
  const renderControls = (variant: "inline" | "dropdown") => {
    const wrapperProps =
      variant === "dropdown"
        ? {
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
            },
          }
        : {};

    const handleUploadImage = () => {
      if (variant === "dropdown") {
        onFiltersDropdownChange(false);
      }
      onUploadImage();
    };

    const handleUploadFile = () => {
      if (variant === "dropdown") {
        onFiltersDropdownChange(false);
      }
      onUploadFile();
    };

    const storeOptionsWithAll: StoreOption[] = [
      { value: "all", label: "All Stores (Admin)" },
      ...(storeSelect.options ?? []),
    ];

    const controls = (
      <>
        {isAdmin && (
          <Select
            showSearch
            placeholder="Select Store"
            optionFilterProp="label"
            options={storeOptionsWithAll}
            value={(storeSelect.value ?? "all") as string | number}
            loading={storeSelect.loading}
            onChange={(value) =>
              storeSelect.onChange((value ?? "all") as string | number | "all")
            }
            style={{ minWidth: 220 }}
            className="products-filterItem"
            size="large"
          />
        )}
        <Input
          suffix={<IoSearchOutline />}
          placeholder="Search . . ."
          onChange={(e) => onSearchChange(e.target.value)}
          className="products-filterItem products-filterItem--search"
          value={searchValue}
          size="large"
        />
        <Select
          value={statusValue}
          placeholder="Select Status"
          options={options}
          onChange={onStatusChange}
          className="products-filterItem"
          size="large"
        />
        <TreeSelect
          dropdownStyle={{ maxHeight: 400, overflow: "auto", width: "200px" }}
          treeData={[
            ...(treeData || []),
            { title: "All Category", value: "" },
          ]}
          placeholder="Select Category"
          onChange={(value) =>
            onCategoryChange(value as string | number | null | undefined)
          }
          className="products-filterItem products-filterTree"
          value={categoryValue || undefined}
          allowClear
          size="large"
        />
      </>
    );

    return (
      <div
        className={`products-filterControls products-filterControls-${variant}`}
        {...wrapperProps}
      >
        <div className="products-filterRow">
          <Button onClick={handleUploadImage} size="large">
            Upload Image
          </Button>
          <Button onClick={handleUploadFile} size="large">
            Upload Excel
          </Button>
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
      overlayClassName="products-filterDropdownOverlay"
    >
      <Button
        icon={<LuFilter size={18} />}
        className="products-filterTrigger"
        size="large"
      >
        Filters
      </Button>
    </Dropdown>
  );
};

export default ProductsFilterBar;

