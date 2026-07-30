import Image from "next/image";
import Link from "next/link";
import type { TripTemplate } from "@/data/trips/templates";
import { localizedPath, type Locale } from "@/lib/i18n/config";

export function TripTemplateCard({
  trip,
  locale = "en",
}: {
  trip: TripTemplate;
  locale?: Locale;
}) {
  return (
    <Link
      href={localizedPath(locale, `/trips/${trip.slug}`)}
      className="group block overflow-hidden border-t border-border pt-5 transition hover:border-primary"
    >
      <div className="relative mb-4 aspect-[16/10] overflow-hidden">
        <Image
          src={trip.coverImage}
          alt={trip.coverAlt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <p className="text-sm tracking-widest text-muted-foreground uppercase">
        {trip.country} · {trip.durationDays} days
        {trip.totalDistanceKm
          ? ` · ~${Math.round(trip.totalDistanceKm).toLocaleString()} km`
          : ""}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold group-hover:text-primary">
        {trip.title}
      </h2>
      <p className="mt-2 line-clamp-3 text-base text-muted-foreground">
        {trip.tagline}
      </p>
    </Link>
  );
}
