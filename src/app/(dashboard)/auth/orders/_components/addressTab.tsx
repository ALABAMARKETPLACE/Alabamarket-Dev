import { Card } from "antd";
import { Descriptions } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";

type Props = {
  data: any;
};

export default function AddressTab(props: Props) {
  const { data: user } = useQuery({
    queryFn: async () => await GET(API.USER_DETAILS + props?.data?.user_id),
    queryKey: ["user_details", props?.data?.user_id],
    enabled: !!props?.data?.user_id,
  });

  const { data: states } = useQuery({
    queryFn: async () => await GET(API.STATES),
    queryKey: ["states_list"],
    staleTime: Infinity,
  });

  const { data: countries } = useQuery({
    queryFn: async () => await GET(API.COUNTRIES),
    queryKey: ["countries_list"],
    staleTime: Infinity,
  });

  const getStateName = (id: string | number) => {
    if (!states?.data) return id;
    const state = states.data.find((s: any) => s.id == id);
    return state ? state.name : id;
  };

  const getCountryName = (id: string | number) => {
    if (!countries?.data) return id;
    const country = countries.data.find((c: any) => c.id == id);
    return country ? country.name : id;
  };

  return (
    <Card title={"Delivery Address"} className="h-100">
      <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Contact Name:</span>
            <span className="fw-medium">{user?.data?.name || "N/A"}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Phone Number:</span>
            <span className="fw-medium">{props?.data?.phone_no || "N/A"}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Address Type:</span>
            <span className="text-capitalize">{props?.data?.address_type || "N/A"}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Country:</span>
            <span>{props?.data?.country_id ? getCountryName(props?.data?.country_id) : "N/A"}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">State:</span>
            <span>{props?.data?.state_id ? getStateName(props?.data?.state_id) : "N/A"}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">City:</span>
            <span>{props?.data?.city || "N/A"}</span>
        </div>
        <div className="d-flex flex-column pt-2">
            <span className="text-muted mb-1">Full Address:</span>
            <span className="bg-light p-2 rounded small">{props?.data?.full_address || "N/A"}</span>
        </div>
      </div>
    </Card>
  );
}
