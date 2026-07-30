import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch / home-screen icon. */
export default function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 96 L48 42 L66 74"
            stroke="#C4A882"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M62 96 L88 48 L112 92"
            stroke="#C4A882"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
          <path
            d="M30 112 C 52 96, 40 74, 62 62 C 84 50, 74 32, 98 20"
            stroke="#3FA88C"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M30 112 C 52 96, 40 74, 62 62 C 84 50, 74 32, 98 20"
            stroke="#F7F5F2"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="9 11"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
