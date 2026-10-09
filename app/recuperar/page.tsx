"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
    });
    setLoading(false);
    if (error) {
      setError("No pudimos enviar el correo. Intenta de nuevo en unos minutos.");
      return;
    }
    setSent(true);
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Recuperar contraseña</h1>
      {sent ? (
        <p role="status" className="mt-6 text-sm font-medium text-emerald-700">
          Si ese correo tiene una cuenta, te enviamos un enlace para crear una
          contraseña nueva. Revisa también la carpeta de spam.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-navy">
            Correo
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-brand">
          Volver a iniciar sesión
        </Link>
      </p>
    </section>
  );
}