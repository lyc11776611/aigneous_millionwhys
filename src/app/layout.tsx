import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIgneous - Your AI Learning Companion",
  description: "Turn scattered learning into knowledge maps. Learn deep, learn fast with your AI learning companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
