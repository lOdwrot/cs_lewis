import { api } from "./api";
import type { NewsPage, StrapiResponse } from "@/types/strapi";

export async function getNewsPage(): Promise<NewsPage> {
  const res = await api.get<StrapiResponse<NewsPage>>("/news-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
      "populate[backgroundImage][fields][2]": "formats",
      "populate[news][fields][0]": "title",
      "populate[news][fields][1]": "content",
      "populate[news][fields][2]": "documentId",
    },
  });
  return res.data.data;
}
