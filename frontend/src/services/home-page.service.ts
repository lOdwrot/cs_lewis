import { api } from "./api";
import type { HomePage, StrapiResponse } from "@/types/strapi";

export async function getHomePage(): Promise<HomePage> {
  const res = await api.get<StrapiResponse<HomePage>>("/home-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
      "populate[gates][populate][image][fields][0]": "url",
      "populate[gates][populate][image][fields][1]": "alternativeText",
      "populate[gates][sort]": "order:asc",
    },
  });
  return res.data.data;
}
