"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { IoLocationOutline } from "react-icons/io5";
import NewAddressForm from "./newAddressForm";
import NewAddressItem from "./newAddressItem";
import GuestAddressForm, { getGuestAddress } from "./guestAddressForm";
import { storeAddress } from "@/redux/slice/checkoutSlice";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";

interface NewAddressBoxProps {
  onGuestEmailChange?: (email: string) => void;
}

function NewAddressBox({ onGuestEmailChange }: NewAddressBoxProps) {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Checkout = useSelector((state: any) => state?.Checkout);
  const [isLoading, setIsLoading] = useState(true);
  const [addNew, setAddNew] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>([]);

  // Use ref to track if we've already loaded guest data
  const guestDataLoadedRef = useRef(false);
  // Store callback in ref to avoid dependency issues
  const onGuestEmailChangeRef = useRef(onGuestEmailChange);

  // Update ref when callback changes
  useEffect(() => {
    onGuestEmailChangeRef.current = onGuestEmailChange;
  }, [onGuestEmailChange]);

  useEffect(() => {
    if (isAuthenticated) {
      getAddress();
    } else if (!guestDataLoadedRef.current) {
      // For guest users, check if we have saved address (only once)
      guestDataLoadedRef.current = true;
      const savedData = getGuestAddress();
      if (savedData?.address) {
        dispatch(storeAddress(savedData.address));
        if (onGuestEmailChangeRef.current && savedData.email) {
          onGuestEmailChangeRef.current(savedData.email);
        }
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, dispatch]);

  const getAddress = async () => {
    try {
      const response: any = await GET(API.NEW_ADDRESS_ALL, {
        order: "DESC",
        take: 50,
        page: 1,
      });

      if (response?.status) {
        setData(response?.data);
        // Auto-select first address if none selected
        if (response?.data?.length > 0 && !Checkout?.address?.id) {
          dispatch(storeAddress(response.data[0]));
        }
      }
      setAddNew(false);
      setIsLoading(false);
    } catch (err) {
      console.log("err", err);
      setIsLoading(false);
    }
  };

  const handleGuestAddressSubmit = (address: any, email: string) => {
    if (onGuestEmailChange) {
      onGuestEmailChange(email);
    }
  };

  // Guest checkout UI
  if (!isAuthenticated) {
    return (
      <div>
        <div className="Cart-row" style={{ padding: 0 }}>
          <div className="Cart-txt1">
            <span className="Cart-txt1Icon">
              <IoLocationOutline />
            </span>
            DELIVERY DETAILS
          </div>
        </div>
        <div className="Cart-line" />
        <div style={{ margin: 20 }} />
        <GuestAddressForm onAddressSubmit={handleGuestAddressSubmit} />
      </div>
    );
  }

  // Authenticated user UI
  return (
    <div>
      <div className="Cart-row" style={{ padding: 0 }}>
        <div className="Cart-txt1">
          <span className="Cart-txt1Icon">
            <IoLocationOutline />
          </span>
          DELIVERY ADDRESS
        </div>
        <div style={{ flex: 1 }} />
        <div>
          <div
            className="Cart-txt2"
            style={{ color: "#000", cursor: "pointer" }}
            onClick={() => setAddNew(true)}
          >
            New Address +{" "}
          </div>
        </div>
      </div>
      <div className="Cart-line" />
      <div style={{ margin: 20 }} />
      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div>
          {data?.length && !addNew ? (
            <Row>
              {data?.map((item: any, key: number) => {
                return (
                  <Col sm={6} xs={12} style={{ marginBottom: 10 }} key={key}>
                    <NewAddressItem
                      item={item}
                      selected={Checkout?.address?.id}
                      onSelect={(value: any) => {
                        dispatch(storeAddress(value));
                      }}
                    />
                  </Col>
                );
              })}
            </Row>
          ) : (
            <NewAddressForm
              closable={data?.length ? true : false}
              close={() => setAddNew(false)}
              onChange={() => getAddress()}
            />
          )}
        </div>
      )}
      <br />
    </div>
  );
}
export default NewAddressBox;
