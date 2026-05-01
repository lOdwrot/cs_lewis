import { useParams } from "react-router-dom";
import { useStepQuery } from "@/hooks/queries";
import { TextVideoStep } from "./TextVideoStep/TextVideoStep";
import { PodcastStep } from "./PodcastStep/PodcastStep";
import { QuizStep } from "./QuizStep/QuizStep";
import { PageTransition } from "@/components/animations/PageTransition";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";

export function StepRouter() {
  const { id } = useParams<{ id: string }>();
  const { data: step, isLoading: loading, error } = useStepQuery(id!);

  if (loading) {
    return (
      <PageTransition>
        <GatesLoadingSkeleton />
      </PageTransition>
    );
  }

  if (error || !step) {
    return (
      <PageTransition>
        <div
          style={{ textAlign: "center", paddingTop: "6rem", color: "#ba1a1a" }}
        >
          {error?.message ?? "Nie znaleziono kroku"}
        </div>
      </PageTransition>
    );
  }

  if (step.type === "podcast") return <PodcastStep step={step} />;
  if (step.type === "quiz") return <QuizStep step={step} />;
  return <TextVideoStep step={step} />;
}
