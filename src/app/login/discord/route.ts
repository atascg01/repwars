import { signIn } from "@/lib/auth";

export async function GET() {
  // signIn redirects internally — Auth.js handles CSRF + cookies server-side
  await signIn("discord", { redirectTo: "/dashboard" });
}
