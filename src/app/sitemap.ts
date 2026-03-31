import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://agentpulse-woad.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/directory`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  ];
}
