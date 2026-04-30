import axios from 'axios'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL ?? 'http://localhost:1337'

export const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
})

export const strapiImageUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}
