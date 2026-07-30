import { ImageResponse } from "next/og";
import { getTripTemplate } from "@/data/trips/templates";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getPublicTripBySlug } from "@/lib/trips/public";

export const alt = "Road trip on RoadPlan Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ publicSlug: string }> };

export default async function TripOpenGraphImage({ params }: Props) {
  const { publicSlug } = await params;
  const template = getTripTemplate(publicSlug);

  let title = template?.title ?? "Road trip";
  let subtitle = template?.tagline ?? template?.description ?? SITE_NAME;
  let cover: string | null = template
    ? `${SITE_URL}${template.coverImage}`
    : null;
  let meta = template
    ? `${template.durationDays} days${
        template.totalDistanceKm
          ? ` · ~${Math.round(template.totalDistanceKm).toLocaleString()} km`
          : ""
      } · ${template.country}`
    : null;

  try {
    const data = await getPublicTripBySlug(publicSlug);
    if (data) {
      title = data.trip.title;
      subtitle = data.trip.description ?? subtitle;
      if (data.trip.coverPhotoUrl) cover = data.trip.coverPhotoUrl;
      meta = `${data.trip.durationDays} days${
        data.trip.totalDistanceKm
          ? ` · ~${Math.round(data.trip.totalDistanceKm).toLocaleString()} km`
          : ""
      }`;
    }
  } catch {
    // fall back to template / defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0F2A24",
          color: "#F7F5F2",
          overflow: "hidden",
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(15,42,36,0.92) 0%, rgba(15,42,36,0.72) 48%, rgba(15,42,36,0.35) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#C4A882",
            }}
          >
            {SITE_NAME}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 780 }}>
            {meta ? (
              <div
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: 22,
                  color: "rgba(247,245,242,0.75)",
                }}
              >
                {meta}
              </div>
            ) : null}
            <div
              style={{
                fontSize: 58,
                fontWeight: 600,
                letterSpacing: -1.2,
                lineHeight: 1.05,
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.35,
                color: "rgba(247,245,242,0.8)",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
              }}
            >
              {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: 20,
              color: "rgba(247,245,242,0.7)",
            }}
          >
            <span>Start planning on RoadPlan Studio</span>
            <span style={{ color: "#C4A882" }}>roadplanstudio.com</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
