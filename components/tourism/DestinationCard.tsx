import type { Place } from "@/types";

const GRADIENTS: Record<string, string> = {
  "Eje Cafetero": "linear-gradient(135deg,#2f7d4f,#c9d86a)",
  "Medellín": "linear-gradient(135deg,#d9622b,#f2c14e)",
  "Costa Pacífica": "linear-gradient(135deg,#0b6e7a,#8fd3c1)",
  "Bogotá": "linear-gradient(135deg,#4a4f8a,#c7a1d8)",
  "Cartagena": "linear-gradient(135deg,#e0872b,#3fb5c9)",
};
const FALLBACK = "linear-gradient(135deg,#2f5bea,#0a1f44)";

export default function DestinationCard({
  place,
  onReserve,
}: {
  place: Place;
  onReserve: () => void;
}) {
  const background = place.image_url
    ? `url(${place.image_url})`
    : (GRADIENTS[place.region] ?? FALLBACK);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div
        className="h-36 bg-cover bg-center"
        style={{ backgroundImage: background }}
        role="img"
        aria-label={place.name}
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-navy">{place.name}</h3>
        {place.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {place.description}
          </p>
        )}
        {place.meta && (
          <span className="mt-3 text-xs font-semibold text-brand">
            {place.meta}
          </span>
        )}
        <button
          type="button"
          onClick={onReserve}
          className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95"
        >
          Reservar recorrido
        </button>
      </div>
    </article>
  );
}