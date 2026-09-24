function Sidebar() {
  return (
    <aside className="hidden md:flex w-72 min-h-screen p-4">

      <div className="w-full flex flex-col rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-2xl shadow-2xl shadow-blue-950/20">

        {/* Logo */}
        <div className="px-6 pt-7 pb-8">

          <div className="flex items-center gap-3">

            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl">🛡️</span>

              <div className="absolute inset-0 rounded-2xl bg-blue-400/20 blur-md -z-10" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Cyber<span className="text-cyan-400">Quest</span>
              </h1>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Learn • Practice • Level Up
              </p>
            </div>

          </div>

        </div>


        {/* Navigation */}
        <div className="px-3">

          <p className="px-3 mb-3 text-[10px] font-semibold tracking-[0.18em] text-slate-600">
            MAIN MENU
          </p>

          <nav className="space-y-1.5">

            <NavItem icon="⌂" label="Home" active />
            <NavItem icon="◈" label="Journey" />
            <NavItem icon="◎" label="Missions" />
            <NavItem icon="♜" label="Rewards" />
            <NavItem icon="▥" label="Skills" />

          </nav>

        </div>


        {/* Spacer */}
        <div className="flex-1" />


        {/* Daily streak */}
        <div className="mx-4 mb-4 p-4 rounded-2xl border border-orange-400/10 bg-orange-400/[0.04]">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-500">
                DAILY STREAK
              </p>

              <p className="text-lg font-bold mt-1">
                🔥 12 days
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-orange-400/10 flex items-center justify-center">
              🔥
            </div>

          </div>

        </div>


        {/* Profile */}
        <div className="border-t border-white/5 p-4">

          <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold">
              S
            </div>

            <div className="flex-1 text-left">

              <p className="text-sm font-semibold">
                Saurabh
              </p>

              <p className="text-xs text-slate-500">
                Level 3 • 1,240 XP
              </p>

            </div>

            <span className="text-slate-600">
              ›
            </span>

          </button>

        </div>

      </div>

    </aside>
  );
}


function NavItem({ icon, label, active = false }) {

  return (
    <button
      className={`
        group relative w-full flex items-center gap-4
        px-4 py-3.5 rounded-2xl
        transition-all duration-200
        ${
          active
            ? "bg-gradient-to-r from-blue-500/15 to-violet-500/10 text-white border border-blue-400/10 shadow-lg shadow-blue-950/20"
            : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.035]"
        }
      `}
    >

      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
      )}

      <span
        className={`
          text-xl w-6 text-center transition
          ${active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}
        `}
      >
        {icon}
      </span>

      <span className="text-sm font-medium">
        {label}
      </span>

    </button>
  );
}


export default Sidebar;