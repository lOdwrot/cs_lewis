import { useParams } from "react-router-dom";
import { useStepQuery } from "@/hooks/queries";
import { TextVideoStep } from "./TextVideoStep/TextVideoStep";
import { PodcastStep } from "./PodcastStep/PodcastStep";
import { QuizStep } from "./QuizStep/QuizStep";
import { PageLoading } from "@/components/ui/PageLoading";
import { PageError } from "@/components/ui/PageError";

export function StepRouter() {
  const { id } = useParams<{ id: string }>();
  const { data: step, isLoading: loading, error, refetch } = useStepQuery(id!);

  if (loading) return <PageLoading />;
  if (error || !step) return <PageError onRefresh={() => refetch()} />;

  if (step.type === "podcast") return <PodcastStep step={step} />;
  if (step.type === "quiz") return <QuizStep step={step} />;
  return <TextVideoStep step={step} />;
}
