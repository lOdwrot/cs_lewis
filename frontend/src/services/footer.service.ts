import { api } from "./api";
import type { Footer, StrapiResponse } from "@/types/strapi";

export async function getFooter(): Promise<Footer> {
  const res = await api.get<StrapiResponse<Footer>>("/footer", {
    params: {
      "populate[socialLinks][populate][image][fields][0]": "url",
      "populate[socialLinks][populate][image][fields][1]": "alternativeText",
      "populate[socialLinks][populate][image][fields][2]": "formats",
      "populate[image][fields][0]": "url",
      "populate[image][fields][1]": "alternativeText",
      "populate[image][fields][2]": "formats",
    },
  });
  return res.data.data;
}
