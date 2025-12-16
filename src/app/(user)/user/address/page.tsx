"use client";
import { Button, List, notification, Popconfirm } from "antd";
import React, { useState } from "react";
import useToggle from "@/shared/hook/useToggle";
import API from "@/config/API";
import { DELETE, GET } from "@/util/apicall";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NewAddressModal from "./_components/newAddressModal";

function UserAddress() {
  const [openModal, toggleModal] = useToggle(false);
  const [type, setType] = useState<string>("update");
  const [selected, setSelected] = useState<any>({});
  const [notificationApi, contextHolder] = notification.useNotification();
  const pageSize = 10;
  const queryClient = useQueryClient();

  // Fetch addresses using NEW_ADDRESS API
  const {
    data: address,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryFn: async () =>
      await GET(API.NEW_ADDRESS_ALL, {
        order: "DESC",
        take: pageSize,
        page: 1,
      }),
    queryKey: ["new_address_items"],
    retry: 1,
  });

  // Delete mutation
  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API.NEW_ADDRESS + id);
    },
    onError: (error, variables, context) => {
      notificationApi.error({ message: error?.message });
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["new_address_items"] });
      notificationApi.success({ message: `Address removed successfully` });
    },
  });

  return (
    <>
      <div className="mb-3">
        {contextHolder}
        <div>
          <Button
            className="w-100"
            onClick={() => {
              toggleModal(true);
              setType("add");
              setSelected({});
            }}
            type="dashed"
          >
            + Add Address
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : Array.isArray(address?.data) && address?.data?.length > 0 ? (
          <List
            className="mt-3"
            itemLayout="horizontal"
            dataSource={address?.data}
            pagination={
              address?.data?.length > pageSize
                ? {
                    pageSize: pageSize,
                  }
                : false
            }
            renderItem={(item: any, index) => (
              <List.Item>
                <div className="w-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <span className="badge bg-primary text-uppercase mb-2">
                        {item?.address_type}
                      </span>

                      <div className="fw-bold fs-6 mb-1">
                        <span>{item?.phone_no}</span>
                      </div>

                      <div className="mb-2" style={{ color: "#666" }}>
                        {item?.full_address}
                      </div>

                      <div className="d-flex gap-3 mb-2">
                        <span className="fw-bold">
                          Pincode: {item?.pincode}
                        </span>
                      </div>

                      {item?.countryDetails && (
                        <div className="text-muted small">
                          <i className="bi bi-geo-alt"></i>{" "}
                          {item?.countryDetails?.country_name}
                        </div>
                      )}

                      {item?.stateDetails && (
                        <div className="text-muted small">
                          <i className="bi bi-geo-alt"></i>{" "}
                          {item?.stateDetails?.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-2">
                    <span>
                      <a
                        className="pe-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setType("update");
                          setSelected(item);
                          toggleModal(true);
                        }}
                      >
                        Edit
                      </a>
                      <Popconfirm
                        placement="topRight"
                        title={"Are you sure to delete this address?"}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => mutationDelete.mutate(item?.id)}
                      >
                        <a
                          className="text-danger"
                          style={{ cursor: "pointer" }}
                        >
                          Delete
                        </a>
                      </Popconfirm>
                    </span>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : isError ? (
          <div className="text-center py-5">
            <div className="alert alert-danger">
              Failed to load addresses. Please try again.
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-house-door fs-1"></i>
              <p className="mt-2">
                No addresses found. Add your first address!
              </p>
            </div>
          </div>
        )}

        <NewAddressModal
          open={openModal}
          modalClose={() => toggleModal(false)}
          type={type}
          selected={selected}
          fetchAddress={refetch}
        />
      </div>
    </>
  );
}

export default UserAddress;

export const dynamic = "force-dynamic";
