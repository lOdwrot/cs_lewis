import { api } from "./api";
import type { JourneysPage, StrapiResponse } from "@/types/strapi";

export async function getJourneysPage(): Promise<JourneysPage> {
  const res = await api.get<StrapiResponse<JourneysPage>>("/journeys-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
      "populate[backgroundImage][fields][2]": "formats",
    },
  });
  return res.data.data;
}
