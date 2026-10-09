"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StartCourse({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    const { error: err } = await createClient()
      .from("enrollments")
      .insert({ course_id: courseId });
    if (err && err.code !== "23505") {
      setBusy(false);
      setError("No pudimos inscribirte. Intenta de nuevo.");
      return;
    }
    router.push(`/curso/${courseId}`);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className="rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95 disabled:opacity-60"
      >
        {busy ? "Un momento..." : "Comenzar gratis"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}