import axios from "axios";
import type { StrapiImage } from "@/types/strapi";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

export const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
});

export const strapiImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
};

export type ImageSize = "thumbnail" | "small" | "medium" | "large" | "original";

export const getImageVariant = (
  image: StrapiImage | null,
  size: ImageSize = "original",
): string => {
  if (!image) return "";

  const variant = size === "original" ? image.url : image.formats?.[size]?.url;
  if (!variant) return strapiImageUrl(image.url);

  return strapiImageUrl(variant);
};
