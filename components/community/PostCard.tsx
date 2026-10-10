"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "./Avatar";
import ReportButton from "./ReportButton";
import {
  MAX_COMMENT,
  categoryLabel,
  friendlyError,
  one,
  safeImageUrl,
  timeAgo,
  type CommentRow,
  type PostRow,
} from "@/lib/community";

const COMMENT_SELECT =
  "id,user_id,body,created_at,community_profiles(display_name,avatar_url)";

function Comments({
  postId,
  userId,
  onDelta,
}: {
  postId: string;
  userId: string;
  onDelta: (delta: number) => void;
}) {
  const [items, setItems] = useState<CommentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);

  async function load() {
    setError(null);
    const { data, error: err } = await createClient()
      .from("community_comments")
      .select(COMMENT_SELECT)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (err) {
      setError("No pudimos cargar los comentarios.");
      setItems([]);
      return;
    }
    setItems((data ?? []) as unknown as CommentRow[]);
  }

  if (!started) {
    setStarted(true);
    void load();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const { data, error: err } = await createClient()
      .from("community_comments")
      .insert({ post_id: postId, user_id: userId, body })
      .select(COMMENT_SELECT)
      .single();
    setSending(false);
    if (err || !data) {
      setError(friendlyError(err?.message, "No pudimos enviar tu comentario."));
      return;
    }
    setItems((prev) => [...(prev ?? []), data as unknown as CommentRow]);
    setText("");
    onDelta(1);
  }

  async function remove(id: string) {
    if (!window.confirm("Eliminar este comentario?")) return;
    const { error: err } = await createClient()
      .from("community_comments")
      .delete()
      .eq("id", id);
    if (err) {
      setError("No pudimos eliminar el comentario.");
      return;
    }
    setItems((prev) => (prev ?? []).filter((c) => c.id !== id));
    onDelta(-1);
  }

  return (
    <div className="mt-4 border-t border-black/5 pt-4">
      {items === null ? (
        <p className="text-sm text-muted">Cargando comentarios...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">Aún no hay comentarios. Escribe el primero.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => {
            const a = one(c.community_profiles);
            const name = a?.display_name ?? "Estudiante";
            return (
              <li key={c.id} className="flex gap-3">
                <Avatar name={name} url={a?.avatar_url} size={32} />
                <div className="min-w-0 flex-1 rounded-xl bg-[#f4f7fb] px-3 py-2">
                  <p className="text-xs">
                    <Link
                      href={`/dashboard/comunidad/perfil/${c.user_id}`}
                      className="font-semibold text-navy hover:underline"
                    >
                      {name}
                    </Link>{" "}
                    <span className="text-muted">{timeAgo(c.created_at)}</span>
                  </p>
                  <p className="mt-0.5 whitespace-pre-line break-words text-sm text-navy">
                    {c.body}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    {c.user_id === userId ? (
                      <button
                        type="button"
                        onClick={() => void remove(c.id)}
                        className="text-xs font-semibold text-red-600"
                      >
                        Eliminar
                      </button>
                    ) : (
                      <ReportButton targetType="comment" targetId={c.id} />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 flex items-end gap-2">
        <label className="flex-1">
          <span className="sr-only">Escribe un comentario</span>
          <textarea
            rows={2}
            maxLength={MAX_COMMENT}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un comentario..."
            className="w-full resize-none rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {sending ? "Enviando..." : "Comentar"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function PostCard({
  post,
  userId,
  liked,
  onLike,
  onDeleted,
  onCommentsDelta,
}: {
  post: PostRow;
  userId: string;
  liked: boolean;
  onLike: (id: string, nowLiked: boolean, delta: number) => void;
  onDeleted: (id: string) => void;
  onCommentsDelta: (id: string, delta: number) => void;
}) {
  const author = one(post.community_profiles);
  const name = author?.display_name ?? "Estudiante";
  const own = post.user_id === userId;
  const image = safeImageUrl(post.image_url);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [menu, setMenu] = useState(false);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const sb = createClient();
    const res = liked
      ? await sb
          .from("community_reactions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", userId)
      : await sb.from("community_reactions").insert({ post_id: post.id, user_id: userId });
    setBusy(false);
    if (res.error) {
      if (res.error.code === "23505") {
        onLike(post.id, true, 0);
        return;
      }
      setError("No pudimos guardar tu reacción.");
      return;
    }
    onLike(post.id, !liked, liked ? -1 : 1);
  }

  async function removePost() {
    if (!window.confirm("Eliminar esta publicación?")) return;
    setMenu(false);
    const sb = createClient();
    const { error: err } = await sb.from("community_posts").delete().eq("id", post.id);
    if (err) {
      setError("No pudimos eliminar la publicación.");
      return;
    }
    const marker = "/community-images/";
    if (post.image_url && post.image_url.includes(marker)) {
      const path = decodeURIComponent(post.image_url.split(marker)[1].split("?")[0]);
      await sb.storage.from("community-images").remove([path]);
    }
    onDeleted(post.id);
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <header className="flex items-start gap-3">
        <Avatar name={name} url={author?.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <Link
              href={`/dashboard/comunidad/perfil/${post.user_id}`}
              className="font-semibold text-navy hover:underline"
            >
              {name}
            </Link>
            {author?.spanish_level && (
              <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                {author.spanish_level}
              </span>
            )}
          </p>
          <p className="text-xs text-muted">
            {author?.country ? `${author.country} · ` : ""}
            {timeAgo(post.created_at)} · {categoryLabel(post.category)}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Más opciones"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
            className="rounded-full p-1.5 text-muted hover:bg-black/5"
          >
            <MoreHorizontal size={18} aria-hidden="true" />
          </button>
          {menu && (
            <div className="absolute right-0 top-9 z-10 w-56 rounded-xl bg-white p-3 shadow-lg ring-1 ring-black/10">
              {own ? (
                <button
                  type="button"
                  onClick={() => void removePost()}
                  className="text-sm font-semibold text-red-600"
                >
                  Eliminar publicación
                </button>
              ) : (
                <ReportButton targetType="post" targetId={post.id} label="Reportar publicación" />
              )}
            </div>
          )}
        </div>
      </header>

      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-navy">
        {post.body}
      </p>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt="Imagen adjunta a la publicación"
          loading="lazy"
          className="mt-3 max-h-96 w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3">
        <button
          type="button"
          onClick={() => void toggleLike()}
          disabled={busy}
          aria-pressed={liked}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-60 ${
            liked ? "bg-brand text-white" : "bg-[#eef4fc] text-navy hover:bg-[#dde8f8]"
          }`}
        >
          <Heart size={16} aria-hidden="true" />
          Me gusta · {post.likes_count}
        </button>
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          aria-expanded={showComments}
          className="inline-flex items-center gap-2 rounded-full bg-[#eef4fc] px-4 py-1.5 text-sm font-semibold text-navy hover:bg-[#dde8f8]"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Comentar · {post.comments_count}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {showComments && (
        <Comments
          postId={post.id}
          userId={userId}
          onDelta={(d) => onCommentsDelta(post.id, d)}
        />
      )}
    </article>
  );
}