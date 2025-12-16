"use client";
import { AutoComplete, Button, Form, Input, Tooltip, notification } from "antd";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { LoadingOutlined } from "@ant-design/icons";
import useDebounce from "@/shared/hook/useDebounce";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import Country from "@/shared/helpers/countryCode.json"

function AutoCompleteLocation(props: any) {
  const [options, setOptions] = useState<any[]>([]);
  const [searchParam, setSearchParam] = useState(
    props?.value ? props?.value : ""
  );
  const searchLocation = useDebounce(searchParam, 300);
  const [notificationApi, contextHolder2] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    locationAutoComplete(searchLocation);
  }, [searchLocation]);

  const getAutoComplete = (value: string) => {
    setSearchParam(value);
  };

  const getLocation = async (option: { value: string; key: string }) => {
    try {
      await getCurrentLocation(null, null, option?.key);
    } catch (err) {}
  };

  const locationAutoComplete = async (value: string) => {
    try {
      if (value?.length < 2) return;
      setIsLoading(true);
      const response: any = await GET(
        API.AUTO_COMPLETE + `?query=${value}`
      );
      if (response?.status) {
        setOptions(response?.data);
      } else {
        notificationApi.error({ message: `Failed to get Location details` });
      }
    } catch (error) {
      notificationApi.error({ message: `Failed to get Location details` });
    } finally {
      setIsLoading(false);
    }
  };

  function handleLocationClick() {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: any) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        getCurrentLocation(latitude, longitude);
      }, handleError);
    } else {
      setIsLoading(false);
      notificationApi.error({ message: `GeoLocation not supported` });
    }
  }

  const handleError = (error: any) => {
    setIsLoading(false);
    notificationApi.error({
      message: `Unable to get your Location. reason:${error.message}`,
    });
  };

  const getCurrentLocation = async (
    lat: number | null,
    long: number | null,
    key?: string
  ) => {
    try {
      const url = key
        ? API.GOOGLE_PLACEPICKER + `?place_id=${key}`
        : API.GOOGLE_PLACEPICKER + `?latitude=${lat}&longitude=${long}`;
      const response: any = await GET(url);
      if (response.status) {
        const locationData: any = response.data;
        const countryCode = Country.find(
          (item) => item.name === locationData?.country
        );
        let obj = {
          code: countryCode?.dial_code,
          pincode: locationData?.postal_code,
          state: locationData?.state,
          street: locationData?.subLocality || locationData?.district,
          city: locationData?.taluk || locationData?.district,
          address: locationData.street_address ?? locationData.full_address,
          location: locationData?.subLocality,
          country: locationData?.country,
          lat: locationData?.latitude,
          long: locationData?.longitude,
        };
        props?.setCurrentLocation(obj);
        notificationApi.success({
          message: `Success`,
          description: `Address set to ${locationData.full_address}`,
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
        notificationApi.error({ message: response?.message });
      }
    } catch (err) {
      setIsLoading(false);
      notificationApi.error({ message: `Unable to get your Location.` });
    }
  };

  return (
    <div>
      {contextHolder2}
      <Form.Item
        noStyle
        label={props?.label ? "Location" : ""}
        name="location"
        rules={[]}
      >
        <AutoComplete
          className="w-100"
          options={options}
          filterOption={(inputValue, option) =>
            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          onChange={getAutoComplete}
          onSelect={(value, option) => getLocation(option)}
        >
          <Input
            placeholder="Search Location"
            size={props?.size}
            allowClear
            value={searchParam}
            prefix={<IoSearch />}
            className="w-100"
            suffix={
              <Tooltip title="Set Your current Location">
                {isLoading ? (
                  <LoadingOutlined
                    style={{ fontSize: 18, color: API.COLOR }}
                    spin
                  />
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleLocationClick()}
                  >
                    My Location
                  </Button>
                )}
              </Tooltip>
            }
          />
        </AutoComplete>
      </Form.Item>
    </div>
  );
}

export default AutoCompleteLocation;
