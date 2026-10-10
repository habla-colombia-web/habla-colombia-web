"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SPANISH_LEVELS, type MyProfile } from "@/lib/community";

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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
    const row: MyProfile = {
      user_id: initial.user_id,
      display_name: display,
      avatar_url: initial.avatar_url,
      country: country.trim() || null,
      native_language: native.trim() || null,
      spanish_level: level || null,
      interests: interests.trim() || null,
      bio: bio.trim() || null,
    };
    const { error } = await createClient()
      .from("community_profiles")
      .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: "No pudimos guardar tu perfil. Intenta de nuevo." });
      return;
    }
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