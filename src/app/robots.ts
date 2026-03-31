import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ops"] },
    sitemap: "https://agentpulse-woad.vercel.app/sitemap.xml",
  };
}
