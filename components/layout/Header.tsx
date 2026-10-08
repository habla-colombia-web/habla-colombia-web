import Link from "next/link";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

export default function Header() {
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
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}