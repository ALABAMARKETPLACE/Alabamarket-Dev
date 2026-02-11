import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { Card, Image } from "antd";
import moment from "moment";
import { Col, Row } from "react-bootstrap";
import { formatCurrency } from "@/utils/formatNumber";

type ProductDetails = {
  name?: string;
  sku?: string;
  image?: string;
  images?: string[];
  [key: string]: unknown;
};

type OrderItem = {
  name?: string;
  sku?: string;
  image?: string;
  quantity?: number;
  price?: number;
  totalPrice?: number;
  createdAt?: string;
  variantId?: string | number;
  combination?: ComboItem[];
  product?: ProductDetails;
  Product?: ProductDetails;
  [key: string]: unknown;
};

type ComboItem = {
  variant?: string;
  value?: string;
  [key: string]: unknown;
};

type Props = {
  data: OrderItem[];
};

export default function ProductTab(props: Props) {
  const settings = useAppSelector(reduxSettings);
  const DATE_FORMAT = "DD/MM/YYYY";

  const getProductData = (item: OrderItem) => {
    // Try to find the product details object if nested
    const productDetails = item?.product || item?.Product || {};

    return {
      // Product static details (name, sku, image) might be in nested object
      name: item?.name || productDetails?.name || "N/A",
      sku: item?.sku || productDetails?.sku || "N/A",
      image:
        item?.image ||
        productDetails?.image ||
        (Array.isArray(productDetails?.images) ? productDetails.images?.[0] : null) ||
        "/images/placeholder-product.png",

      // Order specific details should be on the item itself
      quantity: item?.quantity || 0,
      price: item?.price || 0,
      totalPrice: item?.totalPrice || 0,
      createdAt: item?.createdAt,

      // Variants
      variantId: item?.variantId,
      combination: item?.combination,
    };
  };

  return (
    <Card title={"Products"}>
      {Array.isArray(props?.data) &&
        props?.data?.map((rawItem, index) => {
          const item = getProductData(rawItem);
          return (
            <div
              key={index}
              className="mb-4 pb-3 border-bottom last-0-border-bottom"
            >
              <Row className="gy-3">
                <Col xs={12} sm={4} md={3}>
                  <Image
                    src={item.image}
                    preview={false}
                    alt="Product Image"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Col>
                <Col xs={12} sm={8} md={9}>
                  <div className="d-flex flex-column gap-1">
                    <div className="fw-bold fs-6">{item.name}</div>

                    <div className="d-flex flex-wrap gap-x-4 gap-y-1 text-muted small">
                      <div>
                        Quantity:{" "}
                        <span className="text-dark">{item.quantity}</span>
                      </div>
                      <div>
                        SKU: <span className="text-dark">{item.sku}</span>
                      </div>
                      <div>
                        Ordered:{" "}
                        <span className="text-dark">
                          {item.createdAt
                            ? moment(item.createdAt).format(DATE_FORMAT)
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-3 mt-2">
                      <div className="bg-light px-2 py-1 rounded">
                        Each:{" "}
                        <span className="fw-medium">
                          {settings.currency === "NGN"
                            ? "₦"
                            : settings.currency}{" "}
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div className="bg-light px-2 py-1 rounded">
                        Total:{" "}
                        <span className="fw-bold text-primary">
                          {settings.currency === "NGN"
                            ? "₦"
                            : settings.currency}{" "}
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    </div>

                    {item.variantId && Array.isArray(item.combination) && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <small className="text-muted d-block mb-1">
                          Variants:
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          {item.combination?.map(
                            (comboItem: ComboItem, key: number) => (
                              <span
                                key={key}
                                className="badge bg-secondary text-white fw-normal"
                              >
                                {comboItem?.variant}: {comboItem?.value}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          );
        })}
    </Card>
  );
}
