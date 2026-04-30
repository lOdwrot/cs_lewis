import { api } from "./api";
import type { Step, StrapiResponse } from "@/types/strapi";

export async function getStep(documentId: string): Promise<Step> {
  const res = await api.get<StrapiResponse<Step>>(`/steps/${documentId}`, {
    params: {
      "populate[image][fields][0]": "url",
      "populate[image][fields][1]": "alternativeText",
      "populate[content][on][step.text-content]": "*",
      "populate[content][on][step.podcast-content][populate][audioFile][fields][0]":
        "url",
      "populate[content][on][step.podcast-content][populate][audioFile][fields][1]":
        "alternativeText",
      "populate[content][on][step.quiz-content]": "*",
    },
  });
  return res.data.data;
}
