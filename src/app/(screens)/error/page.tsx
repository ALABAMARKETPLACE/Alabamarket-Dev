"use client";
import { Button, Result } from "antd";
import Link from "next/link";
import React from "react";

function Error() {
  return (
    <Result
      status="500"
      title="500"
      subTitle="Sorry, something went wrong."
      extra={<Link href='/'><Button type="primary">Back Home</Button></Link>}
    />
  );
}

export default Error;
