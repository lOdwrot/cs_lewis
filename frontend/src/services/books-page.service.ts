import { api } from "./api";
import type { BooksPage, StrapiResponse } from "@/types/strapi";

export async function getBooksPage(): Promise<BooksPage> {
  const res = await api.get<StrapiResponse<BooksPage>>("/books-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
      "populate[backgroundImage][fields][2]": "formats",
    },
  });
  return res.data.data;
}
