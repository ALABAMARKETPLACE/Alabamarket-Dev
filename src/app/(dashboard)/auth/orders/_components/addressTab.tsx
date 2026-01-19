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

  const getStateName = (id: string | number) => {
    if (!states?.data) return id;
    const state = states.data.find((s: any) => s.id == id);
    return state ? state.name : id;
  };

  const getContactName = () => {
    // Helper to filter out "undefined" strings or null/undefined values
    const isValid = (val: any) =>
      val &&
      val !== "undefined" &&
      val !== "null" &&
      typeof val === "string" &&
      val.trim() !== "";

    if (isValid(props?.data?.name)) return props.data.name;
    if (isValid(props?.data?.order_contact_name))
      return props.data.order_contact_name;
    if (isValid(user?.data?.name)) return user.data.name;
    if (isValid(user?.data?.first_name)) {
      const last = isValid(user?.data?.last_name) ? user.data.last_name : "";
      return `${user.data.first_name} ${last}`.trim();
    }
    // Fallback to seller name if all else fails
    if (isValid(props?.data?.seller_name)) return props.data.seller_name;

    return "N/A";
  };

  return (
    <Card title={"Delivery Address"} className="h-100">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Contact Name">
          {getContactName()}
        </Descriptions.Item>
        <Descriptions.Item label="Phone Number">
          {props?.data?.phone_no || user?.data?.phone || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Address Type">
          <span className="text-capitalize">
            {props?.data?.address_type || "N/A"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="State">
          {props?.data?.state ||
            (props?.data?.state_id
              ? getStateName(props?.data?.state_id)
              : "N/A")}
        </Descriptions.Item>
        <Descriptions.Item label="City">
          {props?.data?.city || props?.data?.city_id || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Full Address">
          {props?.data?.full_address || props?.data?.address || "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
