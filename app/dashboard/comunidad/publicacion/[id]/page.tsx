import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SinglePost from "@/components/community/SinglePost";
import { POST_SELECT, type PostRow } from "@/lib/community";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PublicacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const uid = auth.user.id;

  const { data: meRow } = await sb
    .from("community_profiles")
    .select("display_name,avatar_url")
    .eq("user_id", uid)
    .maybeSingle();
  if (!meRow) redirect("/dashboard/comunidad");
  const me = meRow as { display_name: string; avatar_url: string | null };

  const { data: post } = await sb
    .from("community_posts")
    .select(POST_SELECT)
    .eq("id", id)
    .eq("is_hidden", false)
    .maybeSingle();
  if (!post) notFound();

  const { data: reaction } = await sb
    .from("community_reactions")
    .select("post_id")
    .eq("post_id", id)
    .eq("user_id", uid)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link href="/dashboard/comunidad" className="text-sm font-semibold text-brand">
        Volver a la comunidad
      </Link>
      <div className="mt-3">
        <SinglePost
          post={post as unknown as PostRow}
          userId={uid}
          liked={Boolean(reaction)}
          me={{ name: me.display_name, avatar: me.avatar_url }}
        />
      </div>
    </div>
  );
}