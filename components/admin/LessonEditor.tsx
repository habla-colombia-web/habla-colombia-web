"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fromBogotaInput, safeHttps } from "@/lib/lessons";

export type LessonValues = {
  course_id: string;
  kind: "grabada" | "en_vivo";
  title: string;
  description: string;
  video_url: string;
  meeting_url: string;
  material_url: string;
  starts_at: string;
  teacher_id: string;
  sort: string;
  is_published: boolean;
};

type Option = { id: string; label: string };

const EMPTY: LessonValues = {
  course_id: "",
  kind: "en_vivo",
  title: "",
  description: "",
  video_url: "",
  meeting_url: "",
  material_url: "",
  starts_at: "",
  teacher_id: "",
  sort: "0",
  is_published: true,
};

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function LessonEditor({
  id,
  courses,
  teachers,
  values,
}: {
  id?: string;
  courses: Option[];
  teachers: Option[];
  values?: LessonValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState<LessonValues>(
    values ?? { ...EMPTY, course_id: courses[0]?.id ?? "" },
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function set<K extends keyof LessonValues>(key: K, value: LessonValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function fail(text: string) {
    setMsg({ ok: false, text });
  }

  async function save() {
    setMsg(null);
    const title = form.title.trim();
    if (!form.course_id) return fail("Elige el curso.");
    if (!title) return fail("Falta el titulo.");
    const sort = Number(form.sort);
    if (form.sort.trim() === "" || Number.isNaN(sort)) {
      return fail("El orden debe ser un numero.");
    }

    const video = form.video_url.trim();
    const meeting = form.meeting_url.trim();
    const material = form.material_url.trim();
    if (video && !safeHttps(video)) return fail("El enlace del video debe empezar por https://");
    if (meeting && !safeHttps(meeting)) return fail("El enlace de la clase debe empezar por https://");
    if (material && !safeHttps(material)) return fail("El enlace del material debe empezar por https://");

    let startsAt: string | null = null;
    if (form.kind === "en_vivo") {
      startsAt = fromBogotaInput(form.starts_at);
      if (!startsAt) return fail("Elige la fecha y hora de la clase en vivo.");
      if (!meeting) return fail("Falta el enlace de Zoom o Meet.");
    } else if (!video) {
      return fail("Falta el enlace del video (YouTube o Vimeo).");
    }

    const payload = {
      course_id: form.course_id,
      kind: form.kind,
      title,
      description: form.description.trim() || null,
      video_url: video || null,
      meeting_url: meeting || null,
      material_url: material || null,
      starts_at: startsAt,
      teacher_id: form.teacher_id || null,
      sort,
      is_published: form.is_published,
    };

    setBusy(true);
    const sb = createClient();
    if (id) {
      const { data, error } = await sb
        .from("lessons")
        .update(payload)
        .eq("id", id)
        .select("id");
      setBusy(false);
      if (error || !data || data.length === 0) return fail("No se pudo guardar.");
      setMsg({ ok: true, text: "Guardado." });
    } else {
      const { error } = await sb.from("lessons").insert(payload);
      setBusy(false);
      if (error) return fail("No se pudo agregar la clase.");
      setForm((f) => ({
        ...EMPTY,
        course_id: f.course_id,
        kind: f.kind,
      }));
      setMsg({ ok: true, text: "Clase agregada." });
    }
    router.refresh();
  }

  async function remove() {
    if (!id) return;
    if (!window.confirm("Eliminar esta clase? No se puede deshacer.")) return;
    setBusy(true);
    const { data, error } = await createClient()
      .from("lessons")
      .delete()
      .eq("id", id)
      .select("id");
    setBusy(false);
    if (error || !data || data.length === 0) return fail("No se pudo eliminar.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy">
          Curso
          <select
            value={form.course_id}
            onChange={(e) => set("course_id", e.target.value)}
            className={inputClass}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-navy">
          Tipo de clase
          <select
            value={form.kind}
            onChange={(e) => set("kind", e.target.value as LessonValues["kind"])}
            className={inputClass}
          >
            <option value="en_vivo">En vivo (Zoom o Meet)</option>
            <option value="grabada">Grabada (video)</option>
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-navy">
        Titulo
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-navy">
        Descripcion (opcional)
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </label>

      {form.kind === "en_vivo" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-navy">
            Fecha y hora (hora de Colombia)
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-navy">
            Enlace de Zoom o Meet
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={form.meeting_url}
              onChange={(e) => set("meeting_url", e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      )}

      <label className="block text-sm font-medium text-navy">
        {form.kind === "grabada"
          ? "Enlace del video (YouTube o Vimeo)"
          : "Enlace de la grabacion (opcional, para despues de la clase)"}
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.video_url}
          onChange={(e) => set("video_url", e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-navy">
        Enlace del material de apoyo (opcional, PDF o Drive)
        <input
          type="url"
          placeholder="https://drive.google.com/..."
          value={form.material_url}
          onChange={(e) => set("material_url", e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="flex flex-wrap items-end gap-6">
        <label className="block text-sm font-medium text-navy">
          Profesor
          <select
            value={form.teacher_id}
            onChange={(e) => set("teacher_id", e.target.value)}
            className={inputClass}
          >
            <option value="">Sin profesor</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-navy">
          Orden
          <input
            type="number"
            value={form.sort}
            onChange={(e) => set("sort", e.target.value)}
            className={`${inputClass} w-24`}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-navy">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
          />
          Visible para los inscritos
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
        >
          {busy ? "Un momento..." : id ? "Guardar" : "Agregar clase"}
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