import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser tab favicon — RoadPlan mark on spruce. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F2A24",
          borderRadius: 8,
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 96 L48 42 L66 74"
            stroke="#C4A882"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M30 112 C 52 96, 40 74, 62 62 C 84 50, 74 32, 98 20"
            stroke="#3FA88C"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M30 112 C 52 96, 40 74, 62 62 C 84 50, 74 32, 98 20"
            stroke="#F7F5F2"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="10 12"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
