"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "done" | "exists" | "error" | "nosession";

export default function EnrollButton({ courseId }: { courseId: string }) {
  const [state, setState] = useState<State>("idle");

  async function enroll() {
    setState("loading");
    const sb = createClient();
    const { data } = await sb.auth.getUser();
    if (!data.user) {
      setState("nosession");
      return;
    }
    const { error } = await sb.from("enrollments").insert({ course_id: courseId });
    if (!error) {
      setState("done");
    } else if (error.code === "23505") {
      setState("exists");
    } else {
      setState("error");
    }
  }

  if (state === "nosession") {
    return (
      <p className="mt-4 text-xs text-muted">
        Necesitas una cuenta para inscribirte.{" "}
        <Link href="/login" className="font-semibold text-brand">
          Inicia sesión
        </Link>{" "}
        o{" "}
        <Link href="/registro" className="font-semibold text-brand">
          regístrate
        </Link>
        .
      </p>
    );
  }

  if (state === "done" || state === "exists") {
    return (
      <p role="status" className="mt-4 text-xs font-semibold text-emerald-700">
        {state === "done" ? "Inscripción lista. " : "Ya estás inscrito. "}
        <Link href="/mis-reservas" className="underline">
          Ver mis cursos
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={enroll}
        disabled={state === "loading"}
        className="w-full rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
      >
        {state === "loading" ? "Un momento..." : "Inscribirme"}
      </button>
      {state === "error" && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          No pudimos inscribirte. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}