import { GET } from "@/util/apicall";
import { useEffect, useState } from "react";

function useFetch(
  url: string = "",
  pagination: boolean = false,
  pageSize: number = 5
) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<any>(false);
  const [meta, setMeta] = useState<any>(null);
  const [message, setMessage] = useState("");

  const fetchData = async (currentPage: number = 1) => {
    setLoading(true);
    const apiUrl = pagination
      ? url + `?order=DESC&page=${currentPage}&take=${pageSize}`
      : url;
    try {
      const response: any = await GET(apiUrl);
      if (response?.status) {
        setData(response?.data);
        setMeta(response?.meta);
        setMessage(response?.message);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err: any) {
      setError(true);
      setMessage(err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);
  return { data, isLoading, error, fetchData, meta, message };
}
export default useFetch;
