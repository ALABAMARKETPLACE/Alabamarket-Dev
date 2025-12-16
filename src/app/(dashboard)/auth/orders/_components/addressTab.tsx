import { Card } from "antd";

type Props = {
  data: any;
};
export default function AddressTab(props: Props) {
  return (
    <Card title={"Delivery Address"}>
      <div>
        <div>type&nbsp;:&nbsp;{props?.data?.type}</div>
        <div>City&nbsp;:&nbsp;{props?.data?.city}</div>
        <div>PinCode&nbsp;:&nbsp;{props?.data?.pin_code}</div>
        <div>State&nbsp;:&nbsp;{props?.data?.state}</div>
        <div>Address&nbsp;:&nbsp;{props?.data?.fullAddress}</div>
        <div>
          Phone Number&nbsp;:&nbsp;{props?.data?.code ?? ""}&nbsp;
          {props?.data?.alt_phone}
        </div>
      </div>
    </Card>
  );
}
