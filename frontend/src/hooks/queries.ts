import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getGates, getGate } from '@/services/gates.service'
import { getJourney, getJourneys } from '@/services/journeys.service'
import { getStep } from '@/services/steps.service'
import { getBooks } from '@/services/books.service'
import type { Difficulty } from '@/types/strapi'

const PAGE_SIZE = 6

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

export const useJourneysInfiniteQuery = (search: string, difficulty: Difficulty | null) =>
  useInfiniteQuery({
    queryKey: ['journeys', { search, difficulty }],
    queryFn: ({ pageParam }) =>
      getJourneys({ page: pageParam, pageSize: PAGE_SIZE, search, difficulty }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pageCount
        ? lastPage.pagination.page + 1
        : undefined,
  })
