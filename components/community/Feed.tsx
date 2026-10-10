"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, POST_PAGE, POST_SELECT, type PostRow } from "@/lib/community";
import PostCard from "./PostCard";

type Filter = "recientes" | "populares" | "pregunta" | "practica" | "cultura" | "viajes";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "recientes", label: "Más recientes" },
  { key: "populares", label: "Más populares" },
  ...CATEGORIES.filter((c) => c.key !== "general").map((c) => ({
    key: c.key as Filter,
    label: c.label,
  })),
];

function likeEscape(s: string) {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`);
}

type Page = { rows: PostRow[]; more: boolean; likedIds: string[] };

export default function Feed({
  userId,
  mode,
  q,
  refreshKey,
}: {
  userId: string;
  mode: "all" | "mine";
  q: string;
  refreshKey: number;
}) {
  const [filter, setFilter] = useState<Filter>("recientes");
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [retry, setRetry] = useState(0);
  const reqRef = useRef(0);
  const [me, setMe] = useState<{ name: string; avatar: string | null } | null>(null);

  useEffect(() => {
    let alive = true;
    void createClient()
      .from("community_profiles")
      .select("display_name,avatar_url")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const r = data as { display_name: string; avatar_url: string | null } | null;
        if (alive && r) setMe({ name: r.display_name, avatar: r.avatar_url });
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  async function fetchPage(offset: number): Promise<Page | null> {
    const sb = createClient();
    let qy = sb.from("community_posts").select(POST_SELECT).eq("is_hidden", false);
    if (mode === "mine") qy = qy.eq("user_id", userId);
    if (filter !== "recientes" && filter !== "populares") qy = qy.eq("category", filter);
    const term = q.trim();
    if (term) qy = qy.ilike("body", `%${likeEscape(term)}%`);

    const ordered =
      filter === "populares"
        ? qy
            .order("likes_count", { ascending: false })
            .order("created_at", { ascending: false })
        : qy.order("created_at", { ascending: false });
    const { data, error: err } = await ordered.range(offset, offset + POST_PAGE);
    if (err) return null;

    const all = (data ?? []) as unknown as PostRow[];
    const more = all.length > POST_PAGE;
    const rows = more ? all.slice(0, POST_PAGE) : all;

    let likedIds: string[] = [];
    if (rows.length > 0) {
      const { data: r } = await sb
        .from("community_reactions")
        .select("post_id")
        .eq("user_id", userId)
        .in(
          "post_id",
          rows.map((p) => p.id),
        );
      likedIds = ((r ?? []) as unknown as { post_id: string }[]).map((x) => x.post_id);
    }
    return { rows, more, likedIds };
  }

  useEffect(() => {
    const id = ++reqRef.current;
    setLoading(true);
    setError(null);
    void fetchPage(0).then((res) => {
      if (id !== reqRef.current) return;
      if (!res) {
        setError("No pudimos cargar las publicaciones.");
        setPosts([]);
        setHasMore(false);
      } else {
        setPosts(res.rows);
        setLiked(new Set(res.likedIds));
        setHasMore(res.more);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, mode, q, refreshKey, userId, retry]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const res = await fetchPage(posts.length);
    setLoadingMore(false);
    if (!res) {
      setError("No pudimos cargar más publicaciones.");
      return;
    }
    setPosts((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...res.rows.filter((p) => !seen.has(p.id))];
    });
    setLiked((prev) => new Set([...prev, ...res.likedIds]));
    setHasMore(res.more);
  }

  function handleLike(id: string, nowLiked: boolean, delta: number) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (nowLiked) next.add(id);
      else next.delete(id);
      return next;
    });
    if (delta !== 0) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likes_count: Math.max(0, p.likes_count + delta) } : p,
        ),
      );
    }
  }

  function handleComments(id: string, delta: number) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, comments_count: Math.max(0, p.comments_count + delta) } : p,
      ),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar publicaciones">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === f.key
                ? "bg-navy text-white"
                : "bg-white text-navy ring-1 ring-black/10 hover:bg-black/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <>
            <div className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
          </>
        ) : error && posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRetry((n) => n + 1)}
              className="mt-3 rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-black/5"
            >
              Reintentar
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <p className="font-semibold text-navy">
              {q.trim()
                ? "Ninguna publicación coincide con tu búsqueda."
                : mode === "mine"
                  ? "Aún no has publicado nada."
                  : "Aún no hay publicaciones aquí."}
            </p>
            <p className="mt-1 text-sm text-muted">
              {q.trim()
                ? "Prueba con otras palabras."
                : "Usa el botón Crear publicación para empezar la conversación."}
            </p>
          </div>
        ) : (
          posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              userId={userId}
              liked={liked.has(p.id)}
              me={me}
              onLike={handleLike}
              onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))}
              onCommentsDelta={handleComments}
            />
          ))
        )}

        {!loading && hasMore && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="rounded-full border border-navy px-6 py-2.5 text-sm font-semibold text-navy hover:bg-black/5 disabled:opacity-60"
            >
              {loadingMore ? "Cargando..." : "Cargar más"}
            </button>
          </div>
        )}
        {error && posts.length > 0 && (
          <p role="alert" className="text-center text-sm font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}