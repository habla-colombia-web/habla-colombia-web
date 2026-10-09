"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { LEVELS, SCENARIOS, type Level, type ScenarioKey } from "@/lib/tutor";

type Correction = { original: string; corrected: string; explanation: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  correction?: Correction | null;
};

const ERRORS: Record<string, string> = {
  not_configured: "El tutor aún no está configurado. Intenta más tarde.",
  busy: "El tutor está muy ocupado. Espera unos segundos e intenta de nuevo.",
  unauthorized: "Tu sesión expiró. Vuelve a iniciar sesión.",
};

const chip = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active ? "bg-navy text-white" : "bg-[#eaeefb] text-navy hover:bg-[#dde4f8]"
  }`;

export default function TutorChat() {
  const [scenario, setScenario] = useState<ScenarioKey>("presentarse");
  const [level, setLevel] = useState<Level>("A1");
  const [help, setHelp] = useState<"en" | "es">("en");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: SCENARIOS.presentarse.opener },
  ]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  function pickScenario(k: ScenarioKey) {
    if (k === scenario || sending) return;
    setScenario(k);
    setError(null);
    setMessages([{ role: "assistant", content: SCENARIOS[k].opener }]);
  }

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setText("");
    setSending(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          level,
          help,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== "string") {
        setError(ERRORS[data?.error] ?? "No pudimos contactar al tutor. Intenta de nuevo.");
        return;
      }
      setMessages((prev) => {
        const copy = [...prev];
        // La corrección se muestra debajo del mensaje del estudiante
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === "user") {
            copy[i] = { ...copy[i], correction: data.correction ?? null };
            break;
          }
        }
        return [...copy, { role: "assistant", content: data.reply }];
      });
    } catch {
      setError("No pudimos contactar al tutor. Revisa tu conexión.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Escenario">
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={scenario === k}
            onClick={() => pickScenario(k)}
            className={chip(scenario === k)}
          >
            {SCENARIOS[k].label}
          </button>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm font-medium text-navy">
        Tu nivel
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 flex items-center gap-2 text-sm font-medium text-navy">
        Explicaciones en
        <select
          value={help}
          onChange={(e) => setHelp(e.target.value as "en" | "es")}
          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-3 border-b border-black/5 bg-navy px-5 py-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-navy">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold">Tutor de español colombiano</p>
            <p className="text-xs text-white/70">{SCENARIOS[scenario].label}</p>
          </div>
        </div>

        <div
          className="h-[26rem] space-y-4 overflow-y-auto bg-[#f8fafd] p-4 sm:p-5"
          aria-live="polite"
        >
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand text-white"
                    : "bg-white text-navy shadow-sm ring-1 ring-black/5"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && m.correction && (
                <div className="mt-2 ml-auto max-w-[85%] rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-navy">
                  <p className="font-bold text-amber-800">Corrección · How to say it</p>
                  <p className="mt-1 text-muted line-through">{m.correction.original}</p>
                  <p className="mt-0.5 font-semibold text-emerald-700">
                    {m.correction.corrected}
                  </p>
                  <p className="mt-1.5 leading-relaxed">{m.correction.explanation}</p>
                </div>
              )}
            </div>
          ))}
          {sending && <p className="text-xs text-muted">El tutor está escribiendo...</p>}
          <div ref={endRef} />
        </div>

        {error && (
          <p role="alert" className="border-t border-black/5 px-5 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="flex items-end gap-2 border-t border-black/5 p-3"
        >
          <label className="flex-1">
            <span className="sr-only">Tu mensaje</span>
            <textarea
              rows={2}
              maxLength={600}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Escribe en español (o en English si no sabes cómo decirlo)..."
              className="w-full resize-none rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="flex h-10 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
          >
            <Send size={16} aria-hidden="true" />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}