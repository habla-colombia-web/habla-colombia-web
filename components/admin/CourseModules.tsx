"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mod = { id: string; title: string; position: number };
type Les = { id: string; title: string; module_id: string | null };
type Edit = { title: string; position: string };

const inputClass =
  "rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function CourseModules({
  courseId,
  modules,
  lessons,
}: {
  courseId: string;
  modules: Mod[];
  lessons: Les[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(String(modules.length + 1));
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const fail = (text: string) => setMsg({ ok: false, text });

  function editOf(m: Mod): Edit {
    return edits[m.id] ?? { title: m.title, position: String(m.position) };
  }

  async function addModule() {
    setMsg(null);
    const t = title.trim();
    const pos = Number(position);
    if (!t) return fail("Falta el titulo del modulo.");
    if (position.trim() === "" || Number.isNaN(pos)) {
      return fail("El orden debe ser un numero.");
    }
    setBusy(true);
    const { error } = await createClient()
      .from("course_modules")
      .insert({ course_id: courseId, title: t, position: pos });
    setBusy(false);
    if (error) return fail("No se pudo agregar el modulo.");
    setTitle("");
    setPosition(String(modules.length + 2));
    setMsg({ ok: true, text: "Modulo agregado." });
    router.refresh();
  }

  async function saveModule(m: Mod) {
    setMsg(null);
    const e = editOf(m);
    const t = e.title.trim();
    const pos = Number(e.position);
    if (!t) return fail("El modulo necesita un titulo.");
    if (e.position.trim() === "" || Number.isNaN(pos)) {
      return fail("El orden debe ser un numero.");
    }
    setBusy(true);
    const { data, error } = await createClient()
      .from("course_modules")
      .update({ title: t, position: pos })
      .eq("id", m.id)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) return fail("No se pudo guardar.");
    setMsg({ ok: true, text: "Guardado." });
    router.refresh();
  }

  async function removeModule(m: Mod) {
    if (!window.confirm("Eliminar este modulo? Sus clases quedan sin modulo.")) return;
    setMsg(null);
    setBusy(true);
    const { data, error } = await createClient()
      .from("course_modules")
      .delete()
      .eq("id", m.id)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) return fail("No se pudo eliminar.");
    router.refresh();
  }

  async function assign(lessonId: string, moduleId: string) {
    setMsg(null);
    setBusy(true);
    const { data, error } = await createClient()
      .from("lessons")
      .update({ module_id: moduleId || null })
      .eq("id", lessonId)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) return fail("No se pudo mover la clase.");
    setMsg({ ok: true, text: "Clase actualizada." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-navy">Modulos</h3>
        {modules.length === 0 && (
          <p className="mt-2 text-sm text-muted">Sin modulos todavia.</p>
        )}
        <ul className="mt-2 space-y-2">
          {modules.map((m) => {
            const e = editOf(m);
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-2">
                <input
                  aria-label="Titulo del modulo"
                  value={e.title}
                  onChange={(ev) =>
                    setEdits((s) => ({ ...s, [m.id]: { ...e, title: ev.target.value } }))
                  }
                  className={`${inputClass} min-w-48 flex-1`}
                />
                <input
                  aria-label="Orden"
                  type="number"
                  value={e.position}
                  onChange={(ev) =>
                    setEdits((s) => ({ ...s, [m.id]: { ...e, position: ev.target.value } }))
                  }
                  className={`${inputClass} w-20`}
                />
                <button
                  type="button"
                  onClick={() => saveModule(m)}
                  disabled={busy}
                  className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => removeModule(m)}
                  disabled={busy}
                  className="rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            aria-label="Titulo del nuevo modulo"
            placeholder="Nuevo modulo"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            className={`${inputClass} min-w-48 flex-1`}
          />
          <input
            aria-label="Orden del nuevo modulo"
            type="number"
            value={position}
            onChange={(ev) => setPosition(ev.target.value)}
            className={`${inputClass} w-20`}
          />
          <button
            type="button"
            onClick={addModule}
            disabled={busy}
            className="rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-black/5 disabled:opacity-60"
          >
            Agregar modulo
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-navy">Clases del curso</h3>
        {lessons.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Sin clases todavia.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {lessons.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-sm text-navy">{l.title}</span>
                <select
                  key={`${l.id}-${l.module_id ?? ""}`}
                  aria-label={`Modulo de ${l.title}`}
                  defaultValue={l.module_id ?? ""}
                  onChange={(ev) => assign(l.id, ev.target.value)}
                  disabled={busy}
                  className={inputClass}
                >
                  <option value="">Sin modulo</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>

      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}