"use client";
import React, { useReducer } from "react";
import { reducer } from "./_components/reducer";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import { Button } from "antd";
import { IoIosAdd } from "react-icons/io";
import Loading from "@/app/(dashboard)/_components/loading";
import DataTable from "./_components/dataTable";
import CountryFormModal from "./_components/formModal";

function Countries() {
  const [state, dispatch] = useReducer(reducer, { status: false, type: "add" });
  const {
    data: countryData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<any>({
    queryKey: [API.COUNTRIES, { order: "DESC" }],
  });

  return (
    <div>
      <div style={{ marginTop: -10 }} />
      <div className="dashboard-pageHeader">
        <div>Countries</div>
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
          data={Array.isArray(countryData?.data) ? countryData?.data : []}
          edit={(item: any) => dispatch({ type: "edit", item })}
        />
      )}
      <CountryFormModal
        visible={state.status}
        onClose={() => dispatch({ type: "close" })}
        type={state.type}
        data={state.item}
      />
    </div>
  );
}

export default Countries;
