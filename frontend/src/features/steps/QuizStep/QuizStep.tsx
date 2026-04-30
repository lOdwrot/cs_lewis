import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/animations/PageTransition'
import { QuizComplete } from './QuizComplete'
import { useProgressStore } from '@/store/progressStore'
import { strapiImageUrl } from '@/services/api'
import type { Step, QuizContent } from '@/types/strapi'
import styles from './QuizStep.module.scss'

interface Props {
  step: Step
}

export function QuizStep({ step }: Props) {
  const quizContent = step.content.find(
    (c): c is QuizContent => c.__component === 'step.quiz-content'
  )
  const questions = quizContent?.questions ?? []
  const quizId = step.documentId

  const { initQuiz, saveQuizAnswer, advanceQuiz, markQuizComplete, resetQuiz, getQuizProgress, isStepComplete } = useProgressStore()

  const completed = isStepComplete(quizId)
  const progress = getQuizProgress(quizId)

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    initQuiz(quizId, questions.length)
  }, [quizId, questions.length, initQuiz])

  const currentIndex = progress?.currentQuestion ?? 0
  const question = questions[currentIndex]

  if (!question || completed) {
    const score = progress?.score ?? 0
    return (
      <PageTransition>
        <main className={styles.page}>
          <Link to={-1 as never} className={styles.backLink}>
            <span className="material-symbols-outlined">arrow_back</span>
            Journey
          </Link>
          <QuizComplete
            quizTitle={step.title}
            score={score}
            total={questions.length}
            onRedo={() => {
              resetQuiz(quizId)
              setSelectedAnswer(null)
              setSubmitted(false)
            }}
          />
        </main>
      </PageTransition>
    )
  }

  const pct = Math.round((currentIndex / questions.length) * 100)
  const isCorrect = selectedAnswer === question.correctIndex

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    saveQuizAnswer(quizId, currentIndex, selectedAnswer)
    setSubmitted(true)
  }

  const handleNext = () => {
    const isLast = currentIndex === questions.length - 1
    if (isLast) {
      // Calculate final score from all answers
      const prog = getQuizProgress(quizId)
      const savedAnswers = { ...(prog?.answers ?? {}), [currentIndex]: selectedAnswer! }
      const score = questions.filter((q, i) => savedAnswers[i] === q.correctIndex).length
      markQuizComplete(quizId, score)
    } else {
      advanceQuiz(quizId)
      setSelectedAnswer(null)
      setSubmitted(false)
    }
  }

  return (
    <PageTransition>
      <main className={styles.page}>
        <Link to={-1 as never} className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          Journey
        </Link>

        {/* Badge */}
        <div className={styles.topBadge}>
          <span className={styles.badge}>
            <span className="material-symbols-outlined">quiz</span>
            Knowledge Quest
          </span>
        </div>

        {/* Progress */}
        <div className={styles.progressWrap}>
          <div className={styles.progressMeta}>
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className={styles.progressPct}>{pct}% Complete</span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={styles.questionArea}>
              <h1 className={styles.questionText}>{question.question}</h1>

              {step.image && (
                <div className={styles.questionImage}>
                  <img
                    src={strapiImageUrl(step.image.url)}
                    alt={step.image.alternativeText ?? step.title}
                  />
                </div>
              )}
            </div>

            {/* Options */}
            <div className={styles.options}>
              {question.options.map((option, idx) => {
                let cls = styles.option
                if (submitted) {
                  if (idx === question.correctIndex) cls = `${styles.option} ${styles.correct}`
                  else if (idx === selectedAnswer && !isCorrect) cls = `${styles.option} ${styles.wrong}`
                  else if (idx === selectedAnswer) cls = `${styles.option} ${styles.selected}`
                } else if (idx === selectedAnswer) {
                  cls = `${styles.option} ${styles.selected}`
                }

                return (
                  <motion.button
                    key={idx}
                    className={cls}
                    onClick={() => { if (!submitted) setSelectedAnswer(idx) }}
                    disabled={submitted}
                    whileHover={!submitted ? { scale: 1.015 } : {}}
                    whileTap={!submitted ? { scale: 0.985 } : {}}
                    animate={
                      submitted && idx === question.correctIndex
                        ? { backgroundColor: 'rgba(34,197,94,0.08)' }
                        : submitted && idx === selectedAnswer && !isCorrect
                        ? { backgroundColor: 'rgba(220,38,38,0.06)' }
                        : {}
                    }
                    transition={{ duration: 0.25 }}
                  >
                    <div className={styles.optionCircle}>
                      {submitted && idx === question.correctIndex && (
                        <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>check</span>
                      )}
                      {submitted && idx === selectedAnswer && !isCorrect && (
                        <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>close</span>
                      )}
                    </div>
                    {option}
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {submitted && question.explanation && (
                <motion.div
                  className={styles.explanation}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {question.explanation}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className={styles.actions}>
              {!submitted ? (
                <>
                  <motion.button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    whileHover={selectedAnswer !== null ? { scale: 1.03 } : {}}
                    whileTap={selectedAnswer !== null ? { scale: 0.97 } : {}}
                  >
                    Submit Answer
                  </motion.button>
                  <button className={styles.skipBtn} onClick={handleNext}>
                    Skip this question
                  </button>
                </>
              ) : (
                <motion.button
                  className={styles.nextBtn}
                  onClick={handleNext}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>arrow_forward</span>
                </motion.button>
              )}
            </div>

            <div className={styles.divider}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>menu_book</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </PageTransition>
  )
}
