import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { GatesPage } from '@/features/gates/GatesPage'
import { GateDetail } from '@/features/gates/GateDetail'
import { JourneyDetail } from '@/features/journeys/JourneyDetail'
import { StepRouter } from '@/features/steps/StepRouter'
import { BooksPage } from '@/features/books/BooksPage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<GatesPage />} />
        <Route path="/gate/:slug" element={<GateDetail />} />
        <Route path="/journey/:slug" element={<JourneyDetail />} />
        <Route path="/step/:id" element={<StepRouter />} />
        <Route path="/books" element={<BooksPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
