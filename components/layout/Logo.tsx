import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Habla Colombia, ir al inicio"
      className="flex items-center rounded-xl bg-white px-2.5 py-1"
    >
      <Image
        src="/logo.png"
        alt="Habla Colombia, español real, vida real"
        width={360}
        height={132}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );
}