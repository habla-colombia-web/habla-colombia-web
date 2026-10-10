import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/community/Avatar";
import ReportButton from "@/components/community/ReportButton";
import {
  categoryLabel,
  safeImageUrl,
  timeAgo,
  type MyProfile,
} from "@/lib/community";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PostLite = {
  id: string;
  body: string;
  category: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export default async function PerfilComunidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data } = await sb
    .from("community_profiles")
    .select("user_id,display_name,avatar_url,country,native_language,spanish_level,interests,bio,created_at")
    .eq("user_id", id)
    .maybeSingle();
  if (!data) notFound();
  const p = data as unknown as MyProfile & { created_at: string };

  const { data: postsData } = await sb
    .from("community_posts")
    .select("id,body,category,image_url,likes_count,comments_count,created_at")
    .eq("user_id", id)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(10);
  const posts = (postsData ?? []) as unknown as PostLite[];
  const own = auth.user.id === id;

  const facts: { label: string; value: string | null }[] = [
    { label: "País", value: p.country },
    { label: "Idioma nativo", value: p.native_language },
    { label: "Nivel de español", value: p.spanish_level },
    { label: "Intereses", value: p.interests },
    {
      label: "Miembro desde",
      value: new Date(p.created_at).toLocaleDateString("es-CO", {
        month: "long",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link href="/dashboard/comunidad" className="text-sm font-semibold text-brand">
        Volver a la comunidad
      </Link>

      <section className="mt-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <Avatar name={p.display_name} url={p.avatar_url} size={64} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-navy">{p.display_name}</h1>
            {own && <p className="text-xs text-muted">Así ven tu perfil las demás personas.</p>}
          </div>
        </div>
        {p.bio && (
          <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-navy">
            {p.bio}
          </p>
        )}
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {facts
            .filter((f) => f.value)
            .map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-semibold uppercase text-muted">{f.label}</dt>
                <dd className="text-sm text-navy">{f.value}</dd>
              </div>
            ))}
        </dl>
        {!own && (
          <div className="mt-4">
            <ReportButton targetType="profile" targetId={p.user_id} label="Reportar perfil" />
          </div>
        )}
      </section>

      <h2 className="mt-8 text-xl font-bold text-navy">Publicaciones recientes</h2>
      {posts.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Aún no hay publicaciones.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {posts.map((post) => {
            const img = safeImageUrl(post.image_url);
            return (
              <li
                key={post.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <p className="text-xs text-muted">
                  {timeAgo(post.created_at)} · {categoryLabel(post.category)}
                </p>
                <p className="mt-2 whitespace-pre-line break-words text-sm text-navy">
                  {post.body}
                </p>
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt="Imagen adjunta a la publicación"
                    loading="lazy"
                    className="mt-3 max-h-80 w-full rounded-xl object-cover"
                  />
                )}
                <p className="mt-3 text-xs text-muted">
                  {post.likes_count} Me gusta · {post.comments_count} comentarios
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}