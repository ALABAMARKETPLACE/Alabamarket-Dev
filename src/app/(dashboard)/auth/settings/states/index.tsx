"use client";
import React, { useReducer } from "react";
import { reducer } from "./_components/reducer";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import { Button } from "antd";
import { IoIosAdd } from "react-icons/io";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import StateFormModal from "./_components/formModal";

function States() {
  const [state, dispatch] = useReducer(reducer, { status: false, type: "add" });
  const {
    data: stateData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<any>({
    queryKey: [API.STATES, { order: "DESC" }],
  });

  return (
    <div>
      <div style={{ marginTop: -10 }} />
      <div className="dashboard-pageHeader">
        <div>States</div>
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
          data={Array.isArray(stateData?.data) ? stateData?.data : []}
          edit={(item: any) => dispatch({ type: "edit", item })}
        />
      )}
      <StateFormModal
        visible={state.status}
        onClose={() => dispatch({ type: "close" })}
        type={state.type}
        data={state.item}
      />
    </div>
  );
}

export default States;
