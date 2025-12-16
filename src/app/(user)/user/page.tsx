import { redirect } from "next/navigation";

async function page() {
  redirect("/user/profile");
}

export default page;
