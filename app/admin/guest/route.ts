import { NextResponse } from "next/server";
import { CRM_GUEST_COOKIE } from "@/lib/admin/guest";

export function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/admin", url.origin));
  response.cookies.set(CRM_GUEST_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });
  return response;
}
