// "use client";
// import React, { useState } from "react";
// import PageHeader from "@/app/(dashboard)/_components/pageHeader";
// import Loading from "@/app/(dashboard)/_components/loading";
// import { Button, Input } from "antd";
// import { IoSearchOutline } from "react-icons/io5";
// import DataTable from "./_components/dataTable";
// import useDebounceQuery from "@/shared/hook/useDebounceQuery";
// import { useQuery } from "@tanstack/react-query";
// import { GET } from "@/util/apicall";
// import API from "@/config/API_ADMIN";
// import Error from "@/app/(dashboard)/_components/error";

// function Page() {
//   const [page, setPage] = useState(1);
//   const [take, setTake] = useState(10);
//   const [debounce, invoiceId, handleChange] = useDebounceQuery("", 300);

//   const {
//     data: enquiry,
//     isLoading,
//     refetch,
//     isFetching,
//     isError,
//     error,
//   } = useQuery({
//     queryFn: async () =>
//       await GET(API.INVOICE_GET_ALL, {
//         order: "DESC",
//         page,
//         take,
//         invoiceId,
//       }),
//     queryKey: ["admin_invoices", page, take, debounce],
//   });
//   return (
//     <>
//       <PageHeader title={"Invoices"} bredcume={"Dashboard / Invoices"}>
//         <Input
//           suffix={<IoSearchOutline />}
//           placeholder="Search id/name"
//           type="text"
//           onChange={(e) => {
//             handleChange(e?.target?.value);
//             setPage(1);
//           }}
//         />
//         <Button
//           type="primary"
//           ghost
//           onClick={() => refetch()}
//           loading={isFetching}
//         >
//           Refresh
//         </Button>
//       </PageHeader>
//       {isLoading ? (
//         <Loading />
//       ) : isError ? (
//         <Error description={error?.message} />
//       ) : (
//         <DataTable
//           data={Array.isArray(enquiry?.data) ? enquiry?.data : []}
//           count={enquiry?.meta?.itemCount}
//           setPage={setPage}
//           setTake={setTake}
//           pageSize={take}
//           page={page}
//         />
//       )}
//     </>
//   );
// }

// export default Page;
"use client";
import React, { useEffect, useState } from "react";
import { Button, notification } from "antd";
import InvoiceTable from "./invoiceTable";
import Search from "antd/es/input/Search";
import { GrPowerReset } from "react-icons/gr";
import { InvoiceType } from "@/types/types";
import API from "@/config/API";
import { GET } from "@/util/apicall";
import PageHeader from "@/components/pageHeader/pageHeader";
import AdminLoading from "../../_components/AdminLoading/page";
import NoData from "@/components/noData";
import { useRouter } from "next/navigation";
function Invoices() {
  const [invoiceList, setInvoiceList] = useState<InvoiceType[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const [meta, setMeta] = useState<any>();
  const pageSize = 12;
  const [reset, setReset] = useState(false);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const getInvoiceList = async (
    currentPage: number = 1,
    invoiceId: string = ""
  ) => {
    setLoading(true);
    try {
      const url =
        API.INVOICE_GET_ALL +
        `?order=DESC&page=${currentPage}&take=${pageSize}&invoiceId=${invoiceId}`;
      const data: any = await GET(url);
      console.log("dataata", data);

      if (data?.status) {
        setInvoiceList(data?.data);
        setMeta(data?.meta);
      } else {
        Notifications["error"]({
          message: data?.message ?? "",
        });
      }
      
    } catch (err: any) {
      Notifications["error"]({
        message: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = () => {
    router.push(`/auth/invoices/createInvoice/`);
  };

  const changePage = async (page: number) => {
    await getInvoiceList(page, search);
    setPage(page);
    window.scrollTo(0, 0);
  };
  const onSearch = async (value: string) => {
    if (value) {
      setSearch(value);
      setReset(true);
      setSearching(true);
      await getInvoiceList(1, value);
      setPage(1);
      setSearching(false);
    }
  };
  useEffect(() => {
    getInvoiceList();
  }, []);

  return (
    <>
      {contextHolder}
      <PageHeader
        title={`Invoice ${!isLoading ? `(${meta?.itemCount ?? "0"})` : ""}`}
      >
        <Button
          onClick={() => {
            addInvoice();
          }}
          type="primary"
        >
          Create Invoice
        </Button>
        <Search
          placeholder="Search InvoiceID/Name"
          allowClear
          enterButton="Search"
          size="middle"
          onSearch={onSearch}
          loading={searching}
        />
        {reset ? (
          <Button
            type="primary"
            icon={<GrPowerReset />}
            size={"middle"}
            onClick={() => {
              getInvoiceList();
              setReset(false);
              setSearch("");
            }}
          />
        ) : null}
      </PageHeader>
      {isLoading ? (
        <AdminLoading />
      ) : invoiceList.length ? (
        <InvoiceTable
          data={invoiceList}
          changePage={changePage}
          meta={meta}
          pageSize={pageSize}
          addInvoice={addInvoice}
          page={page}
        />
      ) : (
        <NoData header={"No Invoice Found"} />
      )}
    </>
  );
}

export default Invoices;
