// Strapi v5 response wrappers
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiImage {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

// Content type components (dynamic zone)
export interface TextContent {
  __component: "step.text-content";
  id: number;
  markdown: string;
  videoUrl: string | null;
}

export interface PodcastContent {
  __component: "step.podcast-content";
  id: number;
  audioUrl: string;
  transcript: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizContent {
  __component: "step.quiz-content";
  id: number;
  questions: QuizQuestion[];
}

export type StepContent = TextContent | PodcastContent | QuizContent;

// Content types
export interface Gate {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  image: StrapiImage | null;
  enterButtonLabel: string | null;
  iconCharacter: string | null;
  journeys?: Journey[];
}

export interface Journey {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  image: StrapiImage | null;
  steps?: Step[];
}

export type StepType = "text" | "podcast" | "quiz";

export interface Step {
  id: number;
  documentId: string;
  title: string;
  description: string;
  image: StrapiImage | null;
  type: StepType;
  tags: string[];
  estimatedTime: number | null;
  content: StepContent[];
}

export interface Book {
  id: number;
  documentId: string;
  title: string;
  description: string;
  image: StrapiImage | null;
  redirectUrl: string;
}
