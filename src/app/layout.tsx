import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loophole Online — Test-Taking Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
