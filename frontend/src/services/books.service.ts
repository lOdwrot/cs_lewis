import { api } from './api'
import type { Book, StrapiResponse } from '@/types/strapi'

export async function getBooks(): Promise<Book[]> {
  const res = await api.get<StrapiResponse<Book[]>>('/books', {
    params: { populate: 'image', sort: 'createdAt:asc' },
  })
  return res.data.data
}
