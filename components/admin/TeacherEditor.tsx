"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";

export type TeacherValues = {
  name: string;
  specialty: string;
  bio: string;
  image_url: string;
  sort: string;
  is_published: boolean;
};

const EMPTY: TeacherValues = {
  name: "",
  specialty: "",
  bio: "",
  image_url: "",
  sort: "0",
  is_published: true,
};

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function TeacherEditor({
  id,
  values,
}: {
  id?: string;
  values?: TeacherValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState<TeacherValues>(values ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function set<K extends keyof TeacherValues>(key: K, value: TeacherValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setMsg(null);
    const name = form.name.trim();
    if (!name) {
      setMsg({ ok: false, text: "Falta el nombre." });
      return;
    }
    const sort = Number(form.sort);
    if (form.sort.trim() === "" || Number.isNaN(sort)) {
      setMsg({ ok: false, text: "El orden debe ser un numero." });
      return;
    }
    const payload = {
      name,
      specialty: form.specialty.trim() || null,
      bio: form.bio.trim() || null,
      image_url: form.image_url.trim() || null,
      sort,
      is_published: form.is_published,
    };
    setBusy(true);
    const sb = createClient();
    if (id) {
      const { data, error } = await sb
        .from("teachers")
        .update(payload)
        .eq("id", id)
        .select("id");
      setBusy(false);
      if (error || !data || data.length === 0) {
        setMsg({ ok: false, text: "No se pudo guardar." });
        return;
      }
      setMsg({ ok: true, text: "Guardado." });
    } else {
      const { error } = await sb.from("teachers").insert(payload);
      setBusy(false);
      if (error) {
        setMsg({ ok: false, text: "No se pudo agregar el profesor." });
        return;
      }
      setForm(EMPTY);
      setMsg({ ok: true, text: "Profesor agregado." });
    }
    router.refresh();
  }

  async function remove() {
    if (!id) return;
    if (!window.confirm("Eliminar este profesor? No se puede deshacer.")) return;
    setBusy(true);
    const { data, error } = await createClient()
      .from("teachers")
      .delete()
      .eq("id", id)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      setMsg({ ok: false, text: "No se pudo eliminar." });
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-navy">
        Nombre
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-navy">
        Especialidad
        <input
          type="text"
          value={form.specialty}
          onChange={(e) => set("specialty", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-navy">
        Descripcion
        <textarea
          rows={4}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          className={inputClass}
        />
      </label>

      <div>
        <p className="text-sm font-medium text-navy">Foto</p>
        {form.image_url ? (
          <div
            className="mt-2 h-32 w-32 rounded-lg bg-cover bg-center ring-1 ring-black/10"
            style={{ backgroundImage: `url("${form.image_url}")` }}
          />
        ) : (
          <p className="mt-1 text-xs text-muted">Sin foto.</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <ImageUploader folder="teachers" onUploaded={(url) => set("image_url", url)} />
          {form.image_url && (
            <button
              type="button"
              onClick={() => set("image_url", "")}
              className="text-sm font-medium text-red-600"
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <label className="block text-sm font-medium text-navy">
          Orden (menor sale primero)
          <input
            type="number"
            value={form.sort}
            onChange={(e) => set("sort", e.target.value)}
            className={`${inputClass} w-28`}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-navy">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
          />
          Visible en la web
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
        >
          {busy ? "Un momento..." : id ? "Guardar" : "Agregar profesor"}
        </button>
        {id && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-full border border-red-600 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Eliminar
          </button>
        )}
        {msg && (
          <p
            role={msg.ok ? "status" : "alert"}
            className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}
          >
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}