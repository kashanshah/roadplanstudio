import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trip invite",
  robots: { index: false, follow: false },
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
