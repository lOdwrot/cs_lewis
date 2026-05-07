import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getGates, getGate } from '@/services/gates.service'
import { getJourney, getJourneys } from '@/services/journeys.service'
import { getStep } from '@/services/steps.service'
import { getBooks } from '@/services/books.service'
import { getHomePage } from '@/services/home-page.service'
import { getGatePage } from '@/services/gate-page.service'
import { getJourneysPage } from '@/services/journeys-page.service'
import { getBooksPage } from '@/services/books-page.service'
import { getEncyclopediaPage, getTerms } from '@/services/encyclopedia.service'
import {
  getArticle,
  getArticles,
  getLibraryPage,
} from '@/services/library.service'
import type { Difficulty } from '@/types/strapi'

const PAGE_SIZE = 6
const TERMS_PAGE_SIZE = 20
const ARTICLES_PAGE_SIZE = 12

export const useGatesQuery = () =>
  useQuery({ queryKey: ['gates'], queryFn: getGates })

export const useGateQuery = (slug: string) =>
  useQuery({ queryKey: ['gate', slug], queryFn: () => getGate(slug), enabled: !!slug })

export const useJourneyQuery = (slug: string) =>
  useQuery({ queryKey: ['journey', slug], queryFn: () => getJourney(slug), enabled: !!slug })

export const useStepQuery = (id: string) =>
  useQuery({ queryKey: ['step', id], queryFn: () => getStep(id), enabled: !!id })

export const useBooksQuery = () =>
  useQuery({ queryKey: ['books'], queryFn: getBooks })

export const useHomePageQuery = () =>
  useQuery({ queryKey: ['home-page'], queryFn: getHomePage })

export const useGatePageQuery = () =>
  useQuery({ queryKey: ['gate-page'], queryFn: getGatePage })

export const useJourneysPageQuery = () =>
  useQuery({ queryKey: ['journeys-page'], queryFn: getJourneysPage })

export const useBooksPageQuery = () =>
  useQuery({ queryKey: ['books-page'], queryFn: getBooksPage })

export const useJourneysInfiniteQuery = (search: string, difficulties: Difficulty[]) =>
  useInfiniteQuery({
    queryKey: ['journeys', { search, difficulties }],
    queryFn: ({ pageParam }) =>
      getJourneys({ page: pageParam, pageSize: PAGE_SIZE, search, difficulties }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pageCount
        ? lastPage.pagination.page + 1
        : undefined,
  })

export const useEncyclopediaPageQuery = () =>
  useQuery({ queryKey: ['encyclopedia-page'], queryFn: getEncyclopediaPage })

export const useTermsInfiniteQuery = (search: string) =>
  useInfiniteQuery({
    queryKey: ['terms', { search }],
    queryFn: ({ pageParam }) =>
      getTerms({ page: pageParam, pageSize: TERMS_PAGE_SIZE, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pageCount
        ? lastPage.pagination.page + 1
        : undefined,
  })

export const useLibraryPageQuery = () =>
  useQuery({ queryKey: ['library-page'], queryFn: getLibraryPage })

export const useArticlesInfiniteQuery = (search: string) =>
  useInfiniteQuery({
    queryKey: ['articles', { search }],
    queryFn: ({ pageParam }) =>
      getArticles({ page: pageParam, pageSize: ARTICLES_PAGE_SIZE, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pageCount
        ? lastPage.pagination.page + 1
        : undefined,
  })

export const useArticleQuery = (slug: string) =>
  useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
    enabled: !!slug,
  })
