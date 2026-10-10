"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReportButton({
  targetType,
  targetId,
  label = "Reportar",
}: {
  targetType: "post" | "comment" | "profile";
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = reason.trim();
    if (text.length < 3 || busy) return;
    setBusy(true);
    setMsg(null);
    const sb = createClient();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) {
      setBusy(false);
      setMsg({ ok: false, text: "Tu sesión expiró. Vuelve a iniciar sesión." });
      return;
    }
    const { error } = await sb.from("community_reports").insert({
      reporter_id: auth.user.id,
      target_type: targetType,
      target_id: targetId,
      reason: text,
    });
    setBusy(false);
    if (error) {
      setMsg({
        ok: false,
        text:
          error.code === "23505"
            ? "Ya reportaste este contenido."
            : "No pudimos enviar el reporte. Intenta de nuevo.",
      });
      return;
    }
    setReason("");
    setOpen(false);
    setMsg({ ok: true, text: "Reporte enviado. Gracias por cuidar la comunidad." });
  }

  if (msg?.ok) {
    return (
      <p role="status" className="text-xs font-medium text-emerald-700">
        {msg.text}
      </p>
    );
  }

  return (
    <div>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-muted hover:text-navy"
        >
          {label}
        </button>
      )}
      {open && (
        <form onSubmit={send} className="space-y-2">
          <label className="block text-xs font-medium text-navy">
            Motivo del reporte
            <textarea
              rows={2}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 px-2 py-1.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || reason.trim().length < 3}
              className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Enviando..." : "Enviar reporte"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {msg && !msg.ok && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {msg.text}
        </p>
      )}
    </div>
  );
}