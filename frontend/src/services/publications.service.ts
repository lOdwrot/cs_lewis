import { api } from "./api";
import type { Publication, PublicationsPage, StrapiResponse } from "@/types/strapi";

export async function getPublicationsPage(): Promise<PublicationsPage> {
  const res = await api.get<StrapiResponse<PublicationsPage>>(
    "/publications-page",
  );
  return res.data.data;
}

export interface PublicationsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PublicationsPageResult {
  data: Publication[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export async function getPublications(
  query: PublicationsQuery = {},
): Promise<PublicationsPageResult> {
  const { page = 1, pageSize = 12, search } = query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = {
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
    "sort[0]": "publicationYear:asc",
    "populate[image][fields][0]": "url",
    "populate[image][fields][1]": "alternativeText",
    "populate[image][fields][2]": "formats",
  };
  if (search && search.trim()) {
    params["filters[title][$containsi]"] = search.trim();
  }
  const res = await api.get<StrapiResponse<Publication[]>>("/publications", {
    params,
  });
  return {
    data: res.data.data,
    pagination: res.data.meta.pagination!,
  };
}
