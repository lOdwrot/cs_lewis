import { api } from "./api";
import type { TopMenu, StrapiResponse } from "@/types/strapi";

export async function getTopMenu(): Promise<TopMenu> {
  const res = await api.get<StrapiResponse<TopMenu>>("/top-menu", {
    params: {
      "populate[homeImage][fields][0]": "url",
      "populate[homeImage][fields][1]": "alternativeText",
      "populate[homeImage][fields][2]": "formats",
      "populate[navItems][fields][0]": "label",
      "populate[navItems][fields][1]": "hoverText",
      "populate[navItems][fields][2]": "redirect",
    },
  });
  return res.data.data;
}
