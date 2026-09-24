import { NavLink } from "react-router-dom";

function MobileNav() {
  const items = [
    { icon: "⌂", label: "Home", path: "/" },
    { icon: "◈", label: "Journey", path: "/journey" },
    { icon: "◎", label: "Missions", path: "/missions" },
    { icon: "♜", label: "Rewards", path: "/rewards" },
    { icon: "●", label: "Profile", path: "/profile" },
  ];
  return <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
    <div className="h-16 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/60 flex items-center justify-around">
      {items.map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition ${isActive ? "text-blue-600 bg-blue-50" : "text-slate-400"}`}><span className="text-lg">{item.icon}</span><span className="text-[10px] font-medium">{item.label}</span></NavLink>)}
    </div>
  </nav>;
}
export default MobileNav;
