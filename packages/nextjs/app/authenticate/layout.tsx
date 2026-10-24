import { Metadata } from "next";
import { OG_IMAGE, SITE } from "~~/components/site";

const title = "Verify";
const description = "Prove you're human with World ID before deploying your SwiftYield flash-loan contract.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/authenticate" },
  openGraph: { title: `${title} · ${SITE.name}`, description, url: "/authenticate", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description, images: [OG_IMAGE.url] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
