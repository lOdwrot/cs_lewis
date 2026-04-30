import { api } from './api'
import type { Journey, StrapiResponse } from '@/types/strapi'

export async function getJourney(slug: string): Promise<Journey> {
  const res = await api.get<StrapiResponse<Journey[]>>('/journeys', {
    params: {
      'filters[slug][$eq]': slug,
      'populate[image][fields][0]': 'url',
      'populate[image][fields][1]': 'alternativeText',
      'populate[steps][populate][image][fields][0]': 'url',
      'populate[steps][populate][image][fields][1]': 'alternativeText',
    },
  })
  if (!res.data.data[0]) throw new Error(`Journey not found: ${slug}`)
  return res.data.data[0]
}
