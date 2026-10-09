import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/student/ProfileForm";

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export default async function PerfilPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data } = await sb
    .from("student_profiles")
    .select("full_name,phone,avatar_url")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  const profile = (data ?? null) as ProfileRow | null;

  const meta = (auth.user.user_metadata ?? {}) as Record<string, unknown>;
  const email = auth.user.email ?? "";
  const metaName = typeof meta.full_name === "string" ? meta.full_name : "";
  const name = profile?.full_name || metaName || email.split("@")[0] || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Mi perfil</h1>
      <p className="mt-1 text-sm text-muted">
        Actualiza tu foto y tus datos de contacto.
      </p>
      <div className="mt-6">
        <ProfileForm
          userId={auth.user.id}
          email={email}
          initialName={name}
          initialPhone={profile?.phone ?? ""}
          initialAvatar={profile?.avatar_url ?? null}
        />
      </div>
    </div>
  );
}