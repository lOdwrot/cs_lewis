import { useParams } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { getStep } from '@/services/steps.service'
import { TextVideoStep } from './TextVideoStep/TextVideoStep'
import { PodcastStep } from './PodcastStep/PodcastStep'
import { QuizStep } from './QuizStep/QuizStep'
import { PageTransition } from '@/components/animations/PageTransition'

export function StepRouter() {
  const { id } = useParams<{ id: string }>()
  const { data: step, loading, error } = useFetch(() => getStep(id!), [id])

  if (loading) {
    return (
      <PageTransition>
        <div style={{ textAlign: 'center', paddingTop: '6rem', color: '#7f7663' }}>Loading…</div>
      </PageTransition>
    )
  }

  if (error || !step) {
    return (
      <PageTransition>
        <div style={{ textAlign: 'center', paddingTop: '6rem', color: '#ba1a1a' }}>
          {error ?? 'Step not found'}
        </div>
      </PageTransition>
    )
  }

  if (step.type === 'podcast') return <PodcastStep step={step} />
  if (step.type === 'quiz') return <QuizStep step={step} />
  return <TextVideoStep step={step} />
}
