import { api } from "./api";
import type { JourneysPage, StrapiResponse } from "@/types/strapi";

export async function getJourneysPage(): Promise<JourneysPage> {
  const res = await api.get<StrapiResponse<JourneysPage>>("/journeys-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
    },
  });
  return res.data.data;
}
