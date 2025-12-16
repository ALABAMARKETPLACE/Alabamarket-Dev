"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  InputNumber,
  DatePicker,
  Form,
  notification,
} from "antd";
import { Col, Row, Container } from "react-bootstrap";
import dayjs from "dayjs";
import moment from "moment";
import "../../styles.scss";
import API from "@/config/API";
import { GET, PUT } from "@/util/apicall";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import AdminLoading from "@/app/(dashboard)/_components/AdminLoading/page";
import NoData from "@/components/noData";
import { useParams, useRouter } from "next/navigation";

interface Product {
  key: string;
  product: string;
  title: string;
  quantity: number | null;
  unitPrice: number | null;
  netAmount: number | null;
  discount: number | null;
  delivery_charge: number | null;
  tax: number | null;
  total: number | null;
}

const EditInvoice: React.FC = () => {
  // const param = useParams();
  const router = useRouter();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(true);
  // const [invoice, setInvoice] = useState<any>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [totals, setTotals] = useState<any>({});
  const [vatPercentage, setVatPercentage] = useState<number | null>(null);

  useEffect(() => {
    getInvoicesDetails();
  }, []);
  const getInvoicesDetails = async () => {
    setLoading(true);

    const url = `${API.INVOICE_GET}${id}`;
    try {
      const response: any = await GET(url);
      if (response?.status) {
        // setInvoice(response?.data);
        setFormData({
          id: response?.data?.id,
          invoice_id: response?.data?.invoice_id,
          invoiceAddress: response?.data?.invoice_address,
          deliveryAddress: response?.data?.delivery_address,
          customerName: response?.data?.to_name,
          dueDate: moment(response?.data?.due_date).format("YYYY-MM-DD"),
          to_mail: response?.data?.to_mail,
        });
        handleVatPercentageChange(response?.data?.invoiceItemDetails[0]?.tax);
        setProducts(
          response?.data.invoiceItemDetails.map((item: any) => ({
            key: item.id,
            id: item.id,
            invoiceId: item.invoiceId,
            product: item.product,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            netAmount: item.netPrice,
            discount: item.discount,
            delivery_charge: item.delivery_charge,
            vat: item.tax,
            total: item.total,
          }))
        );
        setTotals({
          subTotal: response?.data?.sub_total,
          totalVAT: response?.data?.total_vat,
          overallDiscount: response?.data?.overall_discount,
          totalAmount: response?.data?.total_amount,
        });
      }
    } catch (err: any) {
      Notifications["error"]({
        message: "Something went wrong",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createInputNumberColumn = (
    dataIndex: keyof Product,
    label: string,
    allowZero: boolean = true
  ) => ({
    title: label,
    dataIndex: dataIndex as string,
    render: (_: any, record: Product) => (
      <Form.Item
        initialValue={record[dataIndex]}
        name={`${dataIndex}_${record.key}`}
        rules={[
          {
            required: dataIndex === "quantity" || dataIndex === "unitPrice",
            message: `${label} is required`,
          },
          {
            validator: (_, value) => {
              if (!allowZero && (value === null || value === 0)) {
                return Promise.reject(`${label} cannot be zero`);
              }
              return Promise.resolve();
            },
          },
        ]}
        className=""
        style={{ width: "110px", marginBottom: "0px" }}
      >
        <InputNumber
          value={record[dataIndex]}
          onChange={(value: number | string | null) =>
            handleInputChange(record.key, value || 0, dataIndex)
          }
          placeholder={`Enter ${label}`}
        />
      </Form.Item>
    ),
  });

  const vatColumn = {
    title: `VAT${vatPercentage ? ` (${vatPercentage}%)` : ""}`,
    dataIndex: "tax",
    render: (_: any, record: Product) => {
      const netAmount = (record.quantity ?? 0) * (record.unitPrice ?? 0);
      const calculatedVAT = (netAmount * (vatPercentage ?? 0)) / 100;
      return <span>{calculatedVAT}</span>;
    },
  };

  {
    /*------Invoice Column--------*/
  }

  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (_: any, record: Product) => (
        <Form.Item
          initialValue={record.product}
          name={`product_${record.key}`}
          rules={[{ required: true, message: "Product is required" }]}
          className=""
          style={{ width: "110px", marginBottom: "0px" }}
        >
          <Input
            value={record.product}
            onChange={(e: { target: { value: string | number } }) =>
              handleInputChange(record.key, e.target.value, "product")
            }
          />
        </Form.Item>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "product",
      render: (_: any, record: Product) => (
        <Form.Item
          initialValue={record.title}
          name={`title_${record.key}`}
          rules={[{ required: true, message: "Title is required" }]}
          className=""
          style={{ width: "110px", marginBottom: "0px" }}
        >
          <Input
            value={record.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(record.key, e.target.value, "title")
            }
          />
        </Form.Item>
      ),
    },
    {
      ...createInputNumberColumn("quantity", "Quantity", false),
    },
    {
      ...createInputNumberColumn("unitPrice", "Unit Price", false),
    },
    {
      title: "Net Amount",
      dataIndex: "netAmount",
      render: (_: any, record: Product) => {
        const netAmount = (record.quantity ?? 0) * (record.unitPrice ?? 0);
        return <span>{netAmount}</span>;
      },
    },
    {
      ...createInputNumberColumn("discount", "Discount/ Coupon", true),
    },
    {
      ...createInputNumberColumn("delivery_charge", "Delivery Charge", true),
    },
    vatColumn,
    {
      title: "Total",
      dataIndex: "total",
      render: (_: any, record: Product) => {
        const netAmount = (record.quantity ?? 0) * (record.unitPrice ?? 0);
        const calculatedVAT = (netAmount * (vatPercentage ?? 0)) / 100;
        const total =
          netAmount +
          (record.delivery_charge ?? 0) +
          calculatedVAT -
          (record.discount ?? 0);
        const roundedTotal = total.toFixed(2);
        return <span>{roundedTotal}</span>;
      },
    },

    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: Product) => (
        <Button onClick={() => deleteProduct(record.key)}>Delete</Button>
      ),
    },
  ];

  {
    /*------Calculatons--------*/
  }

  const calculateTotals = () => {
    const subTotal = products.reduce(
      (acc, curr) => acc + Number((curr.quantity ?? 0) * (curr.unitPrice ?? 0)),
      0
    );
    const totalVAT = products.reduce((acc, curr) => {
      const netAmount = (curr.quantity ?? 0) * (curr.unitPrice ?? 0);
      const calculatedVAT = (netAmount * (vatPercentage ?? 0)) / 100;
      return acc + calculatedVAT;
    }, 0);

    const overallDiscount = products.reduce(
      (acc, curr) => acc + Number((curr.discount ?? 0) * (curr.quantity ?? 0)),
      0
    );
    const totalAmount = products.reduce((acc, curr) => {
      const netAmount = Number(curr.quantity) * Number(curr.unitPrice);
      const calculatedVAT = (netAmount * (vatPercentage ?? 0)) / 100;
      const total =
        netAmount +
        // Number(curr.delivery_charge) +
        calculatedVAT -
        Number(overallDiscount);

      return acc + parseFloat(total.toFixed(2));
    }, 0);

    return {
      subTotal,
      totalVAT,
      overallDiscount,
      totalAmount,
    };
  };

  useEffect(() => {
    const calculatedTotals = calculateTotals();
    setTotals(calculatedTotals);
  }, [products, vatPercentage]);

  {
    /*------Handlers--------*/
  }

  const handleInputChange = (
    key: string,
    value: string | number | null,
    field: keyof Product
  ) => {
    const updatedProducts = products.map((product) => {
      if (product.key === key) {
        const parsedValue = value ?? 0;
        return { ...product, [field]: parsedValue };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const handleVatPercentageChange = (value: number | null) => {
    if (value === null || isNaN(value)) {
      setVatPercentage(null);
    } else {
      const parsedValue = parseFloat(value.toString());
      if (!isNaN(parsedValue)) {
        setVatPercentage(parsedValue);
      }
    }
  };

  const addProduct = () => {
    const newProductKey = products.length.toString();
    const newProduct: Product = {
      key: newProductKey,
      product: "",
      title: "",
      quantity: 0,
      unitPrice: 0,
      netAmount: 0,
      discount: 0,
      delivery_charge: 0,
      tax: 0,
      total: 0,
    };
    setProducts([...products, newProduct]);
  };

  const deleteProduct = (key: string) => {
    const updatedProducts = products.filter((product) => product.key !== key);
    setProducts(updatedProducts);
  };

  const handleChange = (fieldName: any, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleDueDateChange = (date: any, dateString: any) => {
    setFormData({
      ...formData,
      dueDate: dateString,
    });
  };

  const processedProducts = products.map((product) => {
    const netAmount = (product.quantity ?? 0) * (product.unitPrice ?? 0);
    const calculatedVAT = (netAmount * (vatPercentage ?? 0)) / 100;
    const total =
      netAmount +
      (product.delivery_charge ?? 0) +
      calculatedVAT -
      (product.discount ?? 0);

    return {
      ...product,
      netAmount,
      tax: vatPercentage,
      total,
    };
  });

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];

  {
    /*------API Integration & Submission--------*/
  }

  const handleSubmit = async () => {
    const obj = {
      id: formData.id,
      from_name: API.NAME,
      issue_date: formattedDate,
      from_mail: API.CONTACT_MAIL,
      to_mail: formData.to_mail,
      to_name: formData.customerName,
      due_date: formData.dueDate,
      invoice_address: formData.invoiceAddress,
      delivery_address: formData.deliveryAddress,
      invoice_item: processedProducts,
      invoice_id: formData.invoice_id,
    };
    const url = `${API.INVOICE_UPDATE}${formData.id}`;
    try {
      setLoading(true);
      const response: any = await PUT(url, obj);
      if (response.status) {
        Notifications.success({
          message: "Invoice updated successfully.",
          description:
            "The updated invoice has been successfully saved and emailed to the customer.",
        });
        setLoading(false);
        // router.push("/invoices");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };
  

  {
    /*------Total Column--------*/
  }

  const dataSource = [
    {
      key: "1",
      item: "Sub Total",
      value: Number(totals?.subTotal?.toFixed(2)),
    },
    {
      key: "2",
      item: "Total VAT",
      value: Number(totals?.totalVAT?.toFixed(2)),
    },
    {
      key: "3",
      item: "Overall Discount",
      value: Number(totals?.overallDiscount?.toFixed(2)),
    },
    {
      key: "4",
      item: "Total Amount",
      value: Number(totals?.totalAmount?.toFixed(2)),
    },
  ];

  const columns2 = [
    {
      // title: "Item",
      dataIndex: "item",
      key: "item",
    },
    {
      // title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <>
      {contextHolder}
      <PageHeader title="Edit Invoice"></PageHeader>
      {loading ? (
        <AdminLoading />
      ) : formData?.id ? (
        <>
          <Form onFinish={handleSubmit} form={form}>
            <Container>
              <div className="mt-4"></div>
              <Row>
                <Col md={4} className="invoice-item-before-table">
                  <h5 className="ps-2">Customer Name</h5>
                  <Input
                    placeholder="Enter Customer Name"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleChange("customerName", e.target.value)
                    }
                    required
                  />
                </Col>
                <Col md={4} className="invoice-item-before-table">
                  <h5 className="ps-2">Customer Email</h5>
                  <Input
                    placeholder="Enter Customer Email"
                    value={formData.to_mail}
                    onChange={(e) => handleChange("to_mail", e.target.value)}
                    required
                  />
                </Col>
                <Col md={4} className="invoice-item-before-table">
                  <h5 className="ps-2">Due Date</h5>
                  <Form.Item
                    className="invoiceform-date-input"
                    name="dueDate"
                    initialValue={dayjs(formData?.dueDate)}
                    rules={[
                      {
                        required: true,
                        message: "Please select the due date!",
                      },
                    ]}
                  >
                    <DatePicker
                      placeholder="Select Due Date"
                      value={formData.dueDate ? dayjs(formData.dueDate) : null}
                      onChange={handleDueDateChange}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Item
                    className="invoiceform-vat"
                    label="VAT (%)"
                    name="vatPercentage"
                    initialValue={
                      vatPercentage != null ? vatPercentage : undefined
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter VAT (%)",
                      },
                      {
                        type: "number",
                        min: 0,
                        max: 100,
                        message: "VAT (%) must be a number between 0 and 100",
                      },
                    ]}
                  >
                    <InputNumber
                      value={vatPercentage != null ? vatPercentage : undefined}
                      onChange={(value) => handleVatPercentageChange(value)}
                      placeholder="Enter VAT (%)"
                      style={{ width: "150px" }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        const charCode = e.which || e.keyCode;
                        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div className="d-flex justify-content-between mt-1">
                <h5 className="my-3">Invoice Table </h5>
                <Button className="m-2" type="dashed" onClick={addProduct}>
                  + Add Product
                </Button>
              </div>
              <div
                className="table-responsive"
                // style={{
                //   maxWidth: "600px",
                //   overflowX: "scroll",
                //   whiteSpace: "nowrap", 
                // }}
              >
                <Table
                  dataSource={products}
                  columns={columns}
                  pagination={false}
                />
              </div>
              <Row>
                <Col sm={6} className="mt-3">
                  <h5 className="ps-2">Invoice Address</h5>
                  <Input.TextArea
                    className="m-2"
                    placeholder="Enter Invoice Address"
                    value={formData.invoiceAddress}
                    rows={5}
                    onChange={(e) =>
                      handleChange("invoiceAddress", e.target.value)
                    }
                    required
                  />
                </Col>
                <Col sm={6} className="mt-3">
                  <h5 className="ps-2">Delivery Address</h5>
                  <Input.TextArea
                    className="m-2"
                    placeholder="Enter Delivery Address"
                    value={formData.deliveryAddress}
                    rows={5}
                    onChange={(e) =>
                      handleChange("deliveryAddress", e.target.value)
                    }
                    required
                  />
                </Col>
              </Row>
              <Row className="m-2 d-flex justify-content-end">
                <Col md={6} className="">
                  <Table
                    bordered
                    dataSource={dataSource}
                    columns={columns2}
                    pagination={false}
                    showHeader={false}
                  />
                </Col>
              </Row>
              <div className="edit-invoice-submit">
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update
                </Button>
              </div>
            </Container>
          </Form>
        </>
      ) : (
        <NoData />
      )}
    </>
  );
};

export default EditInvoice;
