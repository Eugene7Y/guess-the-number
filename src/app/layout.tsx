import type { Metadata, Viewport } from "next";
import "./globals.css";
import { THEME_BOOTSTRAP } from "@/lib/theme";
import { I18nProvider } from "@/components/I18nProvider";

export const metadata: Metadata = {
  title: "Guess the Number",
  description:
    "A real-time number-guessing game. Play solo against the system or head-to-head with a friend on two phones.",
  applicationName: "Guess the Number",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Guess the Number",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b1020",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <I18nProvider>
          <div className="app-shell">{children}</div>
        </I18nProvider>
      </body>
    </html>
  );
}
