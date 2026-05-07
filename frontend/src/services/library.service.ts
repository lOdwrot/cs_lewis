import { api } from "./api";
import type { Article, LibraryPage, StrapiResponse } from "@/types/strapi";

export async function getLibraryPage(): Promise<LibraryPage> {
  const res = await api.get<StrapiResponse<LibraryPage>>("/library-page", {
    params: {
      "populate[backgroundImage][fields][0]": "url",
      "populate[backgroundImage][fields][1]": "alternativeText",
    },
  });
  return res.data.data;
}

export interface ArticlesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ArticlesPage {
  data: Article[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export async function getArticles(
  query: ArticlesQuery = {},
): Promise<ArticlesPage> {
  const { page = 1, pageSize = 12, search } = query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = {
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
    "sort[0]": "title:asc",
    "fields[0]": "title",
    "fields[1]": "slug",
    "fields[2]": "description",
  };
  if (search && search.trim()) {
    params["filters[title][$containsi]"] = search.trim();
  }
  const res = await api.get<StrapiResponse<Article[]>>("/articles", { params });
  return {
    data: res.data.data,
    pagination: res.data.meta.pagination!,
  };
}

export async function getArticle(slug: string): Promise<Article | null> {
  const res = await api.get<StrapiResponse<Article[]>>("/articles", {
    params: {
      "filters[slug][$eq]": slug,
      "pagination[pageSize]": 1,
    },
  });
  return res.data.data[0] ?? null;
}
