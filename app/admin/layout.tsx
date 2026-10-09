import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const meta = (auth.user.user_metadata ?? {}) as Record<string, unknown>;
  const email = auth.user.email ?? "";
  const metaName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  const userName = metaName || email.split("@")[0] || "Administrador";

  return (
    <AdminShell userName={userName} userEmail={email}>
      {children}
    </AdminShell>
  );
}