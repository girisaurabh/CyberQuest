function Dashboard() {
  return (
    <div className="min-h-screen">

      {/* Top Bar */}
      <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-white/5">

        <div>
          <p className="text-sm text-slate-500">
            Your workspace
          </p>

          <h2 className="text-xl font-semibold">
            Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-3">

          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/5">
            <span>🔥</span>
            <span className="text-sm font-medium">12 day streak</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-400/10">
            <span>⚡</span>
            <span className="text-sm font-semibold">1,240 XP</span>
          </div>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold">
            S
          </div>

        </div>

      </header>


      {/* Main Content */}
      <main className="p-6 md:p-10 max-w-[1500px] mx-auto">

        {/* Welcome */}
        <section className="mb-8">

          <p className="text-cyan-400 text-sm font-medium mb-2">
            KEEP BUILDING 🚀
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Good evening, <span className="text-white">Saurabh</span> 👋
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            You're building real cybersecurity skills, one mission at a time.
          </p>

        </section>


        {/* Main Grid */}
        <div className="grid xl:grid-cols-[1.5fr_0.8fr] gap-6">


          {/* Today's Mission */}
          <section className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-br from-blue-500/[0.12] via-white/[0.025] to-violet-500/[0.08] p-7 md:p-9">

            {/* Glow */}
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/10 text-cyan-300 text-xs font-semibold">
                  🎯 TODAY'S MISSION
                </div>

                <span className="text-xs text-slate-500">
                  +100 XP
                </span>

              </div>


              <div className="mt-8 max-w-2xl">

                <p className="text-sm text-cyan-400 mb-2">
                  NETWORKING • BEGINNER
                </p>

                <h2 className="text-3xl md:text-4xl font-bold">
                  Packet Detective
                </h2>

                <p className="text-slate-400 mt-4 leading-relaxed">
                  Investigate network traffic inside a safe simulated
                  environment and discover what's happening inside the packets.
                </p>

              </div>


              <div className="flex flex-wrap gap-3 mt-7">

                <span className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-slate-400">
                  🌐 Networking
                </span>

                <span className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-slate-400">
                  🧠 Beginner
                </span>

                <span className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-slate-400">
                  ◷ 15 min
                </span>

              </div>


              <button className="mt-8 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 font-semibold shadow-lg shadow-blue-500/20 transition-all">
                Continue Mission →
              </button>

            </div>

          </section>


          {/* Progress */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-7">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  YOUR PROGRESS
                </p>

                <h3 className="text-xl font-semibold mt-1">
                  Cybersecurity Journey
                </h3>
              </div>

              <div className="text-3xl font-bold text-cyan-400">
                72%
              </div>

            </div>


            {/* Progress Bar */}
            <div className="mt-7">

              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400/20" />

              </div>

            </div>


            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-7">

              <Stat value="12" label="Modules" />
              <Stat value="38" label="Missions" />
              <Stat value="5" label="Projects" />
              <Stat value="18" label="Badges" />

            </div>

          </section>

        </div>


        {/* Skill Section */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-8">

          <div className="flex items-end justify-between mb-7">

            <div>
              <p className="text-sm text-cyan-400 font-medium">
                SKILL DEVELOPMENT
              </p>

              <h2 className="text-2xl font-bold mt-1">
                Your cybersecurity skills
              </h2>
            </div>

            <button className="hidden sm:block text-sm text-slate-400 hover:text-white transition">
              View all →
            </button>

          </div>


          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

            <Skill
              icon="🌐"
              name="Networking"
              progress="72%"
              width="72%"
              color="from-cyan-400 to-blue-500"
            />

            <Skill
              icon="🐧"
              name="Linux"
              progress="54%"
              width="54%"
              color="from-blue-400 to-violet-500"
            />

            <Skill
              icon="🐍"
              name="Python"
              progress="41%"
              width="41%"
              color="from-violet-400 to-purple-500"
            />

            <Skill
              icon="🔐"
              name="Security Core"
              progress="28%"
              width="28%"
              color="from-purple-400 to-pink-500"
            />

          </div>

        </section>


        {/* Learning Journey */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-8">

          <div className="flex items-end justify-between mb-8">

            <div>
              <p className="text-sm text-cyan-400 font-medium">
                ROADMAP
              </p>

              <h2 className="text-2xl font-bold mt-1">
                Your Cybersecurity Journey
              </h2>

              <p className="text-slate-500 mt-2">
                From zero to specialization-ready.
              </p>
            </div>

            <button className="hidden sm:block text-sm text-cyan-400 hover:text-cyan-300">
              View roadmap →
            </button>

          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">

            <Phase number="01" icon="🌱" title="Foundations" active />
            <Phase number="02" icon="🌐" title="Networking" active />
            <Phase number="03" icon="🐧" title="Systems" />
            <Phase number="04" icon="🔐" title="Security" />
            <Phase number="05" icon="🌍" title="Web Security" />
            <Phase number="06" icon="⚔️" title="Offensive" />
            <Phase number="07" icon="🛡️" title="Blue Team" />
            <Phase number="08" icon="☁️" title="Cloud" />

          </div>

        </section>

      </main>

    </div>
  );
}


/* Small reusable components */

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] border border-white/5 p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}


function Skill({ icon, name, progress, width, color }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] border border-white/5 p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            {icon}
          </span>

          <span className="font-medium">
            {name}
          </span>

        </div>

        <span className="text-sm text-slate-400">
          {progress}
        </span>

      </div>

      <div className="h-2 rounded-full bg-slate-800 mt-5 overflow-hidden">

        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width }}
        />

      </div>

    </div>
  );
}


function Phase({ number, icon, title, active = false }) {
  return (
    <div
      className={`
        rounded-2xl p-4 border transition
        ${
          active
            ? "bg-blue-500/[0.08] border-blue-400/20"
            : "bg-white/[0.02] border-white/5 opacity-60"
        }
      `}
    >

      <p className="text-[10px] text-slate-600 font-semibold">
        {number}
      </p>

      <div className="text-2xl mt-3">
        {icon}
      </div>

      <p className="text-xs font-medium mt-3">
        {title}
      </p>

    </div>
  );
}


export default Dashboard;