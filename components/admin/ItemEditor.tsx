"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";

export type ItemField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "image";
  required?: boolean;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function ItemEditor({
  table,
  id,
  folder,
  fields,
  values,
}: {
  table: "courses" | "places";
  id: number | string;
  folder: string;
  fields: ItemField[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(values);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setMsg(null);
    const payload: Record<string, string | number | null> = {};
    for (const f of fields) {
      const raw = (form[f.key] ?? "").trim();
      if (f.required && raw === "") {
        setMsg({ ok: false, text: `Falta: ${f.label}` });
        return;
      }
      if (f.type === "number") {
        const n = Number(raw);
        if (raw === "" || Number.isNaN(n) || n < 0) {
          setMsg({ ok: false, text: `Valor no valido: ${f.label}` });
          return;
        }
        payload[f.key] = n;
      } else {
        payload[f.key] = raw === "" ? null : raw;
      }
    }
    setSaving(true);
    const { data, error } = await createClient()
      .from(table)
      .update(payload)
      .eq("id", id)
      .select("id");
    setSaving(false);
    if (error || !data || data.length === 0) {
      setMsg({ ok: false, text: "No se pudo guardar." });
      return;
    }
    setMsg({ ok: true, text: "Guardado." });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          {f.type === "image" ? (
            <>
              <p className="text-sm font-medium text-navy">{f.label}</p>
              {form[f.key] ? (
                <div
                  className="mt-2 h-28 w-full max-w-xs rounded-lg bg-cover bg-center ring-1 ring-black/10"
                  style={{ backgroundImage: `url("${form[f.key]}")` }}
                />
              ) : (
                <p className="mt-1 text-xs text-muted">Sin imagen.</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <ImageUploader folder={folder} onUploaded={(url) => set(f.key, url)} />
                {form[f.key] && (
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
                  rows={3}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputClass}
                />
              )}
            </label>
          )}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar"}
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