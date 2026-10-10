"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  SPANISH_LEVELS,
  type MyProfile,
} from "@/lib/community";
import Avatar from "./Avatar";

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function ProfileEditor({
  initial,
  mode,
  onSaved,
}: {
  initial: MyProfile;
  mode: "create" | "edit";
  onSaved: (p: MyProfile) => void;
}) {
  const [name, setName] = useState(initial.display_name);
  const [country, setCountry] = useState(initial.country ?? "");
  const [native, setNative] = useState(initial.native_language ?? "");
  const [level, setLevel] = useState(initial.spanish_level ?? "");
  const [interests, setInterests] = useState(initial.interests ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) {
      setMsg({ ok: false, text: "Usa una imagen JPG, PNG o WEBP." });
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setMsg({ ok: false, text: "La imagen supera los 3 MB." });
      return;
    }
    setMsg(null);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function removePhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setAvatarUrl(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const display = name.trim();
    if (display.length < 2) {
      setMsg({ ok: false, text: "El nombre visible debe tener al menos 2 caracteres." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const sb = createClient();

    let finalUrl = avatarUrl;
    let path: string | null = null;
    if (file) {
      const ext =
        file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      path = `${initial.user_id}/avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await sb.storage
        .from("community-images")
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (up.error) {
        setBusy(false);
        setMsg({ ok: false, text: "No pudimos subir la foto. Intenta de nuevo." });
        return;
      }
      finalUrl = sb.storage.from("community-images").getPublicUrl(path).data.publicUrl;
    }

    const row: MyProfile = {
      user_id: initial.user_id,
      display_name: display,
      avatar_url: finalUrl,
      country: country.trim() || null,
      native_language: native.trim() || null,
      spanish_level: level || null,
      interests: interests.trim() || null,
      bio: bio.trim() || null,
    };
    const { error } = await sb
      .from("community_profiles")
      .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      if (path) await sb.storage.from("community-images").remove([path]);
      setBusy(false);
      setMsg({ ok: false, text: "No pudimos guardar tu perfil. Intenta de nuevo." });
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setAvatarUrl(finalUrl);
    setBusy(false);
    setMsg({ ok: true, text: "Perfil guardado." });
    onSaved(row);
  }

  return (
    <form
      onSubmit={save}
      className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <p className="text-sm text-muted">
        Esta información es visible para otros estudiantes. Tu correo y tu teléfono
        nunca se muestran en la comunidad.
      </p>

      <div>
        <p className="text-sm font-medium text-navy">Foto de perfil (opcional)</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {preview ? (
            <span
              aria-hidden="true"
              className="block h-[72px] w-[72px] rounded-full bg-cover bg-center ring-1 ring-black/10"
              style={{ backgroundImage: `url("${preview}")` }}
            />
          ) : (
            <Avatar name={name || "?"} url={avatarUrl} size={72} />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-block cursor-pointer rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-black/5">
              {preview || avatarUrl ? "Cambiar foto" : "Subir foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={onPick}
                className="sr-only"
              />
            </label>
            {(preview || avatarUrl) && (
              <button
                type="button"
                onClick={removePhoto}
                disabled={busy}
                className="text-sm font-medium text-red-600"
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">
          JPG, PNG o WEBP de hasta 3 MB. Se aplica al pulsar Guardar perfil.
        </p>
      </div>

      <label className="block text-sm font-medium text-navy">
        Nombre visible
        <input
          type="text"
          required
          minLength={2}
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy">
          País (opcional)
          <input
            type="text"
            maxLength={60}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          Idioma nativo (opcional)
          <input
            type="text"
            maxLength={60}
            value={native}
            onChange={(e) => setNative(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-navy">
        Nivel de español (opcional)
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
          <option value="">Prefiero no indicarlo</option>
          {SPANISH_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-navy">
        Intereses culturales (opcional)
        <input
          type="text"
          maxLength={200}
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-navy">
        Presentación personal (opcional)
        <textarea
          rows={4}
          maxLength={300}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={inputClass}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Guardando..." : mode === "create" ? "Entrar a la comunidad" : "Guardar perfil"}
        </button>
        {msg && (
          <p
            role={msg.ok ? "status" : "alert"}
            className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}
          >
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}