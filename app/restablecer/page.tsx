"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RestablecerPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(
        "No pudimos cambiar la contraseña. El enlace pudo vencer: pide uno nuevo.",
      );
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Nueva contraseña</h1>
      {done ? (
        <div className="mt-6">
          <p role="status" className="text-sm font-medium text-emerald-700">
            Contraseña actualizada.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
          >
            Ir al inicio
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-navy">
            Contraseña nueva
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      )}
    </section>
  );
}