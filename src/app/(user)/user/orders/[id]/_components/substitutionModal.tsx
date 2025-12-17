import { Button, Card, Modal, Popconfirm, notification } from "antd";
import React, { useEffect, useState } from "react";
import { GET, PUT } from "../../../../../../util/apicall";
import API from "../../../../../../config/API";
import { useSelector } from "react-redux";
import Loading from "../../../../../../components/loading";
import { reduxSettings } from "../../../../../../redux/slice/settingsSlice";

function SubstitutionModal({
  open,
  close,
  data,
  getOrderDetails: refreshOrderDetails,
}: any) {
  const [products, setProducts] = useState<any>(null);
  const Settings = useSelector(reduxSettings);
  const [selected, setSelected] = useState<any>(null);
  const [Notifications, contextHolder] = notification.useNotification();
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const getOrderDetails = async () => {
    try {
      const response: any = await GET(
        API.ORDER_SUBSTITUTION_GETALL + data?.order_id
      );
      if (response?.status) {
        setProducts(response?.data);
      }
    } catch (err) {
      Notifications["error"]({
        message: `Something went wrong.. please try again.`,
        description: "",
      });
    } finally {
      setLoading1(false);
    }
  };

  const acceptSubstitution = async () => {
    if (!selected) {
      Notifications["error"]({
        message: `Please Select One product for substitution.`,
        description: "",
      });
      return;
    }
    try {
      setLoading2(true);
      const response: any = await PUT(
        API.ORDER_SUBSTITUTION_SUBSTITUTE + products?.id,
        { productId: selected?.pid }
      );
      if (response?.status) {
        Notifications["success"]({
          message: `Your Order Substitution is Successfull.`,
          description: "",
        });
        close();
        refreshOrderDetails();
      } else {
        Notifications["error"]({
          message: response?.message,
          description: "",
        });
      }
    } catch (err) {
      Notifications["error"]({
        message: `Something went wrong..`,
        description: "",
      });
    } finally {
      setLoading2(false);
    }
  };

  const updateOrder = async () => {
    try {
      const response: any = await PUT(
        API.ORDER_SUBSTITUTION_UPDATEORDER + products?.id,
        {}
      );
      if (response?.status) {
        Notifications["success"]({
          message: `Your Order has been Updated.`,
          description: "",
        });
        close();
        refreshOrderDetails();
      } else {
        Notifications["error"]({
          message: response?.message,
          description: "",
        });
      }
    } catch (err) {
      console.log(err);
      Notifications["error"]({
        message: `Something went wrong..`,
        description: "",
      });
    }
  };

  const cancelOrder = async () => {
    const url = API.ORDER_CANCEL + data?.id;
    try {
      const response: any = await PUT(url, {
        remark: "Substituion not acceptable.",
      });
      if (response.status) {
        Notifications["success"]({
          message: "Order has been Cancelled.",
        });
        close();
        refreshOrderDetails();
      } else {
        Notifications["error"]({
          message: response?.message ?? "",
        });
      }
    } catch (err) {
      Notifications["error"]({
        message: "Something went wrong.",
      });
    } finally {
    }
  };
  useEffect(() => {
    getOrderDetails();
  }, [open]);
  return (
    <Modal
      title={`Substitute Order #${data?.order_id}`}
      open={open}
      //   onOk={handleOk}
      footer={false}
      onCancel={close}
      centered
    >
      {contextHolder}
      {loading1 ? (
        <Loading />
      ) : products ? (
        <div className="row gy-2">
          <div className="col-md-8">
            <h6>
              ProductName:{" "}
              <span className="text-danger">
                {products?.orderItemDetails?.name}
              </span>{" "}
            </h6>
            <span className="fw-bold">Available Quantity</span>:
            {products?.availableQuantity} <br />
            <span className="fw-bold">Substitute Quantity</span>:
            {products?.substitueQuantity} <br />
            <span className="fw-bold">remark</span>:{products?.remark}
            <br />
            <h6>
              Selected Product for Substitution:{" "}
              <span className="text-success">{selected?.name}</span>
            </h6>
          </div>
          <div className="col-md-4">
            <div>
              <img
                src={products?.orderItemDetails?.image}
                alt=""
                className="img-fluid"
              />
            </div>
          </div>
          <hr />
          <h6 className="fw-bold">Select an item from below products</h6>
          {products?.substituteProducts?.map((it: any) => (
            <div className="col-md-4">
              <div
                className={`product-card-pos pb-2 h-100 border ${
                  it?.pid == selected?.pid ? "border-success" : ""
                }`}
              >
                <div className="img-container">
                  <img src={it?.image} alt={it?.name} className="img-fluid" />
                </div>
                <div className="px-2 product-card-pos-title-card">
                  <p className="product-card-pos-title">{it?.name ?? ""}</p>{" "}
                  <div className="d-flex justify-content-between">
                    {" "}
                    <p className="price fw-bold">
                      ₦
                      {it?.retail_rate ?? 0}
                    </p>
                    <Button
                      type="primary"
                      size="small"
                      style={{ fontSize: "12px" }}
                      onClick={() => setSelected(it)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="d-flex gap-2 justify-content-end mt-2">
        <Button
          danger
          onClick={() => {
            cancelOrder();
          }}
        >
          Cancel Order
        </Button>
        <Popconfirm
          placement="bottomRight"
          title={
            "This item quantity will be updated to available quantity. Are you sure?"
          }
          okText="Yes"
          cancelText="No"
          onConfirm={updateOrder}
        >
          <Button type="primary">Update Order</Button>
        </Popconfirm>

        <Button type="primary" onClick={acceptSubstitution} loading={loading2}>
          Accept
        </Button>
      </div>
    </Modal>
  );
}

export default SubstitutionModal;
