import Link from "next/link";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import SignOutButton from "./SignOutButton";
import { createClient } from "@/lib/supabase/server";

async function getUserName(): Promise<string | null> {
  try {
    const sb = await createClient();
    const { data } = await sb.auth.getUser();
    const user = data.user;
    if (!user) return null;
    const meta = user.user_metadata?.full_name;
    const full = typeof meta === "string" ? meta.trim() : "";
    return full || user.email || "Mi cuenta";
  } catch {
    return null;
  }
}

export default async function Header() {
  const userName = await getUserName();

  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 text-sm font-medium lg:flex"
        >
          <NavLinks className="hover:text-gold" />
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {userName ? (
            <>
              <span className="max-w-40 truncate text-sm font-medium">
                Hola, {userName}
              </span>
              <SignOutButton className="rounded-full border border-white/70 px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-60" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/70 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95"
              >
                Únete ahora
              </Link>
            </>
          )}
        </div>
        <MobileMenu userName={userName} />
      </div>
    </header>
  );
}