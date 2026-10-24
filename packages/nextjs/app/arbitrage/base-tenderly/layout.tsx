import { Metadata } from "next";
import { OG_IMAGE, SITE } from "~~/components/site";

const title = "Deploy";
const description = "Deploy your SwiftYield FlashLoan contract on the Tenderly Base virtual testnet.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/arbitrage/base-tenderly" },
  openGraph: { title: `${title} · ${SITE.name}`, description, url: "/arbitrage/base-tenderly", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description, images: [OG_IMAGE.url] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
