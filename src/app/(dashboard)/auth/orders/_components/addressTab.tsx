import { Card } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";

type Props = {
  data: any;
};

export default function AddressTab(props: Props) {
  const { data: initialData } = props;

  // If the passed data is incomplete but has an ID, try to fetch the full address details
  // We check for minimal required fields to decide if we need to fetch
  const shouldFetch = initialData?.id && (!initialData?.full_address || !initialData?.phone_no);

  const { data: fetchedData } = useQuery({
    queryKey: ["address_details", initialData?.id],
    queryFn: async () => await GET(API.NEW_ADDRESS + initialData?.id),
    enabled: !!shouldFetch,
    staleTime: 300000, // 5 minutes
  });

  // Use fetched data if available, otherwise use initial data
  const addressData = fetchedData?.data || initialData;

  return (
    <Card title={"Delivery Address"}>
      <div className="d-flex flex-column gap-2">
        <div>
          <strong>Type:</strong> {addressData?.address_type || addressData?.type || "N/A"}
        </div>
        
        {addressData?.city && (
          <div>
            <strong>City:</strong> {addressData?.city}
          </div>
        )}
        
        <div>
          <strong>State:</strong> {addressData?.stateDetails?.name || addressData?.state || "N/A"}
        </div>
        
        <div>
          <strong>Address:</strong> {addressData?.full_address || addressData?.fullAddress || "N/A"}
        </div>
        
        <div>
          <strong>Phone Number:</strong> {addressData?.code ? `${addressData.code} ` : ""}
          {addressData?.phone_no || addressData?.alt_phone || "N/A"}
        </div>
      </div>
    </Card>
  );
}
