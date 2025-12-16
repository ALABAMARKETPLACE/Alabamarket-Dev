"use client";

import {
  QueryClientProvider,
  QueryClient,
  QueryFunctionContext,
} from "@tanstack/react-query";
import { useState } from "react";
import { GET } from "./apicall";

const defaultQueryFn = async ({ queryKey, signal }: QueryFunctionContext) =>
  GET(
    Array.isArray(queryKey) ? queryKey[0] : "",
    {
      ...(typeof queryKey[1] == "object" && queryKey[1]),
    },
    signal
  );

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 1, //1 mint
            queryFn: defaultQueryFn,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
