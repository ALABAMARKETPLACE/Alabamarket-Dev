import { AutoComplete, Button, Input, Modal, notification, Spin } from "antd";
import React, { useState, useCallback } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";
import { useQuery } from "@tanstack/react-query";
import API from "@/config/API_ADMIN";
import { LoadingOutlined } from "@ant-design/icons";
import { GET } from "@/util/apicall";

const mapContainerStyle = {
  width: "100%",
  height: "200px",
};

interface props {
  open: boolean;
  close: Function;
  title?: string;
  defaultLocation?: { lat: number; long: number };
  onChange: (lat: number, long: number) => void;
}

function LocationPicker({
  open,
  close,
  title,
  onChange,
  defaultLocation,
}: props) {
  const [zoom, setZoom] = useState(10);
  const [loading, setLoading] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const [query, , handleChange] = useDebounceQuery("", 300);
  const [mapCenter, setMapCenter] = useState({
    lat: defaultLocation?.lat || 0.0,
    lng: defaultLocation?.long || 0.0,
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_TOKEN as string,
  });

  const message = (msg: string, status: "error" | "success" = "error") =>
    Notifications[status]({
      message: msg,
    });

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords?.latitude;
            const long = position.coords?.longitude;
            setMapCenter({ lat, lng: long });
            onChange(lat, long);
            message("Location is set to your Current location.", "success");
            close();
          },
          () => message("Unable to get your location.")
        );
      } else {
        message("Location is not supported");
      }
    } catch (err) {
      message("Location is not supported");
    } finally {
      setLoading(false);
    }
  };

  const { data: options, isLoading } = useQuery<any>({
    queryKey: [API.AUTO_COMPLETE, { query }],
    enabled: !!query,
    select: (res) => (res?.status ? res?.data : []),
  });

  const getLocation = async (place_id: string) => {
    try {
      const response: any = await GET(API.GOOGLE_PLACEPICKER, { place_id });
      if (response?.status) {
        const lat = response?.data?.latitude;
        const lng = response?.data?.longitude;
        setMapCenter({ lat, lng });
        onChange(lat, lng);
        message("Location is selected successfully", "success");
        close();
      }
    } catch (err) {
      message("Failed to get Location.");
    }
  };

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMapCenter({ lat, lng });
      onChange(lat, lng);
      message("Location is selected successfully", "success");
    }
  }, [onChange, message]);

  if (!isLoaded) return <Spin />;

  return (
    <Modal
      title={title || "Select a location"}
      open={open}
      onCancel={() => close()}
      width={500}
      footer={false}
      centered={true}
    >
      {contextHolder}
      <div className="d-flex flex-column align-items-center gap-3">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={zoom}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          }}
          onZoomChanged={() => {
            // This would require a ref to access the map instance
            // Simplified for now
          }}
        >
          <Marker position={mapCenter} />
        </GoogleMap>
        <AutoComplete
          size="large"
          className="w-100"
          onChange={(v) => handleChange(v)}
          options={options}
          onSelect={(value, option) => getLocation(option?.key)}
        >
          <Input
            prefix={
              isLoading ? (
                <Spin indicator={<LoadingOutlined spin />} size="small" />
              ) : (
                <IoSearchOutline size={20} />
              )
            }
            size="large"
            placeholder="Search for area or street name . . . "
            style={{ padding: 10 }}
          />
        </AutoComplete>

        <Button
          type="primary"
          size="large"
          block
          onClick={getCurrentLocation}
          loading={loading}
        >
          Use Current Location
        </Button>
      </div>
    </Modal>
  );
}
        <AutoComplete
          size="large"
          className="w-100"
          onChange={(v) => handleChange(v)}
          options={options}
          onSelect={(value, option) => getLocation(option?.key)}
        >
          <Input
            prefix={
              isLoading ? (
                <Spin indicator={<LoadingOutlined spin />} size="small" />
              ) : (
                <IoSearchOutline size={20} />
              )
            }
            size="large"
            placeholder="Search for area or street name . . . "
            style={{ padding: 10 }}
          />
        </AutoComplete>

        <Button
          type="primary"
          size="large"
          block
          onClick={getCurrentLocation}
          loading={loading}
        >
          Use Current Location
        </Button>
      </div>
    </Modal>
  );
}

export default LocationPicker;
