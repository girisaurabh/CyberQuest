import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const items = [
  { icon: "⌂", label: "Home", path: "/" },
  { icon: "◈", label: "Journey", path: "/journey" },
  { icon: "◎", label: "Missions", path: "/missions" },
  { icon: "♜", label: "Rewards", path: "/rewards" },
  { icon: "▥", label: "Skills", path: "/skills" },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate("/login", { replace: true }); }
  const name = user?.name || "CyberQuest";
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex w-72 min-h-screen p-4 sticky top-0">
      <div className="w-full min-h-[calc(100vh-2rem)] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 pt-7 pb-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20"><span className="text-xl">🛡️</span></div>
            <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Cyber<span className="text-blue-600">Quest</span></h1><p className="text-[11px] text-slate-400 mt-0.5">Learn • Practice • Level Up</p></div>
          </NavLink>
        </div>
        <div className="px-3">
          <p className="px-3 mb-3 text-[10px] font-semibold tracking-[0.18em] text-slate-400">MAIN MENU</p>
          <nav className="space-y-1.5">{items.map((item) => <NavItem key={item.path} {...item} />)}</nav>
        </div>
        <div className="flex-1" />
        <div className="mx-4 mb-4 p-4 rounded-2xl border border-orange-100 bg-orange-50">
          <p className="text-xs text-slate-500">DAILY STREAK</p>
          <div className="flex items-center justify-between mt-1"><p className="text-lg font-bold text-slate-900">🔥 {user?.streak_days ?? 0} days</p><span className="text-lg">🔥</span></div>
        </div>
        <div className="border-t border-slate-100 p-4">
          <NavLink to="/profile" className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">{initial}</div>
            <div className="flex-1 text-left min-w-0"><p className="text-sm font-semibold truncate text-slate-900">{name}</p><p className="text-xs text-slate-400">Level {user?.level ?? 1} • {user?.xp ?? 0} XP</p></div>
            <span className="text-slate-300">›</span>
          </NavLink>
          <button onClick={handleLogout} className="w-full mt-2 px-3 py-2 text-xs text-slate-400 hover:text-red-600 transition text-left">Sign out</button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, path }) {
  return <NavLink to={path} end={path === "/"} className={({ isActive }) => `group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition ${isActive ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
    {({ isActive }) => <><span className={`text-xl w-6 text-center ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>{icon}</span><span className="text-sm font-medium">{label}</span></>}
  </NavLink>;
}
export default Sidebar;
