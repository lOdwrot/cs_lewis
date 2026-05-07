import { api } from "./api";
import type {
  EncyclopediaPage,
  StrapiResponse,
  Term,
} from "@/types/strapi";

export async function getEncyclopediaPage(): Promise<EncyclopediaPage> {
  const res = await api.get<StrapiResponse<EncyclopediaPage>>(
    "/encyclopedia-page",
    {
      params: {
        "populate[backgroundImage][fields][0]": "url",
        "populate[backgroundImage][fields][1]": "alternativeText",
      },
    },
  );
  return res.data.data;
}

export interface TermsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface TermsPage {
  data: Term[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export async function getTerms(query: TermsQuery = {}): Promise<TermsPage> {
  const { page = 1, pageSize = 20, search } = query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = {
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
    "sort[0]": "name:asc",
  };
  if (search && search.trim()) {
    params["filters[name][$containsi]"] = search.trim();
  }
  const res = await api.get<StrapiResponse<Term[]>>("/terms", { params });
  return {
    data: res.data.data,
    pagination: res.data.meta.pagination!,
  };
}
