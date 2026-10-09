"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function ProfileForm({
  userId,
  email,
  initialName,
  initialPhone,
  initialAvatar,
}: {
  userId: string;
  email: string;
  initialName: string;
  initialPhone: string;
  initialAvatar: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setOk(null);
    if (!TYPES.includes(file.type)) {
      setError("Usa una imagen JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La imagen supera los 5 MB.");
      return;
    }
    setBusy(true);
    const ext =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const sb = createClient();
    const { error: upErr } = await sb.storage
      .from("avatars")
      .upload(path, file, { cacheControl: "31536000", contentType: file.type });
    if (upErr) {
      setBusy(false);
      setError("No se pudo subir la foto. Intenta de nuevo.");
      return;
    }
    const { data } = sb.storage.from("avatars").getPublicUrl(path);
    const { error: dbErr } = await sb.from("student_profiles").upsert({
      user_id: userId,
      avatar_url: data.publicUrl,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (dbErr) {
      setError("La foto se subió, pero no pudimos guardarla en tu perfil.");
      return;
    }
    setAvatar(data.publicUrl);
    setOk("Foto actualizada.");
    router.refresh();
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (!cleanName) {
      setError("Escribe tu nombre.");
      return;
    }
    if (cleanPhone && !PHONE_RE.test(cleanPhone)) {
      setError("El celular no es válido. Usa solo números, espacios y el signo +.");
      return;
    }
    setSaving(true);
    const sb = createClient();
    const { error: dbErr } = await sb.from("student_profiles").upsert({
      user_id: userId,
      full_name: cleanName,
      phone: cleanPhone || null,
      updated_at: new Date().toISOString(),
    });
    if (dbErr) {
      setSaving(false);
      setError("No pudimos guardar tus datos. Intenta de nuevo.");
      return;
    }
    await sb.auth.updateUser({ data: { full_name: cleanName } });
    setSaving(false);
    setOk("Datos guardados.");
    router.refresh();
  }

  const letter = (name.trim().charAt(0) || "?").toUpperCase();

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-3xl font-bold text-white">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="Tu foto de perfil" className="h-full w-full object-cover" />
          ) : (
            letter
          )}
        </span>
        <div>
          <label className="inline-block cursor-pointer rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-black/5">
            {busy ? "Subiendo..." : avatar ? "Cambiar foto" : "Subir foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={onPhoto}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-xs text-muted">JPG, PNG o WEBP. Máximo 5 MB.</p>
        </div>
      </section>

      <form onSubmit={onSave} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <label className="block text-sm font-medium text-navy">
          Nombre
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          Celular
          <input
            type="tel"
            autoComplete="tel"
            placeholder="+57 300 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          Correo
          <input
            type="email"
            value={email}
            readOnly
            className={`${inputClass} bg-black/[0.04] text-muted`}
          />
        </label>
        <p className="text-xs text-muted">
          El correo no se puede cambiar desde aquí.
        </p>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        {ok && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            {ok}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}