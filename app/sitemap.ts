import type {MetadataRoute} from "next";import {sectors} from "@/lib/sectors";import {appUrl} from "@/lib/utils";
export default function sitemap():MetadataRoute.Sitemap{return [{url:appUrl("/")},{url:appUrl("/legal/terminos")},{url:appUrl("/legal/privacidad")},{url:appUrl("/arrepentimiento")},{url:appUrl("/baja")},...sectors.map(s=>({url:appUrl("/para/"+s.slug)}))]}
