import React, { useEffect, useState } from "react";
import API from "../../../../config/API";
import { useSelector } from "react-redux";
import { GET } from "../../../../util/apicall";
import StoreItem from "../../../../components/store_item";
import { Row, Col } from "react-bootstrap";
import {
  reduxLatLong,
  reduxLocation,
} from "../../../../redux/slice/locationSlice";
import { reduxSettings } from "../../../../redux/slice/settingsSlice";
export default function TopSellingStore() {
  const [topStore, setTopStore] = useState<any>();
  const data = useSelector(reduxLatLong);
  const LocationDetails = useSelector(reduxLocation);
  const Settings = useSelector(reduxSettings);
  useEffect(() => {
    getTopStore();
  }, [data]);
  const getTopStore = async () => {
    const url = `${API.PRODUCT_SEARCH_TOPSTORE}?lattitude=${data.latitude}&longitude=${data.longitude}&take=12&radius=${Settings?.radius}`;
    try {
      const response: any = await GET(url, {});
      if (response?.status) {
        setTopStore(response.data);
      }
    } catch (error) {}
  };

  return (
    <div className="container-fluid home-full-width">
      {topStore && topStore?.length > 0 ? (
        <Row className="">
          <div className="Horizontal-Heading1 Homescreen-txt2">
            Choose your store in{" "}
            <span className="Homescreen-txt3">{LocationDetails?.state}</span>
          </div>
          {topStore?.map((item: any) => (
            <Col key={item.id} xs={12} sm={6} md={4}>
              <StoreItem item={item} />
            </Col>
          ))}
        </Row>
      ) : null}
    </div>
  );
}
