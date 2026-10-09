"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CompleteButton({
  lessonId,
  userId,
  completed,
}: {
  lessonId: string;
  userId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const next = !completed;
    const { error: err } = await createClient()
      .from("lesson_progress")
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed: next,
          progress: next ? 100 : 0,
        },
        { onConflict: "user_id,lesson_id" },
      );
    setBusy(false);
    if (err) {
      setError("No pudimos guardar tu progreso. Intenta de nuevo.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60 ${
          completed
            ? "border border-navy text-navy hover:bg-black/5"
            : "bg-gold text-navy hover:brightness-95"
        }`}
      >
        {completed && <Check size={16} aria-hidden="true" />}
        {busy
          ? "Un momento..."
          : completed
            ? "Completada. Marcar como pendiente"
            : "Marcar como completada"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}