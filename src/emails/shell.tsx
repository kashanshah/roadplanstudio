import type { ReactNode } from "react";

const BRAND = {
  spruce: "#0F2A24",
  glacier: "#1A6B63",
  sandstone: "#C4A882",
  snow: "#F7F5F2",
  ink: "#0B1210",
  muted: "#5C675F",
  border: "#D9D2C8",
};

type EmailShellProps = {
  previewText: string;
  children: ReactNode;
};

export function EmailShell({ previewText, children }: EmailShellProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RoadPlan Studio</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: BRAND.snow,
          color: BRAND.ink,
          fontFamily:
            "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>
          {previewText}
        </div>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: BRAND.snow, padding: "32px 16px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: 560,
                    backgroundColor: "#ffffff",
                    border: `1px solid ${BRAND.border}`,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          backgroundColor: BRAND.spruce,
                          padding: "20px 28px",
                        }}
                      >
                        <span
                          style={{
                            color: BRAND.snow,
                            fontFamily: "Georgia, serif",
                            fontSize: 20,
                            fontWeight: 600,
                          }}
                        >
                          RoadPlan
                        </span>
                        <span
                          style={{
                            color: BRAND.sandstone,
                            fontSize: 20,
                            marginLeft: 6,
                          }}
                        >
                          Studio
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "28px" }}>{children}</td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "0 28px 28px",
                          color: BRAND.muted,
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        © RoadPlan Studio ·{" "}
                        <a
                          href="https://www.roadplanstudio.com"
                          style={{ color: BRAND.glacier }}
                        >
                          roadplanstudio.com
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: BRAND.glacier,
        color: BRAND.snow,
        textDecoration: "none",
        padding: "12px 20px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {children}
    </a>
  );
}

export { BRAND };
