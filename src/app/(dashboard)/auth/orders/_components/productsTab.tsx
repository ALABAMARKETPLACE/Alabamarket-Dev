import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { Card, Image } from "antd";
import moment from "moment";
import { Col, Row } from "react-bootstrap";

type Props = {
  data: any[];
};

export default function ProductTab(props: Props) {
  const settings = useAppSelector(reduxSettings);
  const DATE_FORMAT = "DD/MM/YYYY";

  return (
    <Card title={"Products"}>
      {Array.isArray(props?.data) &&
        props?.data?.map((item, index) => (
          <Row key={index}>
            <Col sm={4}>
              <Image src={item?.image} preview={false} alt="Product Image" />
            </Col>
            <Col sm={8}>
              <div>
                <div>Name : {item?.name}</div>
                <div>Quantity : {item?.quantity}</div>
                <div>BarCode : {item?.barcode}</div>
                <div>SKU : {item?.sku}</div>
                <div>
                  Ordered on : {moment(item?.createdAt).format(DATE_FORMAT)}
                </div>
                <div>
                  Each : {Number(item?.price)?.toFixed(2)} {settings.currency}
                </div>
                <div>
                  Total : {Number(item?.totalPrice)?.toFixed(2)}
                  {settings.currency}
                </div>
                {item?.variantId && Array.isArray(item?.combination) && (
                  <div>
                    variant :-
                    {item.combination.map((comboItem: any, key: number) => (
                      <div key={key}>
                        {`${comboItem?.variant} : ${comboItem?.value}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        ))}
    </Card>
  );
}
