import React from "react";
import "./style.scss";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import ScreenLayout from "./screenLayout";
async function layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session: any = await getServerSession(options);
  return <ScreenLayout data={session}>{children}</ScreenLayout>;
}
export default layout;
