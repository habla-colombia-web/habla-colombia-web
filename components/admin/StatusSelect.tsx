"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StatusSelect({
  table,
  id,
  current,
  options,
}: {
  table: "bookings" | "enrollments";
  id: number | string;
  current: string;
  options: string[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const list = Array.from(new Set([current, ...options]));

  async function change(next: string) {
    const prev = value;
    setValue(next);
    setSaving(true);
    setError(false);
    const { data, error } = await createClient()
      .from(table)
      .update({ status: next })
      .eq("id", id)
      .select("id");
    setSaving(false);
    if (error || !data || data.length === 0) {
      setValue(prev);
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <select
        value={value}
        disabled={saving}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-black/15 bg-white px-2 py-1 text-sm capitalize text-navy disabled:opacity-60"
      >
        {list.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          No se pudo cambiar el estado.
        </p>
      )}
    </div>
  );
}