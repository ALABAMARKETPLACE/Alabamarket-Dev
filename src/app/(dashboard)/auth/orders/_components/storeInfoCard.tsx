import { Card } from "antd";
import { Descriptions, Image } from "antd";

type Props = {
  store_name?: string;
  store_email?: string;
  store_phone?: string;
  store_address?: string;
  store_logo?: string;
};

export default function StoreInfoCard(props: Props) {
  const hasLogo =
    typeof props.store_logo === "string" &&
    props.store_logo.trim().length > 0 &&
    !props.store_logo.includes("`");
  return (
    <Card title={"Store Info"} className="h-100">
      {hasLogo && (
        <div className="mb-3">
          <Image
            src={props.store_logo}
            alt="Store Logo"
            preview={false}
            width={96}
            height={96}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        </div>
      )}
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Name">
          {props.store_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {props.store_phone || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {props.store_email || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {props.store_address || "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
