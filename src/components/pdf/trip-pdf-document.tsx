/* eslint-disable react/no-unknown-property -- react-pdf uses non-DOM props like bookmark/wrap */
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TripPdfModel, TripPdfDay, TripPdfStop } from "@/lib/pdf/trip-pdf-types";

const colors = {
  spruce: "#1A332F",
  glacier: "#2F6F6A",
  ink: "#0B1210",
  muted: "#667774",
  border: "#E6E1D8",
  sand: "#C4A882",
  snow: "#F7F5F2",
  card: "#FFFFFF",
  accentSoft: "#E8F1F0",
  warn: "#A85B3A",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.ink,
    backgroundColor: colors.snow,
  },
  coverPage: {
    padding: 0,
    backgroundColor: colors.spruce,
    color: colors.snow,
  },
  coverInner: {
    flex: 1,
    padding: 56,
    justifyContent: "flex-end",
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: colors.sand,
    marginBottom: 14,
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 34,
    lineHeight: 1.15,
    color: colors.snow,
    marginBottom: 14,
  },
  coverSub: {
    fontSize: 12,
    lineHeight: 1.5,
    color: "rgba(247,245,242,0.82)",
    maxWidth: 360,
    marginBottom: 28,
  },
  coverMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 36,
  },
  pill: {
    borderWidth: 1,
    borderColor: "rgba(247,245,242,0.28)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 9,
    color: colors.snow,
  },
  coverLinks: {
    gap: 6,
  },
  coverLink: {
    color: colors.sand,
    fontSize: 10,
    textDecoration: "none",
  },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.muted,
  },
  h1: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: colors.spruce,
    marginBottom: 8,
  },
  h2: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: colors.spruce,
    marginBottom: 8,
    marginTop: 4,
  },
  lead: {
    fontSize: 11,
    lineHeight: 1.5,
    color: colors.muted,
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    width: "30%",
    minWidth: 140,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: colors.glacier,
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tocLink: {
    color: colors.ink,
    textDecoration: "none",
    fontSize: 11,
    flexGrow: 1,
  },
  tocMeta: {
    color: colors.muted,
    fontSize: 9,
  },
  dayHeader: {
    backgroundColor: colors.spruce,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  dayHeaderEyebrow: {
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.sand,
    marginBottom: 6,
  },
  dayHeaderTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: colors.snow,
    marginBottom: 6,
  },
  dayHeaderMeta: {
    fontSize: 9,
    color: "rgba(247,245,242,0.78)",
  },
  noteBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  noteLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.glacier,
    marginBottom: 4,
  },
  stopCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  stopTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  stopIndex: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: colors.glacier,
    marginRight: 6,
  },
  stopName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: colors.ink,
    flexGrow: 1,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  stopMeta: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 2,
  },
  stopNotes: {
    fontSize: 9,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 1.4,
  },
  mapsLink: {
    marginTop: 8,
    color: colors.glacier,
    fontSize: 9,
    textDecoration: "none",
  },
  lodgingBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: "#FBF7F1",
    borderRadius: 10,
    padding: 12,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  checkRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 7,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 11,
    height: 11,
    borderWidth: 1,
    borderColor: colors.glacier,
    borderRadius: 2,
    marginTop: 1,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  tipBullet: {
    color: colors.sand,
    fontFamily: "Helvetica-Bold",
  },
  twoCol: {
    flexDirection: "row",
    gap: 14,
  },
  col: {
    flex: 1,
  },
});

function formatDuration(mins: number) {
  if (mins <= 0) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function statusStyle(status: string) {
  switch (status) {
    case "visited":
      return { backgroundColor: "#D7EDE9", color: colors.glacier };
    case "favorite":
      return { backgroundColor: "#F3E7D4", color: "#7A5F3A" };
    case "skipped":
    case "cancelled":
      return { backgroundColor: "#F3E2DA", color: colors.warn };
    default:
      return { backgroundColor: colors.accentSoft, color: colors.glacier };
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "visited":
      return "Visited";
    case "favorite":
      return "Favorite";
    case "skipped":
      return "Skipped";
    case "cancelled":
      return "Cancelled";
    default:
      return "To visit";
  }
}

function typeLabel(type: string) {
  if (type === "hotel") return "Lodging";
  if (type === "attraction") return "Attraction";
  return "Stop";
}

function PageFooter({
  title,
  pageLabel,
}: {
  title: string;
  pageLabel?: string;
}) {
  return (
    <View style={styles.footer} fixed>
      <Text>RoadPlan Studio · {title}</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          pageLabel ?? `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

function CoverPage({ model }: { model: TripPdfModel }) {
  return (
    <Page size="A4" style={styles.coverPage} bookmark="Cover">
      <View style={styles.coverInner}>
        <Text style={styles.eyebrow}>RoadPlan Studio · Trip dossier</Text>
        <Text style={styles.coverTitle}>{model.title}</Text>
        {model.description ? (
          <Text style={styles.coverSub}>{model.description}</Text>
        ) : (
          <Text style={styles.coverSub}>
            Interactive road-trip itinerary with day-by-day stops, lodging,
            maps links, packing checklist and field tips.
          </Text>
        )}
        <View style={styles.coverMetaRow}>
          <Text style={styles.pill}>{model.durationDays} days</Text>
          <Text style={styles.pill}>{model.totalStops} stops</Text>
          {model.totalDistanceKm != null ? (
            <Text style={styles.pill}>
              ~{Math.round(model.totalDistanceKm).toLocaleString()} km
            </Text>
          ) : null}
          {model.difficulty ? (
            <Text style={styles.pill}>{model.difficulty}</Text>
          ) : null}
        </View>
        <View style={styles.coverLinks}>
          {model.startLabel || model.endLabel ? (
            <Text style={{ color: "rgba(247,245,242,0.8)", marginBottom: 8 }}>
              {[model.startLabel, model.endLabel].filter(Boolean).join(" → ")}
            </Text>
          ) : null}
          {model.plannerUrl ? (
            <Link src={model.plannerUrl} style={styles.coverLink}>
              Open live itinerary in RoadPlan Studio →
            </Link>
          ) : null}
          <Link src={model.siteUrl} style={styles.coverLink}>
            {model.siteUrl.replace(/^https?:\/\//, "")}
          </Link>
          <Text style={{ color: "rgba(247,245,242,0.55)", marginTop: 10, fontSize: 8 }}>
            Exported {model.exportedAt.slice(0, 10)} · Tap blue links throughout
            this PDF to open maps and destinations
          </Text>
        </View>
      </View>
    </Page>
  );
}

function OverviewPage({ model }: { model: TripPdfModel }) {
  return (
    <Page size="A4" style={styles.page} bookmark="Overview & contents">
      <Text style={styles.h1}>Overview</Text>
      <Text style={styles.lead}>
        Use the table of contents to jump to any day. Each stop includes a
        Google Maps link when location data is available — ideal for offline
        printing plus on-phone navigation.
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{model.durationDays} days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Stops</Text>
          <Text style={styles.statValue}>{model.totalStops}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>On-site time</Text>
          <Text style={styles.statValue}>
            {formatDuration(model.totalPlannedMins)}
          </Text>
        </View>
        {model.totalDistanceKm != null ? (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              ~{Math.round(model.totalDistanceKm).toLocaleString()} km
            </Text>
          </View>
        ) : null}
        {model.difficulty ? (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={styles.statValue}>{model.difficulty}</Text>
          </View>
        ) : null}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Lodging nights</Text>
          <Text style={styles.statValue}>{model.accommodations.length}</Text>
        </View>
      </View>

      <Text style={styles.h2}>Contents</Text>
      {model.days.map((day) => (
        <View key={day.id} style={styles.tocItem} wrap={false}>
          <Link src={`#day-${day.dayNumber}`} style={styles.tocLink}>
            Day {day.dayNumber} — {day.title}
          </Link>
          <Text style={styles.tocMeta}>
            {day.stopCount} stops
            {day.plannedMins > 0 ? ` · ${formatDuration(day.plannedMins)}` : ""}
          </Text>
        </View>
      ))}
      <View style={styles.tocItem} wrap={false}>
        <Link src="#lodging" style={styles.tocLink}>
          Lodging index
        </Link>
        <Text style={styles.tocMeta}>{model.accommodations.length} stays</Text>
      </View>
      <View style={styles.tocItem} wrap={false}>
        <Link src="#packing" style={styles.tocLink}>
          Packing checklist
        </Link>
        <Text style={styles.tocMeta}>{model.packingChecklist.length} items</Text>
      </View>
      <View style={styles.tocItem} wrap={false}>
        <Link src="#tips" style={styles.tocLink}>
          Field tips
        </Link>
        <Text style={styles.tocMeta}>Quick reference</Text>
      </View>

      <PageFooter title={model.title} />
    </Page>
  );
}

function StopCard({ stop }: { stop: TripPdfStop }) {
  const badge = statusStyle(stop.status);
  return (
    <View style={styles.stopCard} wrap={false}>
      <View style={styles.stopTop}>
        <View style={{ flexDirection: "row", flexGrow: 1, paddingRight: 8 }}>
          <Text style={styles.stopIndex}>{String(stop.index).padStart(2, "0")}</Text>
          <Text style={styles.stopName}>{stop.name}</Text>
        </View>
        <Text style={[styles.badge, badge]}>{statusLabel(stop.status)}</Text>
      </View>
      <Text style={styles.stopMeta}>
        {typeLabel(stop.type)}
        {stop.durationMins ? ` · stay ${formatDuration(stop.durationMins)}` : ""}
        {` · travel next: ${stop.travelMode}`}
      </Text>
      {stop.address ? <Text style={styles.stopMeta}>{stop.address}</Text> : null}
      {stop.latitude != null && stop.longitude != null ? (
        <Text style={styles.stopMeta}>
          {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
        </Text>
      ) : null}
      {stop.notes ? <Text style={styles.stopNotes}>{stop.notes}</Text> : null}
      {stop.mapsUrl ? (
        <Link src={stop.mapsUrl} style={styles.mapsLink}>
          Open in Google Maps →
        </Link>
      ) : null}
    </View>
  );
}

function DayPage({ day, tripTitle }: { day: TripPdfDay; tripTitle: string }) {
  return (
    <Page
      size="A4"
      style={styles.page}
      bookmark={`Day ${day.dayNumber}: ${day.title}`}
      id={`day-${day.dayNumber}`}
    >
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderEyebrow}>
          Day {day.dayNumber}
          {day.date ? ` · ${day.date}` : ""}
        </Text>
        <Text style={styles.dayHeaderTitle}>{day.title}</Text>
        <Text style={styles.dayHeaderMeta}>
          {day.stopCount} stops
          {day.plannedMins > 0 ? ` · ${formatDuration(day.plannedMins)} on-site` : ""}
          {day.routeSummary ? ` · ${day.routeSummary}` : ""}
        </Text>
      </View>

      {day.notes ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Day notes</Text>
          <Text>{day.notes}</Text>
        </View>
      ) : null}

      {day.stops.length === 0 ? (
        <Text style={styles.lead}>No stops planned for this day yet.</Text>
      ) : (
        day.stops.map((stop) => <StopCard key={stop.id} stop={stop} />)
      )}

      {day.lodging ? (
        <View style={styles.lodgingBox} wrap={false}>
          <Text style={styles.noteLabel}>Overnight</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
            {day.lodging.name}
            {day.lodging.confirmed ? " · Confirmed" : ""}
          </Text>
          {day.lodging.address ? (
            <Text style={styles.stopMeta}>{day.lodging.address}</Text>
          ) : null}
          {(day.lodging.checkInDate || day.lodging.checkOutDate) && (
            <Text style={styles.stopMeta}>
              {[
                day.lodging.checkInDate
                  ? `Check-in ${day.lodging.checkInDate}`
                  : null,
                day.lodging.checkOutDate
                  ? `Check-out ${day.lodging.checkOutDate}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
          {day.lodging.mapsUrl ? (
            <Link src={day.lodging.mapsUrl} style={styles.mapsLink}>
              Open lodging in Google Maps →
            </Link>
          ) : null}
        </View>
      ) : null}

      <View style={{ marginTop: 16 }}>
        <Link src="#packing" style={styles.mapsLink}>
          Jump to packing checklist →
        </Link>
      </View>

      <PageFooter title={tripTitle} />
    </Page>
  );
}

function ReferencePages({ model }: { model: TripPdfModel }) {
  return (
    <Page size="A4" style={styles.page} bookmark="Lodging, packing & tips">
      <Text style={styles.h1} id="lodging">
        Lodging index
      </Text>
      <Text style={styles.lead}>
        All overnight stays across the trip. Tap a maps link to navigate on your
        phone while the PDF stays open.
      </Text>
      {model.accommodations.length === 0 ? (
        <Text style={styles.lead}>No lodging entries yet.</Text>
      ) : (
        model.accommodations.map((a, i) => (
          <View key={`${a.name}-${i}`} style={styles.sectionCard} wrap={false}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
              {a.name}
              {a.confirmed ? " · Confirmed" : ""}
            </Text>
            {a.dayTitle ? (
              <Text style={styles.stopMeta}>{a.dayTitle}</Text>
            ) : null}
            {a.address ? <Text style={styles.stopMeta}>{a.address}</Text> : null}
            {(a.checkInDate || a.checkOutDate) && (
              <Text style={styles.stopMeta}>
                {[
                  a.checkInDate ? `In ${a.checkInDate}` : null,
                  a.checkOutDate ? `Out ${a.checkOutDate}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            )}
            {a.mapsUrl ? (
              <Link src={a.mapsUrl} style={styles.mapsLink}>
                Open in Google Maps →
              </Link>
            ) : null}
          </View>
        ))
      )}

      <Text style={[styles.h1, { marginTop: 18 }]} id="packing">
        Packing checklist
      </Text>
      <Text style={styles.lead}>
        Print this page and tick boxes as you pack. Customize in RoadPlan before
        your next export.
      </Text>
      <View style={styles.twoCol}>
        <View style={styles.col}>
          {model.packingChecklist
            .slice(0, Math.ceil(model.packingChecklist.length / 2))
            .map((item) => (
              <View key={item} style={styles.checkRow} wrap={false}>
                <View style={styles.checkbox} />
                <Text style={{ flex: 1 }}>{item}</Text>
              </View>
            ))}
        </View>
        <View style={styles.col}>
          {model.packingChecklist
            .slice(Math.ceil(model.packingChecklist.length / 2))
            .map((item) => (
              <View key={item} style={styles.checkRow} wrap={false}>
                <View style={styles.checkbox} />
                <Text style={{ flex: 1 }}>{item}</Text>
              </View>
            ))}
        </View>
      </View>

      <Text style={[styles.h1, { marginTop: 18 }]} id="tips">
        Field tips
      </Text>
      {model.tips.map((tip) => (
        <View key={tip} style={styles.tipRow} wrap={false}>
          <Text style={styles.tipBullet}>▸</Text>
          <Text style={{ flex: 1, lineHeight: 1.4 }}>{tip}</Text>
        </View>
      ))}

      <View style={[styles.noteBox, { marginTop: 16 }]}>
        <Text style={styles.noteLabel}>Keep planning</Text>
        <Text>
          Remix this itinerary, invite tripmates, and update stop statuses in
          RoadPlan Studio.
        </Text>
        {model.plannerUrl ? (
          <Link src={model.plannerUrl} style={[styles.mapsLink, { marginTop: 6 }]}>
            Return to live planner →
          </Link>
        ) : (
          <Link src={model.siteUrl} style={[styles.mapsLink, { marginTop: 6 }]}>
            Visit {model.siteUrl.replace(/^https?:\/\//, "")} →
          </Link>
        )}
      </View>

      <PageFooter title={model.title} />
    </Page>
  );
}

export function TripPdfDocument({ model }: { model: TripPdfModel }) {
  return (
    <Document
      title={`${model.title} · RoadPlan Studio`}
      author="RoadPlan Studio"
      subject="Interactive road trip itinerary export"
      creator="RoadPlan Studio"
      keywords="road trip, itinerary, RoadPlan Studio"
      language="en"
    >
      <CoverPage model={model} />
      <OverviewPage model={model} />
      {model.days.map((day) => (
        <DayPage key={day.id} day={day} tripTitle={model.title} />
      ))}
      <ReferencePages model={model} />
    </Document>
  );
}
