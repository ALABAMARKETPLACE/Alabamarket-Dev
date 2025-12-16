"use client";
import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { IoLocationOutline } from "react-icons/io5";
import AddressForm from "./addressForm";
import AddressItem from "./addressItem";
import { storeAddress } from "@/redux/slice/checkoutSlice";
import { GET, PUT } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";

function AddressBox() {
  const dispatch = useDispatch();
  const Checkout = useSelector((state: any) => state?.Checkout);
  const [isLoading, setIsLoading] = useState(true);
  const [addNew, setAddNew] = useState(false);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    getAddress();
  }, []);
  const getDefaultAddress = (addresses: any[]) => {
    if (Array.isArray(addresses)) {
      const defaultAddress = addresses.find(
        (item: any) => item.default == true
      );
      if (defaultAddress) {
        dispatch(storeAddress(defaultAddress));
      }
    }
  };
  const getAddress = async () => {
    try {
      const response: any = await GET(API.ADDRESS_GET);
      if (response.status) {
        getDefaultAddress(response?.data);
        setData(response?.data);
      }
      setAddNew(false);
      setIsLoading(false);
    } catch (err) {
      console.log("err", err);
      setIsLoading(false);
    }
  };
  const setDefaultAddress = async (addr: any) => {
    const url = API.ADDRESS_SET_DEFAULT + addr.id;
    try {
      // setDefaultLoading(true);
      if (addr.default != true) {
        const response: any = await PUT(url, {});
        if (response.status) {
        }
      }
    } catch (err) {
    } finally {
      // setDefaultLoading(false);
    }
  };
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
        <div>Loading . . .</div>
      ) : (
        <div>
          {data?.length && !addNew ? (
            <Row>
              {data?.map((item: any,key:number) => {
                return (
                  <Col sm={6} xs={12} style={{ marginBottom: 10 }} key={key}>
                    
                    <AddressItem
                      key={item?.id}
                      item={item}
                      selected={Checkout?.address?.id}
                      onSelect={(value: any) => {
                        dispatch(storeAddress(value));
                        setDefaultAddress(value)
                      }}
                    />
                  </Col>
                );
              })}
            </Row>
          ) : (
            <AddressForm
              closable={data?.length ? true : false}
              close={() => setAddNew(false)}
              onChange={(value: any) => getAddress()}
            />
          )}
        </div>
      )}
      <br />
    </div>
  );
}
export default AddressBox;
