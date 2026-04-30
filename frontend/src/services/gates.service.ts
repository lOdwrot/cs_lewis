import { api } from './api'
import type { Gate, StrapiResponse } from '@/types/strapi'

export async function getGates(): Promise<Gate[]> {
  const res = await api.get<StrapiResponse<Gate[]>>('/gates', {
    params: { populate: 'image' },
  })
  return res.data.data
}

export async function getGate(slug: string): Promise<Gate> {
  const res = await api.get<StrapiResponse<Gate[]>>('/gates', {
    params: {
      'filters[slug][$eq]': slug,
      'populate[image][fields][0]': 'url',
      'populate[image][fields][1]': 'alternativeText',
      'populate[journeys][populate][image][fields][0]': 'url',
      'populate[journeys][populate][image][fields][1]': 'alternativeText',
      'populate[journeys][populate][steps][fields][0]': 'documentId',
    },
  })
  if (!res.data.data[0]) throw new Error(`Gate not found: ${slug}`)
  return res.data.data[0]
}
