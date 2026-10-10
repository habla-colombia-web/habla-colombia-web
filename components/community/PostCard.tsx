"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, MoreHorizontal, Send, Share2, ThumbsUp } from "lucide-react";
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

export type Me = { name: string; avatar: string | null };

export default function PostCard({
  post,
  userId,
  liked,
  me,
  defaultOpen = false,
  onLike,
  onDeleted,
  onCommentsDelta,
}: {
  post: PostRow;
  userId: string;
  liked: boolean;
  me: Me | null;
  defaultOpen?: boolean;
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
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [open, setOpen] = useState(defaultOpen);
  const [items, setItems] = useState<CommentRow[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [cError, setCError] = useState<string | null>(null);

  async function loadComments() {
    setCError(null);
    const { data, error: err } = await createClient()
      .from("community_comments")
      .select(COMMENT_SELECT)
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })
      .limit(100);
    if (err) {
      setCError("No pudimos cargar los comentarios.");
      setItems([]);
      return;
    }
    setItems((data ?? []) as unknown as CommentRow[]);
  }

  useEffect(() => {
    if (defaultOpen) void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleComments() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (items === null) void loadComments();
  }

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

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setCError(null);
    const { data, error: err } = await createClient()
      .from("community_comments")
      .insert({ post_id: post.id, user_id: userId, body })
      .select(COMMENT_SELECT)
      .single();
    setSending(false);
    if (err || !data) {
      setCError(friendlyError(err?.message, "No pudimos enviar tu comentario."));
      return;
    }
    setText("");
    onCommentsDelta(post.id, 1);
    setOpen(true);
    if (items === null) {
      void loadComments();
    } else {
      setItems([...items, data as unknown as CommentRow]);
    }
  }

  async function removeComment(id: string) {
    if (!window.confirm("Eliminar este comentario?")) return;
    const { error: err } = await createClient()
      .from("community_comments")
      .delete()
      .eq("id", id);
    if (err) {
      setCError("No pudimos eliminar el comentario.");
      return;
    }
    setItems((prev) => (prev ?? []).filter((c) => c.id !== id));
    onCommentsDelta(post.id, -1);
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

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 3500);
  }

  async function share() {
    const url = `${window.location.origin}/dashboard/comunidad/publicacion/${post.id}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Habla Colombia",
          text: post.body.slice(0, 100),
          url,
        });
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("Enlace copiado.");
    } catch {
      flash(`No pudimos copiar el enlace. Cópialo aquí: ${url}`);
    }
  }

  const actionBtn =
    "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-60";

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

      {(post.likes_count > 0 || post.comments_count > 0) && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
          {post.likes_count > 0 && <span>{post.likes_count} Me gusta</span>}
          {post.comments_count > 0 && (
            <button type="button" onClick={toggleComments} className="hover:underline">
              {post.comments_count} {post.comments_count === 1 ? "comentario" : "comentarios"}
            </button>
          )}
        </div>
      )}

      <div className="mt-2 grid grid-cols-3 gap-1 border-y border-black/5 py-1">
        <button
          type="button"
          onClick={() => void toggleLike()}
          disabled={busy}
          aria-pressed={liked}
          className={`${actionBtn} ${liked ? "text-brand" : "text-muted"}`}
        >
          <ThumbsUp size={18} aria-hidden="true" fill={liked ? "currentColor" : "none"} />
          Me gusta
        </button>
        <button
          type="button"
          onClick={toggleComments}
          aria-expanded={open}
          className={`${actionBtn} text-muted`}
        >
          <MessageCircle size={18} aria-hidden="true" />
          Comentar
        </button>
        <button type="button" onClick={() => void share()} className={`${actionBtn} text-muted`}>
          <Share2 size={18} aria-hidden="true" />
          Compartir
        </button>
      </div>
      {notice && (
        <p role="status" className="mt-2 break-all text-sm font-medium text-emerald-700">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {open && (
        <div className="mt-4">
          {items === null ? (
            <p className="text-sm text-muted">Cargando comentarios...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted">Aún no hay comentarios. Escribe el primero.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((c) => {
                const a = one(c.community_profiles);
                const cname = a?.display_name ?? "Estudiante";
                return (
                  <li key={c.id} className="flex gap-3">
                    <Avatar name={cname} url={a?.avatar_url} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-[#f0f2f5] px-3 py-2">
                        <Link
                          href={`/dashboard/comunidad/perfil/${c.user_id}`}
                          className="text-xs font-semibold text-navy hover:underline"
                        >
                          {cname}
                        </Link>
                        <p className="whitespace-pre-line break-words text-sm text-navy">
                          {c.body}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-3 px-2 text-xs text-muted">
                        <span>{timeAgo(c.created_at)}</span>
                        {c.user_id === userId ? (
                          <button
                            type="button"
                            onClick={() => void removeComment(c.id)}
                            className="font-semibold text-red-600"
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
        </div>
      )}

      <form onSubmit={addComment} className="mt-4 flex items-center gap-2">
        <Avatar name={me?.name ?? "?"} url={me?.avatar} size={36} />
        <label className="flex min-w-0 flex-1 items-center rounded-full bg-[#f0f2f5] pl-4 pr-1">
          <span className="sr-only">Escribe un comentario</span>
          <input
            type="text"
            maxLength={MAX_COMMENT}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={me ? `Comentar como ${me.name}` : "Escribe un comentario..."}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-navy outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Enviar comentario"
            className="rounded-full p-2 text-brand hover:bg-black/5 disabled:opacity-40"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </label>
      </form>
      {cError && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {cError}
        </p>
      )}
    </article>
  );
}