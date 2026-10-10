"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORIES,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_POST,
  friendlyError,
  type CategoryKey,
} from "@/lib/community";

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function PostComposer({
  userId,
  onClose,
  onCreated,
}: {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CategoryKey>("general");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
  }

  function close() {
    if (busy) return;
    clearImage();
    onClose();
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) {
      setError("Usa una imagen JPG, PNG o WEBP.");
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setError("La imagen supera los 3 MB.");
      return;
    }
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const text = body.trim();
    if (!text) {
      setError("Escribe algo antes de publicar.");
      return;
    }
    setBusy(true);
    setError(null);
    const sb = createClient();

    let imageUrl: string | null = null;
    let path: string | null = null;
    if (file) {
      const ext =
        file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await sb.storage
        .from("community-images")
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (up.error) {
        setBusy(false);
        setError("No pudimos subir la imagen. Intenta de nuevo.");
        return;
      }
      imageUrl = sb.storage.from("community-images").getPublicUrl(path).data.publicUrl;
    }

    const { error: err } = await sb
      .from("community_posts")
      .insert({ user_id: userId, body: text, category, image_url: imageUrl });

    if (err) {
      if (path) await sb.storage.from("community-images").remove([path]);
      setBusy(false);
      setError(friendlyError(err.message, "No pudimos publicar. Intenta de nuevo."));
      return;
    }
    clearImage();
    setBusy(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label="Crear publicación"
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-bold text-navy">Crear publicación</h2>

        <label className="mt-4 block text-sm font-medium text-navy">
          Tu mensaje
          <textarea
            rows={5}
            maxLength={MAX_POST}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Comparte algo con la comunidad..."
            className={inputClass}
          />
        </label>
        <p className="mt-1 text-right text-xs text-muted">
          {body.length} / {MAX_POST}
        </p>

        <label className="mt-2 block text-sm font-medium text-navy">
          Categoría
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="text-sm font-medium text-navy">Imagen (opcional, hasta 3 MB)</p>
          {preview && (
            <div
              className="mt-2 h-40 w-full rounded-lg bg-cover bg-center ring-1 ring-black/10"
              style={{ backgroundImage: `url("${preview}")` }}
            />
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="inline-block cursor-pointer rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-black/5">
              {file ? "Cambiar imagen" : "Adjuntar imagen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={onPick}
                className="sr-only"
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={clearImage}
                disabled={busy}
                className="text-sm font-medium text-red-600"
              >
                Quitar imagen
              </button>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy || !body.trim()}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Publicando..." : "Publicar"}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="rounded-full border border-navy px-6 py-2.5 text-sm font-semibold text-navy hover:bg-black/5 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}