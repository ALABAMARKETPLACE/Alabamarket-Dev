'use client'
import React, { useEffect, useState } from "react";
 import { Table, Input, Button, InputNumber, DatePicker, Form, notification } from "antd";
import { Col, Row, Card, Container } from "react-bootstrap";
import dayjs from "dayjs";
// import API from "../../../config/API";
// import { InvoiceDataType } from "../../../../../types/types/InvoiceDataType";
import API from "@/config/API";
import { POST } from "@/util/apicall";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { InvoiceDataType } from "@/types/types";
// import { POST } from "../../../utils/apiCalls";
// import PageHeader from "../../components/PageHeader";

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

const CreateInvoice: React.FC = () => {
  const [Notifications, contextHolder] = notification.useNotification();

  const [products, setProducts] = useState<Product[]>([
    {
      key: "0",
      product: "",
      title: "",
      quantity: null,
      unitPrice: null,
      netAmount: null,
      discount: null,
      delivery_charge: null,
      tax: null,
      total: null,
    },
  ]);

  const [formData, setFormData] = useState({
    invoiceAddress: "",
    deliveryAddress: "",
    customerName: "",
    dueDate: "",
    to_mail: "",
  });
  const [vatPercentage, setVatPercentage] = useState<number | null>(null);

  const createInputNumberColumn = (
    dataIndex: keyof Product,
    label: string,
    allowZero: boolean = true
  ) => ({
    title: label,
    dataIndex: dataIndex as string,
    render: (_: any, record: Product) => (
      <Form.Item
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
        className="pt-4"
        style={{ width: "110px" }}
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
      render: (_: any, record: Product) => (
        <Form.Item
          name={`product_${record.key}`}
          rules={[{ required: true, message: "Product is required" }]}
          className="pt-4"
          style={{ width: "110px" }}
        >
          <Input
            value={record.product}
            onChange={(e: { target: { value: string | number } }) =>
              handleInputChange(record.key, e.target.value, "product")
            }
            placeholder="Enter Product"
          />
        </Form.Item>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (_: any, record: Product) => (
        <Form.Item
          name={`title_${record.key}`}
          rules={[{ required: true, message: "Title is required" }]}
          className="pt-4"
          style={{ width: "110px" }}
        >
          <Input
            value={record.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(record.key, e.target.value, "title")
            }
            placeholder="Enter Title"
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
    const totalVAT = products.reduce(
      (acc, curr) =>
        acc +
        ((curr.quantity ?? 0) * (curr.unitPrice ?? 0) * (vatPercentage ?? 0)) /
          100,
      0
    );
    const overallDiscount = products.reduce(
      (acc, curr) => acc + (curr.discount ?? 0),
      0
    );
    const totalAmount = products.reduce((acc, curr) => {
      const netAmount = Number(curr.quantity) * Number(curr.unitPrice);
      const calculatedVAT = (netAmount * (vatPercentage ?? 0)) / 100;
      const total =
        netAmount +
        Number(curr.delivery_charge) +
        calculatedVAT -
        Number(curr.discount);

      return acc + parseFloat(total.toFixed(2));
    }, 0);

    return {
      subTotal,
      totalVAT,
      overallDiscount,
      totalAmount,
    };
  };

  const [totals, setTotals] = useState({
    subTotal: 0,
    totalVAT: 0,
    overallDiscount: 0,
    totalAmount: 0,
  });

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
        const updatedTotals = calculateTotals();
        setTotals(updatedTotals);
      }
    }
  };

  useEffect(() => {
    const calculatedTotals = calculateTotals();
    setTotals(calculatedTotals);
    // setVatPercentage(parsedValue);
  }, [products]);

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
    const obj: InvoiceDataType = {
      from_name: API.NAME,
      issue_date: formattedDate,
      from_mail: API.CONTACT_MAIL,
      to_mail: formData.to_mail,
      to_name: formData.customerName,
      due_date: formData.dueDate,
      invoice_address: formData.invoiceAddress,
      delivery_address: formData.deliveryAddress,
      invoice_item: processedProducts,
    };

    console.log(obj, " OBject");

    const url = API.INVOICE;
    try {
      const response = await POST(url, obj);
      if (response?.status) {
        Notifications.success({
            message: "Invoice successfully created",
            // description:
            //   "The updated invoice has been successfully saved and emailed to the customer.",
          });
      } else {
        alert("Failed to send invoice. Please try again later.");
      }
      console.log("Response from API:", response);
    } catch (error) {
        Notifications["error"]({
            message: "Something went wrong",
          });
      console.error("Error:", error);
    }
  };

  {
    /*------Total Column--------*/
  }

  const dataSource = [
    {
      key: "1",
      item: "Sub Total",
      value: totals.subTotal,
    },
    {
      key: "2",
      item: "Total VAT",
      value: totals.totalVAT,
    },
    {
      key: "3",
      item: "Overall Discount",
      value: totals.overallDiscount,
    },
    {
      key: "4",
      item: "Total Amount",
      value: totals.totalAmount,
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

      <PageHeader title="Create Invoice"></PageHeader>
      <Form onFinish={handleSubmit}>
        <Container>
          <div className="mt-4"></div>
          <Row gutter={24}>
            <Col span={8}>
              <h5 className="ps-2">Customer Name</h5>
              <Input
                className="m-2"
                placeholder="Enter Customer Name"
                value={formData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                required
              />

              <h5 className="ps-2">Customer Email</h5>
              <Input
                className="m-2"
                placeholder="Enter Customer Email"
                value={formData.to_mail}
                onChange={(e) => handleChange("to_mail", e.target.value)}
                required
              />

              <h5 className="ps-2">Due Date</h5>
              <Form.Item
                name="dueDate"
                rules={[
                  { required: true, message: "Please select the due date!" },
                ]}
              >
                <DatePicker
                  className="m-2"
                  placeholder="Select Due Date"
                  value={formData.dueDate ? dayjs(formData.dueDate) : null}
                  onChange={handleDueDateChange}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <h5 className="ps-2">Invoice Address</h5>
              <Input.TextArea
                className="m-2"
                placeholder="Enter Invoice Address"
                value={formData.invoiceAddress}
                rows={5}
                onChange={(e) => handleChange("invoiceAddress", e.target.value)}
                required
              />
            </Col>

            <Col span={8} className="me-3">
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

          <div className="d-flex justify-content-between mt-3">
            <h5 className="my-3">Invoice Table </h5>
            <Button className="m-2" type="dashed" onClick={addProduct}>
              + Add Product
            </Button>
          </div>
          <div className="table-responsive">
            <Table dataSource={products} columns={columns} pagination={false} />
          </div>
          <Row className="m-2">
            <Col md={4} className=" justify-content-end">
              <Row justify="center">
                <Col span={12}>
                  <Card>
                    <h4 className="my-2 d-flex justify-content-center">
                      Total
                    </h4>
                    <Table
                      dataSource={dataSource}
                      columns={columns2}
                      pagination={false}
                      showHeader={false}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col className="d-flex justify-content-between">
              <Form.Item
                label="VAT (%)"
                name="vatPercentage"
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
                  value={vatPercentage !== null ? vatPercentage : undefined}
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
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Col>
          </Row>
        </Container>
      </Form>
    </>
  );
};

export default CreateInvoice;
