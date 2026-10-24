import { MetadataRoute } from "next";
import { SITE } from "~~/components/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${SITE.url}/sitemap.xml` };
}
