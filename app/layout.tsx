import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BridgeToBrilliance — Empowering Education for All",
  description: "A nonprofit learning management system bridging the gap to educational brilliance. Access video lessons, live classes, progress tracking, and more.",
  keywords: ["education", "nonprofit", "learning", "LMS", "free education", "online learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
