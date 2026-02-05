import { getAndClearLoginError } from "../[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const errorKey = searchParams.get("key");

  if (!errorKey) {
    return NextResponse.json({ error: null });
  }

  const error = getAndClearLoginError(errorKey);
  return NextResponse.json({ error });
}
