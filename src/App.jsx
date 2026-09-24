import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Dashboard from "./pages/dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex text-white">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journey" element={<PlaceholderPage title="Your Journey" description="Follow the cybersecurity roadmap from foundations to specialization." />} />
            <Route path="/missions" element={<PlaceholderPage title="Missions" description="Complete practical cybersecurity missions and earn XP." />} />
            <Route path="/rewards" element={<PlaceholderPage title="Rewards" description="Track your XP, badges, achievements, and streaks." />} />
            <Route path="/skills" element={<PlaceholderPage title="Skills" description="Build and track your cybersecurity skill profile." />} />
            <Route path="/profile" element={<PlaceholderPage title="Profile" description="Your CyberQuest profile will live here." />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
