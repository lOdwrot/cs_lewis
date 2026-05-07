import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { BreathingBackground } from "@/components/animations/BreathingBackground";
import { HomePage } from "@/features/home/HomePage";
import { GatesPage } from "@/features/gates/GatesPage";
import { GateDetail } from "@/features/gates/GateDetail";
import { JourneyDetail } from "@/features/journeys/JourneyDetail";
import { AllJourneysPage } from "@/features/journeys/AllJourneysPage";
import { StepRouter } from "@/features/steps/StepRouter";
import { BooksPage } from "@/features/books/BooksPage";
import { NotFoundPage } from "@/features/notfound/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/portal" element={<GatesPage />} />
        <Route path="/gate/:slug" element={<GateDetail />} />
        <Route path="/journeys" element={<AllJourneysPage />} />
        <Route path="/journey/:slug" element={<JourneyDetail />} />
        <Route path="/step/:id" element={<StepRouter />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <BreathingBackground />
      <Header />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
