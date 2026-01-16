import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { Card, Image } from "antd";
import moment from "moment";
import { Col, Row } from "react-bootstrap";
import { formatCurrency } from "@/utils/formatNumber";

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
          <div key={index} className="mb-4 pb-3 border-bottom last-0-border-bottom">
            <Row className="gy-3">
              <Col xs={12} sm={4} md={3}>
                <Image 
                  src={item?.image} 
                  preview={false} 
                  alt="Product Image" 
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
                />
              </Col>
              <Col xs={12} sm={8} md={9}>
                <div className="d-flex flex-column gap-1">
                  <div className="fw-bold fs-6">{item?.name}</div>
                  
                  <div className="d-flex flex-wrap gap-x-4 gap-y-1 text-muted small">
                    <div>Quantity: <span className="text-dark">{item?.quantity}</span></div>
                    <div>SKU: <span className="text-dark">{item?.sku || "N/A"}</span></div>
                    <div>Ordered: <span className="text-dark">{moment(item?.createdAt).format(DATE_FORMAT)}</span></div>
                  </div>

                  <div className="d-flex flex-wrap gap-3 mt-2">
                    <div className="bg-light px-2 py-1 rounded">
                      Each: <span className="fw-medium">{settings.currency === "NGN" ? "₦" : settings.currency} {formatCurrency(item?.price)}</span>
                    </div>
                    <div className="bg-light px-2 py-1 rounded">
                      Total: <span className="fw-bold text-primary">{settings.currency === "NGN" ? "₦" : settings.currency} {formatCurrency(item?.totalPrice)}</span>
                    </div>
                  </div>

                  {item?.variantId && Array.isArray(item?.combination) && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted d-block mb-1">Variants:</small>
                      <div className="d-flex flex-wrap gap-2">
                        {item.combination.map((comboItem: any, key: number) => (
                          <span key={key} className="badge bg-secondary text-white fw-normal">
                            {comboItem?.variant}: {comboItem?.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        ))}
    </Card>
  );
}
