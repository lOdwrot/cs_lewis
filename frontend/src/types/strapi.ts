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
  audioUrl: string | null;
  audioFile: StrapiImage | null;
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
  difficulty?: Difficulty;
  tags?: string[];
  steps?: Step[];
}

export type StepType = "text" | "podcast" | "quiz";

export type Difficulty = "easy" | "medium" | "hard";

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

export interface HomePage {
  id: number;
  documentId: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  backgroundImage: StrapiImage | null;
  ctaLabel: string | null;
  newsButtonLabel: string | null;
  gatesSectionTitle: string | null;
  newsSectionTitle: string | null;
  gates: Gate[];
  news: News[];
}

export interface News {
  id: number;
  documentId: string;
  title: string;
  content: string;
}

export interface Term {
  id: number;
  documentId: string;
  name: string;
  description: string;
}

export interface EncyclopediaPage {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  backgroundImage: StrapiImage | null;
}

export interface GatePage {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  dividerText: string | null;
  backgroundImage: StrapiImage | null;
  gates: Gate[];
}

export interface JourneysPage {
  id: number;
  documentId: string;
  title: string;
  seoDescription: string | null;
  heroLabel: string | null;
  heroDescription: string | null;
  searchPlaceholder: string | null;
  filterLabel: string | null;
  easyLabel: string | null;
  mediumLabel: string | null;
  hardLabel: string | null;
  clearFiltersLabel: string | null;
  emptyMessage: string | null;
  endMessage: string | null;
  backgroundImage: StrapiImage | null;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
}

export interface LibraryPage {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  backgroundImage: StrapiImage | null;
}

export interface BooksPage {
  id: number;
  documentId: string;
  title: string;
  seoDescription: string | null;
  heroLabel: string | null;
  heroDescription: string | null;
  buyLabel: string | null;
  motto: string | null;
  backgroundImage: StrapiImage | null;
}
