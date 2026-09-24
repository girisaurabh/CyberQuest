import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="min-h-screen flex text-white">

      <Sidebar />

      <main className="flex-1 min-w-0 pb-24 md:pb-0">
        <Dashboard />
      </main>

      <MobileNav />

    </div>
  );
}

export default App;