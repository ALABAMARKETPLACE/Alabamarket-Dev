import React, {
  forwardRef,
  Ref,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import DataTable from "../tables/dataTable.order";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import orderTypes from "../types/order_inputType";
import useDebounceQuery from "@/shared/hook/useDebounceQuery";

function OrderHistory({ id }: { id: string }, ref: Ref<orderTypes>) {
  const [take, setTake] = useState(10);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = Number(searchParams.get("page")) || 1;
  const router = useRouter();
  const [orderId, , handleChange] = useDebounceQuery("", 300);
  const [date, setDate] = useState({ from: "", to: "" });
  const [status, setStatus] = useState("");

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ queryKey }) =>
      GET(API.ORDER_GET_BYSTORE + id, queryKey[1] as object),
    queryKey: [
      "admin_orders_sellers",
      {
        order: "DESC",
        page,
        take,
        orderId,
        from: date.from,
        to: date.to,
        status,
      },
      id,
    ],
  });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useImperativeHandle(ref, () => ({
    query: function (query: string) {
      handleChange(query);
      router.replace(pathname + "?" + createQueryString("page", "1"));
    },
    status: function (status) {
      router.replace(pathname + "?" + createQueryString("page", "1"));
      setStatus(status);
    },
    date: function (from, to) {
      router.replace(pathname + "?" + createQueryString("page", "1"));
      setDate({ from, to });
    },
  }));
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error.message} />
      ) : (
        <DataTable
          data={Array.isArray(orders?.data) ? orders?.data : []}
          count={orders?.meta?.itemCount}
          setPage={(p: number) =>
            router.replace(
              pathname + "?" + createQueryString("page", String(p))
            )
          }
          setTake={setTake}
          pageSize={take}
          page={page}
        />
      )}
    </>
  );
}

export default forwardRef(OrderHistory);
