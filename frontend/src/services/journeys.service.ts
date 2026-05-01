import { api } from "./api";
import type { Difficulty, Journey, StrapiResponse } from "@/types/strapi";

export async function getJourney(slug: string): Promise<Journey> {
  const res = await api.get<StrapiResponse<Journey[]>>("/journeys", {
    params: {
      "filters[slug][$eq]": slug,
      "populate[image][fields][0]": "url",
      "populate[image][fields][1]": "alternativeText",
      "populate[steps][populate][image][fields][0]": "url",
      "populate[steps][populate][image][fields][1]": "alternativeText",
    },
  });
  if (!res.data.data[0]) throw new Error(`Journey not found: ${slug}`);
  return res.data.data[0];
}

export interface JourneysQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  difficulties?: Difficulty[];
}

export interface JourneysPage {
  data: Journey[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export async function getJourneys(
  query: JourneysQuery = {},
): Promise<JourneysPage> {
  const { page = 1, pageSize = 6, search, difficulties } = query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = {
    "populate[image][fields][0]": "url",
    "populate[image][fields][1]": "alternativeText",
    "populate[steps][fields][0]": "estimatedTime",
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
  };
  if (search) {
    params["filters[title][$containsi]"] = search;
  }
  if (difficulties && difficulties.length > 0) {
    difficulties.forEach((d, i) => {
      params[`filters[difficulty][$in][${i}]`] = d;
    });
  }
  const res = await api.get<StrapiResponse<Journey[]>>("/journeys", { params });
  return {
    data: res.data.data,
    pagination: res.data.meta.pagination!,
  };
}
