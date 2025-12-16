"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoCaretDownOutline } from "react-icons/io5";
import { AutoComplete, Button, Input, message, Modal } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { IoLocationSharp } from "react-icons/io5";

import {
  AUTO_COMPLETE,
  GET_PLACE,
  GET_GEOCODE,
} from "../../util/locationCalls";

import { clearLocation, storeLocation } from "../../redux/slice/locationSlice";

function Location() {
  const dispatch = useDispatch();
  const Location = useSelector((state: any) => state?.Location?.location);
  const hasStoredLocation =
    Location &&
    typeof Location === "object" &&
    Object.keys(Location).length > 0;
  const [viewModal, setViewModal] = useState<boolean>(!hasStoredLocation);
  const [hasDismissed, setHasDismissed] = useState<boolean>(false);
  // dispatch(clearLocation())
  const [loading, setLoading] = useState<any>(false);
  const [text, setText] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>([]);

  useEffect(() => {
    const hasLocation =
      Location &&
      typeof Location === "object" &&
      Object.keys(Location).length > 0;

    if (hasLocation) {
      setHasDismissed(false);
      setViewModal(false);
    } else if (!hasDismissed) {
      setViewModal(true);
    }
  }, [Location, hasDismissed]);

  const searchLocation = async (value: any) => {
    try {
      setText(value);
      if (value?.length > 2) {
        setLoading(true);
        var response: any = await AUTO_COMPLETE(value);
        if (response?.length) {
          setRecommendation(response);
        } else {
          setRecommendation([]);
        }
      } else {
        setRecommendation([]);
      }
      setLoading(false);
    } catch (err) {
      console.log("searchProduct", err);
    }
  };

  const convertLocation = async (item: any) => {
    try {
      setLoading(true);
      var response: any = await GET_PLACE(item);
      if (response?.country) {
        dispatch(storeLocation(response));
        setLoading(false);
        setRecommendation([]);
        setText(null);
        setTimeout(() => {
          setViewModal(false);
        }, 50);
      }
    } catch (err) {
      setLoading(false);
      console.log("searchProduct", err);
    }
  };

  async function geocdeLocation() {
    try {
      setLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const coords = position.coords;
          const response: any = await GET_GEOCODE(
            coords?.latitude,
            coords?.longitude
          );
          if (response?.country) {
            console.log("herererere");
            dispatch(storeLocation(response));
            setRecommendation([]);
            setText(null);
            setTimeout(() => {
              setViewModal(false);
            }, 50);
          }
          setLoading(false);
        });
      } else {
        message.error("Not supported");
      }
    } catch (err) {
      message.error("Not supported");
    }
  }

  return (
    <>
      <div
        className="Header-locationBox"
        onClick={() => setViewModal(!viewModal)}
      >
        <div className="Header-Text2">Deliver To</div>
        <div className="Header-locationBox2">
          <div className="Header-Text3">
            {Location?.country ? Location?.full_address : "Delivery Loaction"}{" "}
          </div>
          <div style={{ marginTop: -5 }}>
            <IoCaretDownOutline />
          </div>
        </div>
      </div>
      {viewModal ? (
        <Modal
          title="Delivery Location"
          open={viewModal}
          onCancel={() => {
            setHasDismissed(true);
            setViewModal(false);
          }}
          width={500}
          footer={false}
        >
          <div style={{ margin: 20 }} />
          <AutoComplete
            size="large"
            style={{ width: "100%" }}
            onSearch={(text) => searchLocation(text)}
            options={recommendation}
            onSelect={(value, option) => convertLocation(option)}
          >
            <Input
              prefix={<IoSearchOutline size={20} />}
              size="large"
              placeholder="Search for area or street name . . . "
              style={{ padding: 10 }}
            />
          </AutoComplete>
          <br /> <br />
          <div className="Header-LocationModal-box">
            <div className="Header-LocationModal-box2">
              <IoLocationSharp color={Location?.country ? "green" : ""} />
            </div>
            <br />
            <h6 className="page-text2">
              {Location?.country
                ? Location?.full_address
                : "Select a location for delivery"}
            </h6>
            <div className="page-text3">
              {Location?.plus_code ? Location?.plus_code + ", " : ""}
              {Location?.district ? Location?.district + ", " : ""}
              {Location?.state ? Location?.state + ", " : ""}
              {Location?.country
                ? Location?.country
                : "Choose your address location to see product availability and delivery options"}
            </div>
            <br />
            <Button
              loading={loading}
              type="primary"
              size="large"
              style={{ borderRadius: 100 }}
              onClick={() => geocdeLocation()}
            >
              {`${Location?.country ? "Change" : "Use"} my current location`}
            </Button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
export default Location;
