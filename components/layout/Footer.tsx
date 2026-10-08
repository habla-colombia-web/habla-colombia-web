import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:px-6">
        <Logo />
        <p>
          &copy; {new Date().getFullYear()} Habla Colombia. Español real, vida
          real.
        </p>
      </div>
    </footer>
  );
}