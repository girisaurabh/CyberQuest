import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Dashboard from "./pages/dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import Missions from "./pages/Missions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading CyberQuest...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AppShell() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen flex text-white">
      {!isAuthPage && <Sidebar />}
      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/journey" element={<ProtectedRoute><PlaceholderPage title="Your Journey" description="Follow the cybersecurity roadmap from foundations to specialization." /></ProtectedRoute>} />
          <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><PlaceholderPage title="Rewards" description="Track your XP, badges, achievements, and streaks." /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><PlaceholderPage title="Skills" description="Build and track your cybersecurity skill profile." /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PlaceholderPage title="Profile" description="Your CyberQuest profile will live here." /></ProtectedRoute>} />
          <Route path="/missions/:missionId" element={<ProtectedRoute><PlaceholderPage title="Mission Brief" description="The interactive mission experience is being built next." /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
