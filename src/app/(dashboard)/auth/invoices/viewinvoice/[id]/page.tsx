// 'use client'
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// // import AdminLoading from "../../components/AdminLoading";
// // import PageHeader from "../../components/PageHeader";
// // import NoData from "../../../components/noData";
// import { Table, notification } from "antd";
// import { Col, Row } from "react-bootstrap";
// import moment from "moment";
// import "./styles.scss";
// import AdminLoading from "@/app/(dashboard)/_components/AdminLoading/page";
// import PageHeader from "@/app/(dashboard)/_components/pageHeader";
// import NoData from "@/components/noData";
// import API from "@/config/API";
// import { GET } from "@/util/apicall";

// export default function ViewInvoice({ params }: { params: { id: string } }) {
//   const { id } = params;
//     const router = useRouter();
//     // const { id } = router.query;
// //   const params = useParams();
//   const [Notifications, contextHolder] = notification.useNotification();
//   const [loading, setLoading] = useState(true);
//   const [invoice, setInvoice] = useState<any>({});

//   const columns = [
//     {
//       title: "Product",
//       dataIndex: "product",
//       key: "product",
//     },
//     {
//       title: "Title",
//       dataIndex: "title",
//       key: "title",
//     },
//     {
//       title: "Qty",
//       dataIndex: "quantity",
//       key: "quantity",
//     },
//     {
//       title: "Unit Price",
//       dataIndex: "unitPrice",
//       key: "unitPrice",
//     },
//     {
//       title: "Delivery Charge",
//       dataIndex: "delivery_charge",
//       key: "delivery_charge",
//     },
//     {
//       title: "Discount",
//       dataIndex: "discount",
//       key: "discount",
//     },
//     {
//       title: "Tax",
//       dataIndex: "tax",
//       key: "tax",
//     },
//     {
//       title: "total",
//       dataIndex: "total",
//       key: "total",
//     },
//   ];
//   useEffect(() => {
//     getInvoicesDetails();
//   }, []);
//   const getInvoicesDetails = async () => {
//     setLoading(true);
//     const url = `${API.INVOICE_GET}${id}`;
//     try {
//       const response: any = await GET(url);
//       if (response?.status) {
//         setInvoice(response?.data);
//       }
//     } catch (err: any) {
//       Notifications["error"]({
//         message: "Something went wrong",
//         description: err.message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <>
//       {contextHolder}
//       <PageHeader title="Seller Info"></PageHeader>
//       {loading ? (
//         <AdminLoading />
//       ) : invoice?.id ? (
//         <div className="detail-container">
//           <Row className="invoiceview-firstsection">
//             <Col md={4}>
//               <div>
//                 <span className="invoiceview-item-title">Invoice Id:</span>
//                 <span className="invoiceview-item">{invoice?.invoice_id}</span>
//               </div>
//             </Col>
//             <Col md={4}>
//               <div>
//                 <span className="invoiceview-item-title">Issue Date:</span>
//                 <span className="invoiceview-item">{moment(invoice?.issue_date).format("DD/MM/YYYY")}</span>
//               </div>
//             </Col>
//             <Col md={4}>
//               <div>
//                 <span className="invoiceview-item-title">Due Date:</span>
//                 <span className="invoiceview-item">{moment(invoice?.due_date).format("DD/MM/YYYY")}</span>
//               </div>
//             </Col>
//           </Row>
//           <Row>
//             <Col md={6} >
//               <div className="invoiceview-item-title">Customer Details</div>
//               <div  className="invoiceview-item">{invoice?.to_name}</div>
//               <div className="invoiceview-item">{invoice?.to_mail}</div>
//               <div className="invoiceview-address">{invoice?.delivery_address}</div>
//             </Col>
//             <Col md={6}>
//               <div className="invoiceview-item-title">Seller Details</div>
//               <div className="invoiceview-item">{invoice?.from_name}</div>
//               <div className="invoiceview-item">{invoice?.from_mail}</div>
//               <div className="invoiceview-address">{invoice?.invoice_address}</div>
//             </Col>
//           </Row>
//           <Table
//             className="invoiceview-itemTable"
//             bordered
//             size="small"
//             dataSource={invoice?.invoiceItemDetails}
//             columns={columns}
//             pagination={false}
//             scroll={{ x: true }}
//           />
//           <Row className="invoiceview-total-section">
//             <Col md={4} >
//               <div className="invoiceview-total-items">
//                 <span className="invoiceview-item-title">Sub Total:</span>
//                 <span className="invoiceview-item">{invoice?.sub_total}</span>
//               </div>
//               <div className="invoiceview-total-items">
//                 <span className="invoiceview-item-title">Total Vat:</span>
//                 <span className="invoiceview-item">{invoice?.total_vat}</span>
//               </div>
//               <div className="invoiceview-total-items">
//                 <span className="invoiceview-item-title">Total Discount:</span>
//                 <span className="invoiceview-item">{invoice?.overall_discount}</span>
//               </div>
//               <div className="invoiceview-total-items">
//                 <span className="invoiceview-item-title">Total Amount:</span>
//                 <span className="invoiceview-item">{invoice?.total_amount}</span>
//               </div>
//             </Col>
//             <div style={{width:"1rem"}}></div>
//           </Row>
//         </div>
//       ) : (
//         <NoData />
//       )}
//     </>
//   );
// }
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AdminLoading from "@/app/(dashboard)/_components/AdminLoading/page";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import NoData from "@/components/noData";
import { Table, notification } from "antd";
import { Col, Row } from "react-bootstrap";
import moment from "moment";
import "../styles.scss";
import API from "@/config/API";
import { GET } from "@/util/apicall";

export default function ViewInvoice() {
  // const { id } = useParams();
  const [Notifications, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>({});

  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
    },
    {
      title: "Delivery Charge",
      dataIndex: "delivery_charge",
      key: "delivery_charge",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Tax",
      dataIndex: "tax",
      key: "tax",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
  ];

  const { id } = useParams();
  console.log('gggggg',id)
  useEffect(() => {
    if (id) {
      getInvoicesDetails();
    }
  }, [id]);

  const getInvoicesDetails = async () => {
    setLoading(true);
    const url = `${API.INVOICE_GET}${id}`;
    try {
      const response: any = await GET(url);
      if (response?.status) {
        setInvoice(response?.data);
      }
    } catch (err: any) {
      Notifications["error"]({
        message: "Something went wrong",
        description: err?.message || "Failed to fetch invoice details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <PageHeader title="Seller Info"></PageHeader>
      {loading ? (
        <AdminLoading />
      ) : invoice?.id ? (
        <div className="detail-container">
          <Row className="invoiceview-firstsection">
            <Col md={4}>
              <div>
                <span className="invoiceview-item-title">Invoice Id:</span>
                <span className="invoiceview-item">{invoice?.invoice_id}</span>
              </div>
            </Col>
            <Col md={4}>
              <div>
                <span className="invoiceview-item-title">Issue Date:</span>
                <span className="invoiceview-item">
                  {moment(invoice?.issue_date).format("DD/MM/YYYY")}
                </span>
              </div>
            </Col>
            <Col md={4}>
              <div>
                <span className="invoiceview-item-title">Due Date:</span>
                <span className="invoiceview-item">
                  {moment(invoice?.due_date).format("DD/MM/YYYY")}
                </span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className="invoiceview-item-title">Customer Details</div>
              <div className="invoiceview-item">{invoice?.to_name}</div>
              <div className="invoiceview-item">{invoice?.to_mail}</div>
              <div className="invoiceview-address">
                {invoice?.delivery_address}
              </div>
            </Col>
            <Col md={6}>
              <div className="invoiceview-item-title">Seller Details</div>
              <div className="invoiceview-item">{invoice?.from_name}</div>
              <div className="invoiceview-item">{invoice?.from_mail}</div>
              <div className="invoiceview-address">
                {invoice?.invoice_address}
              </div>
            </Col>
          </Row>
          <Table
            className="invoiceview-itemTable"
            bordered
            size="small"
            dataSource={invoice?.invoiceItemDetails}
            columns={columns}
            pagination={false}
            scroll={{ x: true }}
          />
          <Row className="invoiceview-total-section">
            <Col md={4}>
              <div className="invoiceview-total-items">
                <span className="invoiceview-item-title">Sub Total:</span>
                <span className="invoiceview-item">{invoice?.sub_total}</span>
              </div>
              <div className="invoiceview-total-items">
                <span className="invoiceview-item-title">Total Vat:</span>
                <span className="invoiceview-item">{invoice?.total_vat}</span>
              </div>
              <div className="invoiceview-total-items">
                <span className="invoiceview-item-title">Total Discount:</span>
                <span className="invoiceview-item">
                  {invoice?.overall_discount}
                </span>
              </div>
              <div className="invoiceview-total-items">
                <span className="invoiceview-item-title">Total Amount:</span>
                <span className="invoiceview-item">
                  {invoice?.total_amount}
                </span>
              </div>
            </Col>
            <div style={{ width: "1rem" }}></div>
          </Row>
        </div>
      ) : (
        "no data"
        // <NoData />
      )}
    </>
  );
}
