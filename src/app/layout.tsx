import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";

export const metadata: Metadata = {
  title: "AIgneous - Your Curiosity Engine",
  description: "Transform questions into understanding in 10 seconds. Micro-learning that turns daily curiosity into lasting knowledge.",
};

// Google Analytics 4 Configuration
// IMPORTANT: For production, change debug_mode to false
const GA_MEASUREMENT_ID = "G-31MRZMK3D5";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_MEASUREMENT_ID}', {
              debug_mode: true,  // Set to false for production
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
