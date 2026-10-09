"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Home,
  LayoutDashboard,
  Menu,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/admin/profesores", label: "Profesores", icon: GraduationCap },
  { href: "/admin/clases", label: "Clases", icon: Video },
];

function Brand() {
  return (
    <div className="px-5 py-6">
      <p className="text-xl font-bold leading-tight text-white">Habla Colombia</p>
      <p className="text-xs text-white/70">Español real, vida real.</p>
    </div>
  );
}

export default function AdminShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const nav = (
    <nav className="flex flex-col gap-1 px-3" aria-label="Panel de administracion">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const on = isActive(href);
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
          <form
            action="/admin/estudiantes"
            method="get"
            role="search"
            className="relative max-w-xl flex-1"
          >
            <label className="sr-only" htmlFor="admin-search">
              Buscar estudiantes
            </label>
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="admin-search"
              name="q"
              type="search"
              placeholder="Buscar estudiantes, cursos o nombres..."
              className="w-full rounded-xl bg-[#eef4fc] py-2.5 pl-10 pr-3 text-sm text-navy outline-none focus:ring-2 focus:ring-brand/30"
            />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
            >
              {(userName.trim().charAt(0) || "?").toUpperCase()}
            </span>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-navy">{userName}</p>
              <p className="truncate text-xs text-muted">{userEmail}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}