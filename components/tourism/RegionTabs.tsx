"use client";

import { useMemo, useState } from "react";
import type { Place } from "@/types";
import DestinationCard from "./DestinationCard";
import BookingModal from "@/components/bookings/BookingModal";

export default function RegionTabs({ places }: { places: Place[] }) {
  const regions = useMemo(() => {
    const list: string[] = [];
    for (const p of places) {
      if (!list.includes(p.region)) list.push(p.region);
    }
    return list;
  }, [places]);

  const [current, setCurrent] = useState(regions[0] ?? "");
  const [selected, setSelected] = useState<Place | null>(null);

  if (regions.length === 0) {
    return (
      <p className="mt-8 text-muted">Pronto publicaremos nuevos lugares.</p>
    );
  }

  const visible = places.filter((p) => p.region === current);

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Regiones" className="flex flex-wrap gap-2">
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={r === current}
            onClick={() => setCurrent(r)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              r === current
                ? "bg-navy text-white"
                : "bg-[#eaeefb] text-navy hover:bg-[#dde4f8]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {visible.map((p) => (
          <DestinationCard
            key={p.id}
            place={p}
            onReserve={() => setSelected(p)}
          />
        ))}
      </div>

      {selected && (
        <BookingModal place={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}