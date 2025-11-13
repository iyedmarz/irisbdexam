import type { Metadata } from "next";
import "./../";

export const metadata: Metadata = {
  title: "IRIS Exam Platform",
  description:
    "Online examination system for higher education (Bac+2 to Bac+5)",
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
