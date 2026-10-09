"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";

type Field = { key: string; label: string; type: "text" | "textarea" | "image" };

const FIELDS: Field[] = [
  { key: "hero_image", label: "Imagen del banner principal", type: "image" },
  { key: "hero_title", label: "Titulo del banner", type: "text" },
  { key: "hero_highlight", label: "Parte resaltada del titulo", type: "text" },
  { key: "hero_text", label: "Texto del banner", type: "textarea" },
  { key: "testimonial_quote", label: "Testimonio", type: "textarea" },
  { key: "testimonial_author", label: "Autor del testimonio", type: "text" },
  {
    key: "about_text",
    label: "Texto de Sobre nosotros (deja una linea en blanco entre parrafos)",
    type: "textarea",
  },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function ContentEditor({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const rows = FIELDS.map((f) => ({
      key: f.key,
      value: values[f.key] ?? "",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await createClient().from("site_content").upsert(rows);
    setSaving(false);
    if (error) {
      setMsg({ ok: false, text: "No se pudo guardar. Intenta de nuevo." });
      return;
    }
    setMsg({ ok: true, text: "Cambios guardados." });
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      {FIELDS.map((f) => (
        <div key={f.key}>
          {f.type === "image" ? (
            <>
              <p className="text-sm font-medium text-navy">{f.label}</p>
              {values[f.key] ? (
                <div
                  className="mt-2 h-40 w-full max-w-md rounded-lg bg-cover bg-center ring-1 ring-black/10"
                  style={{ backgroundImage: `url("${values[f.key]}")` }}
                />
              ) : (
                <p className="mt-1 text-xs text-muted">Sin imagen (se usa el fondo por defecto).</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <ImageUploader folder="banner" onUploaded={(url) => set(f.key, url)} />
                {values[f.key] && (
                  <button
                    type="button"
                    onClick={() => set(f.key, "")}
                    className="text-sm font-medium text-red-600"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </>
          ) : (
            <label className="block text-sm font-medium text-navy">
              {f.label}
              {f.type === "textarea" ? (
                <textarea
                  rows={4}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                />
              ) : (
                <input
                  type="text"
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                />
              )}
            </label>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
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
    </div>
  );
}