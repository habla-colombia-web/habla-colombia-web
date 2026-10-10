"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Home, Plus, Search, UserCircle } from "lucide-react";
import Feed from "./Feed";
import PostComposer from "./PostComposer";
import ProfileEditor from "./ProfileEditor";
import type { MyProfile } from "@/lib/community";

type View = "inicio" | "mias" | "perfil";

const NAV: { key: View; label: string; icon: typeof Home }[] = [
  { key: "inicio", label: "Inicio de la comunidad", icon: Home },
  { key: "mias", label: "Mis publicaciones", icon: FileText },
  { key: "perfil", label: "Mi perfil", icon: UserCircle },
];

export default function CommunityApp({
  userId,
  initialProfile,
  defaults,
}: {
  userId: string;
  initialProfile: MyProfile | null;
  defaults: { display_name: string; avatar_url: string | null };
}) {
  const [profile, setProfile] = useState<MyProfile | null>(initialProfile);
  const [view, setView] = useState<View>("inicio");
  const [composer, setComposer] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-navy">Comunidad Habla Colombia</h1>
        <p className="mt-2 text-sm text-muted">
          Antes de entrar, crea tu perfil de comunidad. Es lo que verán las demás personas.
        </p>
        <div className="mt-6">
          <ProfileEditor
            mode="create"
            initial={{
              user_id: userId,
              display_name: defaults.display_name,
              avatar_url: defaults.avatar_url,
              country: null,
              native_language: null,
              spanish_level: null,
              interests: null,
              bio: null,
            }}
            onSaved={setProfile}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Comunidad Habla Colombia</h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Conecta con estudiantes de todo el mundo, practica español y descubre la
              cultura colombiana.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setComposer(true)}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus size={16} aria-hidden="true" />
            Crear publicación
          </button>
        </div>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQ(qInput);
            setView((v) => (v === "perfil" ? "inicio" : v));
          }}
          className="relative mt-4 max-w-xl"
        >
          <label className="sr-only" htmlFor="community-search">
            Buscar publicaciones
          </label>
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="community-search"
            type="search"
            value={qInput}
            maxLength={100}
            onChange={(e) => {
              setQInput(e.target.value);
              if (e.target.value === "") setQ("");
            }}
            placeholder="Buscar publicaciones..."
            className="w-full rounded-xl bg-[#eef4fc] py-2.5 pl-10 pr-3 text-sm text-navy outline-none focus:ring-2 focus:ring-brand/30"
          />
        </form>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Comunidad"
          className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-current={view === key ? "page" : undefined}
              onClick={() => setView(key)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                view === key
                  ? "bg-navy text-white"
                  : "bg-white text-navy ring-1 ring-black/5 hover:bg-black/5"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {view === "perfil" ? (
            <div>
              <ProfileEditor mode="edit" initial={profile} onSaved={setProfile} />
              <p className="mt-3 text-sm">
                <Link
                  href={`/dashboard/comunidad/perfil/${userId}`}
                  className="font-semibold text-brand hover:underline"
                >
                  Ver cómo se ve mi perfil público
                </Link>
              </p>
            </div>
          ) : (
            <Feed
              userId={userId}
              mode={view === "mias" ? "mine" : "all"}
              q={q}
              refreshKey={refresh}
            />
          )}
        </div>
      </div>

      {composer && (
        <PostComposer
          userId={userId}
          onClose={() => setComposer(false)}
          onCreated={() => {
            setComposer(false);
            setRefresh((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}