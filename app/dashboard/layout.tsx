import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/components/student/StudentShell";
import SignOutButton from "@/components/layout/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: prof } = await sb
    .from("student_profiles")
    .select("full_name,avatar_url")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  const profile = (prof ?? null) as { full_name: string | null; avatar_url: string | null } | null;

  const meta = (auth.user.user_metadata ?? {}) as Record<string, unknown>;
  const email = auth.user.email ?? "";
  const metaName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  const userName = profile?.full_name || metaName || email.split("@")[0] || "Estudiante";

  return (
    <StudentShell
      userName={userName}
      userEmail={email}
      avatarUrl={profile?.avatar_url ?? null}
      signOut={
        <SignOutButton className="rounded-full border border-navy/30 px-4 py-2 text-sm font-medium text-navy hover:bg-black/5 disabled:opacity-60" />
      }
    >
      {children}
    </StudentShell>
  );
}