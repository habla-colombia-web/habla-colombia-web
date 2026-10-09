import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/auth/AuthForm";

export default async function LoginPage() {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  if (data.user) {
    const { data: isAdmin } = await sb.rpc("is_admin");
    redirect(isAdmin ? "/admin" : "/dashboard");
  }
  return <AuthForm mode="login" />;
}