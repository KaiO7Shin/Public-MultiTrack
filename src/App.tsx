import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { RankingPage } from "@/pages/RankingPage";
import { AthletePage } from "@/pages/AthletePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/course/:raceId" element={<RankingPage />} />
        <Route
          path="/course/:raceId/coureur/:participantId"
          element={<AthletePage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
