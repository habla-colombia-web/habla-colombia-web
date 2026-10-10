"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";

const ITEMS = [
  { key: "feature_1_image", title: "Español colombiano y latinoamericano" },
  { key: "feature_2_image", title: "Profesores nativos y certificados" },
  { key: "feature_3_image", title: "Conversaciones reales" },
  { key: "feature_4_image", title: "100% online y flexible" },
  { key: "feature_5_image", title: "Comunidad internacional" },
];

export default function FeatureImagesEditor({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ key: string; ok: boolean; text: string } | null>(null);

  async function save(key: string) {
    setBusyKey(key);
    setMsg(null);
    const { error } = await createClient()
      .from("site_content")
      .upsert({
        key,
        value: values[key] ?? "",
        updated_at: new Date().toISOString(),
      });
    setBusyKey(null);
    if (error) {
      setMsg({ key, ok: false, text: "No se pudo guardar. Intenta de nuevo." });
      return;
    }
    setMsg({ key, ok: true, text: "Cambios guardados." });
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3">
      {ITEMS.map((it) => (
        <details
          key={it.key}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
        >
          <summary className="cursor-pointer text-base font-bold text-navy">
            {it.title}
          </summary>
          <div className="mt-4">
            <p className="text-sm font-medium text-navy">Imagen</p>
            {values[it.key] ? (
              <div
                className="mt-2 h-40 w-full max-w-md rounded-lg bg-cover bg-center ring-1 ring-black/10"
                style={{ backgroundImage: `url("${values[it.key]}")` }}
              />
            ) : (
              <p className="mt-1 text-xs text-muted">
                Sin imagen (se muestra el icono de color).
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <ImageUploader
                folder="banner"
                onUploaded={(url) => setValues((v) => ({ ...v, [it.key]: url }))}
              />
              {values[it.key] && (
                <button
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, [it.key]: "" }))}
                  className="text-sm font-medium text-red-600"
                >
                  Quitar imagen
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => save(it.key)}
                disabled={busyKey === it.key}
                className="rounded-full bg-gold px-6 py-2 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
              >
                {busyKey === it.key ? "Guardando..." : "Guardar"}
              </button>
              {msg && msg.key === it.key && (
                <p
                  role={msg.ok ? "status" : "alert"}
                  className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}
                >
                  {msg.text}
                </p>
              )}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}