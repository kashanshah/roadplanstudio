import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph / social share card. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(140deg, #0F2A24 0%, #1A4038 48%, #2F6F6A 100%)",
          color: "#F7F5F2",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#0F2A24",
              border: "2px solid rgba(196,168,130,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 96 L48 42 L66 74"
                stroke="#C4A882"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 112 C 52 96, 40 74, 62 62 C 84 50, 74 32, 98 20"
                stroke="#3FA88C"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
              RoadPlan
            </span>
            <span
              style={{
                fontSize: 14,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "rgba(247,245,242,0.65)",
                marginTop: 4,
              }}
            >
              Studio
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              maxWidth: 920,
            }}
          >
            Plan the drive. Feel the route.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "rgba(247,245,242,0.78)",
              maxWidth: 860,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 22,
            color: "rgba(247,245,242,0.7)",
          }}
        >
          <span style={{ color: "#C4A882" }}>www.roadplanstudio.com</span>
          <span>Maps · Days · Tripmates</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
