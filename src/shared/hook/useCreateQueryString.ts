import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback } from "react";

const useCreateQueryString = (): [
  ReadonlyURLSearchParams,
  (val: Record<string, string | number>) => void
] => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const createQueryString = useCallback(
    (paramsObject: Record<string, string | number>) => {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : ""
      );
      Object.entries(paramsObject).forEach(([name, value]) => {
        params.set(name, String(value));
      });

      return params.toString();
    },
    [searchParams]
  );

  const setQuery = (val: Record<string, string | number>) =>
    router.replace(pathname + "?" + createQueryString(val));

  return [searchParams, setQuery];
};

export default useCreateQueryString;
