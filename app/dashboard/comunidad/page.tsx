import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommunityApp from "@/components/community/CommunityApp";
import type { MyProfile } from "@/lib/community";

export default async function ComunidadPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const uid = auth.user.id;

  const { data: row, error } = await sb
    .from("community_profiles")
    .select("user_id,display_name,avatar_url,country,native_language,spanish_level,interests,bio")
    .eq("user_id", uid)
    .maybeSingle();

  if (error) {
    console.error("comunidad:", error.code, error.message);
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-navy">Comunidad Habla Colombia</h1>
        <p className="mt-3 text-muted">
          No pudimos cargar la comunidad en este momento. Intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const { data: sp } = await sb
    .from("student_profiles")
    .select("full_name,avatar_url")
    .eq("user_id", uid)
    .maybeSingle();
  const spRow = sp as { full_name?: string | null; avatar_url?: string | null } | null;
  const meta = (auth.user.user_metadata ?? {}) as Record<string, unknown>;
  const metaName = typeof meta.full_name === "string" ? meta.full_name : "";
  const email = auth.user.email ?? "";
  const displayName =
    (spRow?.full_name && spRow.full_name.trim()) || metaName.trim() || email.split("@")[0] || "";

  let profileRow = (row as MyProfile | null) ?? null;
  const studentAvatar = spRow?.avatar_url ?? null;
  if (
    profileRow &&
    !profileRow.avatar_url &&
    studentAvatar &&
    studentAvatar.startsWith("https://") &&
    studentAvatar.length <= 500
  ) {
    const { error: syncErr } = await sb
      .from("community_profiles")
      .update({ avatar_url: studentAvatar, updated_at: new Date().toISOString() })
      .eq("user_id", uid);
    if (!syncErr) profileRow = { ...profileRow, avatar_url: studentAvatar };
  }

  return (
    <CommunityApp
      userId={uid}
      initialProfile={profileRow}
      defaults={{ display_name: displayName, avatar_url: studentAvatar }}
    />
  );
}