"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import NavLinks from "./NavLinks";
import SignOutButton from "./SignOutButton";

export default function MobileMenu({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-md p-2 hover:bg-white/10"
      >
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-t border-white/10 bg-navy px-4 pb-6 pt-4">
          <nav aria-label="Principal móvil" className="flex flex-col gap-4 text-base font-medium">
            <NavLinks onNavigate={close} />
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {userName ? (
              <>
                <p className="truncate text-center text-sm font-medium">
                  Hola, {userName}
                </p>
                <SignOutButton
                  onDone={close}
                  className="rounded-full border border-white/70 px-4 py-2 text-center text-sm font-medium disabled:opacity-60"
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="rounded-full border border-white/70 px-4 py-2 text-center text-sm font-medium"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={close}
                  className="rounded-full bg-gold px-4 py-2 text-center text-sm font-semibold text-navy"
                >
                  Únete ahora
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}