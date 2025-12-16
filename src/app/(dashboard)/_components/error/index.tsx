import { Button, Result } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
interface props {
  description?: string;
  title?: string;
}

function Error(props: props) {
  const router = useRouter();
  return (
    <Result
      status="500"
      title={props?.title ?? "500"}
      subTitle={props?.description ?? "Sorry, something went wrong."}
      extra={
        <Button type="primary" onClick={() => router.push("/")}>
          Back Home
        </Button>
      }
    />
  );
}

export default Error;
