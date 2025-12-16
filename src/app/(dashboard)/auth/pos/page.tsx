import React from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button } from "antd";
import Error from "@/app/(dashboard)/_components/error";

function Page() {
  return (
    <>
      <PageHeader title={"Pos"} bredcume={"Dashboard / Pos"}>
        <div className="d-flex gap-3">
          <Button
            type="primary"
            ghost
            // onClick={() => refetch()}
            // loading={isFetching}
          >
            Refresh
          </Button>
        </div>
      </PageHeader>
    </>
  );
}

export default Page;
