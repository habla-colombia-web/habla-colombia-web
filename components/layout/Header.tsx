import Link from "next/link";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import SignOutButton from "./SignOutButton";
import { createClient } from "@/lib/supabase/server";

async function getSession(): Promise<{
  userName: string | null;
  isAdmin: boolean;
}> {
  try {
    const sb = await createClient();
    const { data } = await sb.auth.getUser();
    const user = data.user;
    if (!user) return { userName: null, isAdmin: false };
    const meta = user.user_metadata?.full_name;
    const full = typeof meta === "string" ? meta.trim() : "";
    const { data: admin } = await sb.rpc("is_admin");
    return {
      userName: full || user.email || "Mi cuenta",
      isAdmin: admin === true,
    };
  } catch {
    return { userName: null, isAdmin: false };
  }
}

export default async function Header() {
  const { userName, isAdmin } = await getSession();

  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 text-sm font-medium lg:flex"
        >
          <NavLinks className="hover:text-gold" />
          {userName && (
            <Link href="/dashboard" className="text-gold hover:underline">
              Mi panel
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-gold hover:underline">
              Panel
            </Link>
          )}
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
        <MobileMenu userName={userName} isAdmin={isAdmin} />
      </div>
    </header>
  );
}