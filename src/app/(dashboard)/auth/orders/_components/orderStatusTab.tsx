import { Button, Card, Steps } from "antd";
import { getOrderStatus } from "./getOrderStatus";
import moment from "moment";
import UpdateStatusFormModal from "./updateStatusFormModal";
import { useState } from "react";
type Props = {
  data: any;
};
export default function OrderStatusTab(props: Props) {
  const DATE_FORMAT = "DD/MM/YYYY";
  const [openModal, setOpenModal] = useState<boolean>(false);
  const getOrderSteps = () => {
    return props?.data?.orderStatus?.map(
      (statusUpdate: any, index: number) => ({
        key: index,
        title: getOrderStatus(statusUpdate?.status),
        description: (
          <>
            <div>{moment(statusUpdate?.createdAt).format("DD/MM/YYYY")}</div>
            <div>{statusUpdate?.remark}</div>
          </>
        ),
      })
    );
  };
  return (
    <Card
      title={"Order Status"}
      extra={<Button onClick={() => setOpenModal(true)}>Update Status</Button>}
    >
      <div>
        <div>Order Status : {getOrderStatus(props?.data?.status)}</div>
        <div>
          Order Date : {moment(props?.data?.createdAt).format(DATE_FORMAT)}
        </div>
        <hr />
        <div>Order Status History</div>
        {Array.isArray(props?.data?.orderStatus) && (
          <Steps
            direction="vertical"
            current={props?.data?.orderStatus?.length}
            items={getOrderSteps()}
          />
        )}
      </div>
      <UpdateStatusFormModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        status={props?.data?.orderStatus[0]?.status}
        id={props?.data?.id}
      />
    </Card>
  );
}
