import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuizProgress {
  currentQuestion: number
  answers: Record<number, number>  // questionIndex → answerIndex chosen
  completed: boolean
  score: number
}

interface ProgressState {
  completedSteps: Record<string, boolean>
  quizProgress: Record<string, QuizProgress>
  podcastProgress: Record<string, number>  // stepId → seconds

  markStepComplete: (stepId: string) => void
  isStepComplete: (stepId: string) => boolean

  initQuiz: (quizId: string, totalQuestions: number) => void
  saveQuizAnswer: (quizId: string, questionIndex: number, answerIndex: number) => void
  advanceQuiz: (quizId: string) => void
  markQuizComplete: (quizId: string, score: number) => void
  resetQuiz: (quizId: string) => void
  getQuizProgress: (quizId: string) => QuizProgress | undefined

  savePodcastProgress: (stepId: string, seconds: number) => void
  getPodcastProgress: (stepId: string) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedSteps: {},
      quizProgress: {},
      podcastProgress: {},

      markStepComplete: (stepId) =>
        set((s) => ({ completedSteps: { ...s.completedSteps, [stepId]: true } })),

      isStepComplete: (stepId) => Boolean(get().completedSteps[stepId]),

      initQuiz: (quizId, _totalQuestions) => {
        if (!get().quizProgress[quizId]) {
          set((s) => ({
            quizProgress: {
              ...s.quizProgress,
              [quizId]: { currentQuestion: 0, answers: {}, completed: false, score: 0 },
            },
          }))
        }
      },

      saveQuizAnswer: (quizId, questionIndex, answerIndex) =>
        set((s) => ({
          quizProgress: {
            ...s.quizProgress,
            [quizId]: {
              ...s.quizProgress[quizId],
              answers: { ...s.quizProgress[quizId]?.answers, [questionIndex]: answerIndex },
            },
          },
        })),

      advanceQuiz: (quizId) =>
        set((s) => {
          const q = s.quizProgress[quizId]
          if (!q) return s
          return {
            quizProgress: {
              ...s.quizProgress,
              [quizId]: { ...q, currentQuestion: q.currentQuestion + 1 },
            },
          }
        }),

      markQuizComplete: (quizId, score) =>
        set((s) => ({
          completedSteps: { ...s.completedSteps, [quizId]: true },
          quizProgress: {
            ...s.quizProgress,
            [quizId]: { ...s.quizProgress[quizId], completed: true, score },
          },
        })),

      resetQuiz: (quizId) =>
        set((s) => {
          const next = { ...s.quizProgress }
          delete next[quizId]
          const completed = { ...s.completedSteps }
          delete completed[quizId]
          return { quizProgress: next, completedSteps: completed }
        }),

      getQuizProgress: (quizId) => get().quizProgress[quizId],

      savePodcastProgress: (stepId, seconds) =>
        set((s) => ({ podcastProgress: { ...s.podcastProgress, [stepId]: seconds } })),

      getPodcastProgress: (stepId) => get().podcastProgress[stepId] ?? 0,
    }),
    { name: 'cs-lewis-progress' }
  )
)
