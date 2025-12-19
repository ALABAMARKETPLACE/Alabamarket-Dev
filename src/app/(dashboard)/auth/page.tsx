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
      const userType = (session as any)?.user?.type || (session as any)?.type;
      const userRole = (session as any)?.role;
      
      console.log("=== AUTH REDIRECTION DEBUG ===");
      console.log("User Type:", userType);
      console.log("User Role:", userRole);
      console.log("Session:", session);
      
      if (userRole === "admin") {
        router.push("/auth/dashboard");
      } else if (userType === "delivery_company" || userRole === "delivery_company") {
        console.log("Redirecting to delivery company dashboard...");
        // Check if delivery company is approved
        try {
          const companyId = (session as any)?.user?.delivery_company_id;
          
          if (!companyId) {
            // If no company_id in session, try to fetch it
            router.push(
              `/error?msg=${encodeURIComponent("Delivery company ID not found. Please contact support.")}&status=error`
            );
            return;
          }

          const response = await fetch(
            API.BASE_URL + API.DELIVERY_COMPANY_DETAILS + companyId,
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

          if (data?.data?.status === "approved" && data?.status) {
            router.push("/auth/delivery-company-dashboard");
          } else {
            const statusRemark = data?.data?.status_remark || "Your account is pending approval. Please wait for admin review.";
            const accountStatus = data?.data?.status || "pending";
            router.push(
              `/error?msg=${encodeURIComponent(statusRemark)}&status=${accountStatus}`
            );
          }
        } catch (error) {
          console.error("Server connection failed:", error);
          router.push(
            `/error?msg=${encodeURIComponent("Server is not available. Please try again later.")}&status=server_error`
          );
        }
      } else if (userType === "driver" || userRole === "driver") {
        // Drivers can log in directly (no approval needed)
        router.push("/auth/driver-dashboard");
      } else if (userRole === "seller" || userType === "seller") {
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
            const statusRemark = data?.data?.status_remark || "Your application is pending approval. Please wait for admin review.";
            const accountStatus = data?.data?.status || "pending";
            router.push(
              `/error?msg=${encodeURIComponent(statusRemark)}&status=${accountStatus}`
            );
          }
        } catch (error) {
          console.error("Server connection failed:", error);
          router.push(
            `/error?msg=${encodeURIComponent("Server is not available. Please try again later.")}&status=server_error`
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
