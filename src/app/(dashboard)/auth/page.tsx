"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import API from "@/config/API";

function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading session

    if (!session) {
      router.push("/");
      return;
    }

    const checkUserRole = async () => {
      if ((session as any)?.role === "admin") {
        router.push("/auth/dashboard");
      } else if ((session as any)?.role === "seller") {
        console.log("check session", session);
        console.log("API BASE URL:", API.BASE_URL);
        console.log(
          "Full API URL:",
          API.BASE_URL + API.CORPORATE_STORE_CHECKSTORE
        );

        try {
          const response = await fetch(
            API.BASE_URL + API.CORPORATE_STORE_CHECKSTORE,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${(session as any)?.token ?? ""}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response?.json();
          console.log("this datatatat", data);

          if (data?.data?.status === "approved" && data?.status) {
            console.log("coming heree");
            router.push("/auth/overview");
          } else {
            router.push(
              `/error?msg=${data?.data?.status_remark}&status=${data?.data?.status}`
            );
          }
        } catch (error) {
          console.error("Server connection failed:", error);
          router.push(
            "/error?msg=Server is not available. Please try again later.&status=server_error"
          );
        }
      } else {
        router.push("/");
      }
    };

    checkUserRole();
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <div>Redirecting...</div>;
}

export default Page;
