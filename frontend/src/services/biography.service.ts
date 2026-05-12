import { api } from "./api";
import type { BiographyPage, StrapiResponse } from "@/types/strapi";

export async function getBiographyPage(): Promise<BiographyPage> {
  const res = await api.get<StrapiResponse<BiographyPage>>("/biography-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
      "populate[backgroundImage][fields][2]": "formats",
      "populate[events][populate][image][fields][0]": "url",
      "populate[events][populate][image][fields][1]": "alternativeText",
      "populate[events][populate][image][fields][2]": "width",
      "populate[events][populate][image][fields][3]": "height",
      "populate[events][populate][image][fields][4]": "formats",
    },
  });
  return res.data.data;
}
