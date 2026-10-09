"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "registro";

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const sb = createClient();

    if (isLogin) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError("Correo o contraseña incorrectos.");
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("already")
          ? "Ese correo ya tiene una cuenta."
          : "No pudimos crear la cuenta. Revisa los datos e intenta de nuevo.",
      );
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setInfo("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">
        {isLogin ? "Iniciar sesión" : "Crea tu cuenta"}
      </h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {!isLogin && (
          <label className="block text-sm font-medium text-navy">
            Nombre
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </label>
        )}
        <label className="block text-sm font-medium text-navy">
          Correo
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Un momento..." : isLogin ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      {isLogin && (
        <p className="mt-4 text-center text-sm">
          <Link href="/recuperar" className="font-semibold text-brand">
            Olvidaste tu contraseña?
          </Link>
        </p>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "Aún no tienes cuenta? " : "Ya tienes cuenta? "}
        <Link
          href={isLogin ? "/registro" : "/login"}
          className="font-semibold text-brand"
        >
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>
    </section>
  );
}