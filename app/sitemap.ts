import type { MetadataRoute } from "next";
import { SECTORS } from "@/lib/sectors";
import { appUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: appUrl(""), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: appUrl("/precios"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: appUrl("/legal/terminos"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: appUrl("/legal/privacidad"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: appUrl("/arrepentimiento"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: appUrl("/baja"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const sectorEntries: MetadataRoute.Sitemap = SECTORS.map((sector) => ({
    url: appUrl("/para/" + sector.slug),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...sectorEntries];
}
