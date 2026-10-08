import Link from "next/link";

export default function RegistroPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-navy">Crea tu cuenta</h1>
      <p className="mt-3 text-muted">
        El registro estará disponible muy pronto.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
      >
        Volver al inicio
      </Link>
    </section>
  );
}