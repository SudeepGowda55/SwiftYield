import { MetadataRoute } from "next";
import { NAV, SITE } from "~~/components/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return NAV.map(n => ({ url: `${SITE.url}${n.href === "/" ? "" : n.href}`, lastModified: new Date() }));
}
