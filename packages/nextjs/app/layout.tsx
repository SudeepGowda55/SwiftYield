import { Hanken_Grotesk, IBM_Plex_Mono, Syne } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { OG_IMAGE, SITE } from "~~/components/site";
import "~~/styles/globals.css";

const display = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body" });
const data = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-data" });

const title = `${SITE.name} · ${SITE.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title, description: SITE.description, url: "/", siteName: SITE.name, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description: SITE.description, images: [OG_IMAGE.url] },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={`${display.variable} ${body.variable} ${data.variable}`}>
      <body>
        <ThemeProvider forcedTheme="light">
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
