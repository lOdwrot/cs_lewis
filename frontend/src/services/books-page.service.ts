import { api } from "./api";
import type { BooksPage, StrapiResponse } from "@/types/strapi";

export async function getBooksPage(): Promise<BooksPage> {
  const res = await api.get<StrapiResponse<BooksPage>>("/books-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
    },
  });
  return res.data.data;
}
