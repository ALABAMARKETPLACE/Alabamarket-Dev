"use client";
import { Button } from "antd";
import React, { useReducer } from "react";
import { IoIosAdd } from "react-icons/io";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import { reducer } from "./_components/reducer";
import BusinessTypeFormModal from "./_components/formModal";

function BusinessType() {
  const [state, dispatch] = useReducer(reducer, { status: false, type: "add" });
  const {
    data: businessType,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<any>({
    queryKey: [API.BUSINESS_TYPE, { order: "DESC" }],
  });

  return (
    <div>
      <div style={{ marginTop: -10 }} />
      <div className="dashboard-pageHeader">
        <div>Business Type</div>
        <div className="dashboard-pageHeaderBox">
          <Button
            type="primary"
            icon={<IoIosAdd />}
            onClick={() => dispatch({ type: "add" })}
          >
            Add
          </Button>
          <Button
            type="primary"
            ghost
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <DataTable
          data={Array.isArray(businessType?.data) ? businessType?.data : []}
          edit={(item: any) => dispatch({ type: "edit", item })}
        />
      )}
      <BusinessTypeFormModal
        visible={state.status}
        onClose={() => dispatch({ type: "close" })}
        type={state.type}
        data={state.item}
      />
    </div>
  );
}

export default BusinessType;
