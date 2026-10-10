import { safeHttps } from "@/lib/lessons";

export default function Avatar({
  name,
  url,
  size = 40,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const img = safeHttps(url);
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand bg-cover bg-center text-sm font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundImage: img ? `url("${img}")` : undefined,
      }}
    >
      {img ? null : initial}
    </span>
  );
}