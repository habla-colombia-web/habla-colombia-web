"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Globe,
  Home,
  Menu,
  User,
  X,
} from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/profesores", label: "Profesores", icon: GraduationCap },
  { href: "/mis-reservas", label: "Mis reservas", icon: CalendarDays },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
  { href: "/", label: "Sitio web", icon: Globe },
];

function Brand() {
  return (
    <div className="px-5 py-6">
      <p className="text-xl font-bold leading-tight text-white">Habla Colombia</p>
      <p className="text-xs text-white/70">Español real, vida real.</p>
    </div>
  );
}

function Tagline() {
  return (
    <div className="mt-auto px-5 pb-8">
      <p className="text-lg font-semibold leading-snug text-white">
        Aprende español y vive nuevas experiencias en Colombia
      </p>
      <div className="mt-3 h-1 w-24 rounded-full bg-gold" />
    </div>
  );
}

export default function StudentShell({
  userName,
  userEmail,
  avatarUrl,
  signOut,
  children,
}: {
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  signOut: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 px-3" aria-label="Panel del estudiante">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const on = href.startsWith("/dashboard") && pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={on ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
              on ? "bg-brand text-white" : "text-white/85 hover:bg-white/10"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#f4f7fb]">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy lg:flex">
        <Brand />
        {nav}
        <Tagline />
      </aside>

      {open && (
        <div className="fixed inset-0 z-10 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="relative flex h-full w-64 flex-col bg-navy">
            <button
              type="button"
              aria-label="Cerrar menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 text-white"
            >
              <X size={22} aria-hidden="true" />
            </button>
            <Brand />
            {nav}
            <Tagline />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-navy lg:hidden"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                (userName.trim().charAt(0) || "?").toUpperCase()
              )}
            </span>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-navy">{userName}</p>
              <p className="truncate text-xs text-muted">{userEmail}</p>
            </div>
            {signOut}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}