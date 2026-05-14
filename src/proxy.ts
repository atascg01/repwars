import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  // Auth-protected routes are handled by Auth.js
  // Additional proxy logic can be added here
  return auth(req as any);
}

export const config = {
  matcher: ["/dashboard/:path*", "/crews/:path*", "/api/import/:path*"],
};
