import { Archivo, JetBrains_Mono, Unbounded } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { OG_IMAGE, SITE } from "~~/components/site";
import "~~/styles/globals.css";

const display = Unbounded({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Archivo({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

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
    <html suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider forcedTheme="light">
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
