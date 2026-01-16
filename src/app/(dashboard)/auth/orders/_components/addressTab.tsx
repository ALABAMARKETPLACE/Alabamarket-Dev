import { Card } from "antd";
import { Descriptions } from "antd";

type Props = {
  data: any;
};

export default function AddressTab(props: Props) {
  return (
    <Card title={"Delivery Address"} className="h-100">
      <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Contact Name:</span>
            <span className="fw-medium">{props?.data?.name}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Phone Number:</span>
            <span className="fw-medium">{props?.data?.phone}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Address Type:</span>
            <span className="text-capitalize">{props?.data?.addressType}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Country:</span>
            <span>{props?.data?.country}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">State:</span>
            <span>{props?.data?.state}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">City:</span>
            <span>{props?.data?.city}</span>
        </div>
        <div className="d-flex flex-column pt-2">
            <span className="text-muted mb-1">Full Address:</span>
            <span className="bg-light p-2 rounded small">{props?.data?.address}</span>
        </div>
      </div>
    </Card>
  );
}
