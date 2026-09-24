import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missionBusy, setMissionBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");
      const result = await api.dashboard();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function completeMission() {
    if (!data?.todayMission || missionBusy) return;
    setMissionBusy(true);
    try {
      await api.completeMission(data.todayMission.id);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setMissionBusy(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading your CyberQuest...</div>;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-red-400/10 p-8">
          <h1 className="text-xl font-semibold">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-red-200">{error}</p>
          <p className="mt-4 text-sm text-slate-400">Make sure the CyberQuest backend and PostgreSQL database are running locally.</p>
        </div>
      </div>
    );
  }

  const mission = data?.todayMission;

  return (
    <div className="min-h-screen">
      <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-white/5">
        <div>
          <p className="text-sm text-slate-500">Your workspace</p>
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/5">
            <span>🔥</span>
            <span className="text-sm font-medium">{data.user.streak_days} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-400/10">
            <span>⚡</span>
            <span className="text-sm font-semibold">{data.user.xp} XP</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold">
            {data.user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-[1500px] mx-auto">
        <section className="mb-8">
          <p className="text-cyan-400 text-sm font-medium mb-2">KEEP BUILDING 🚀</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Good to see you, <span className="text-white">{data.user.name}</span> 👋
          </h1>
          <p className="text-slate-500 mt-3 text-lg">Build real cybersecurity skills, one mission at a time.</p>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </section>

        <div className="grid xl:grid-cols-[1.5fr_0.8fr] gap-6">
          <section className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-br from-blue-500/[0.12] via-white/[0.025] to-violet-500/[0.08] p-7 md:p-9">
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/10 text-cyan-300 text-xs font-semibold">
                  🎯 TODAY'S MISSION
                </div>
                <span className="text-xs text-slate-500">+{mission?.xp_reward || 0} XP</span>
              </div>

              {mission ? (
                <>
                  <div className="mt-8 max-w-2xl">
                    <p className="text-sm text-cyan-400 mb-2">{mission.skill_name?.toUpperCase()} • {mission.difficulty.toUpperCase()}</p>
                    <h2 className="text-3xl md:text-4xl font-bold">{mission.title}</h2>
                    <p className="text-slate-400 mt-4 leading-relaxed">{mission.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-7">
                    <span className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-slate-400">🌐 {mission.skill_name}</span>
                    <span className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-slate-400">🧠 {mission.difficulty}</span>
                    <span className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-slate-400">◷ {mission.estimated_minutes} min</span>
                  </div>
                  <button onClick={completeMission} disabled={missionBusy || mission.status === "completed"} className="mt-8 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50">
                    {mission.status === "completed" ? "Mission Completed ✓" : missionBusy ? "Saving..." : "Complete Mission →"}
                  </button>
                </>
              ) : (
                <div className="mt-10">
                  <h2 className="text-2xl font-bold">You are caught up 🎉</h2>
                  <p className="text-slate-400 mt-2">More missions will be added to your journey.</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">YOUR PROGRESS</p>
                <h3 className="text-xl font-semibold mt-1">Cybersecurity Journey</h3>
              </div>
              <div className="text-3xl font-bold text-cyan-400">{data.progress}%</div>
            </div>
            <div className="mt-7 h-3 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${data.progress}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-7">
              <Stat value={data.stats.modules} label="Modules" />
              <Stat value={data.stats.missions} label="Missions" />
              <Stat value={data.stats.projects} label="Projects" />
              <Stat value={data.stats.badges} label="Badges" />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-8">
          <div className="mb-7">
            <p className="text-sm text-cyan-400 font-medium">SKILL DEVELOPMENT</p>
            <h2 className="text-2xl font-bold mt-1">Your cybersecurity skills</h2>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.skills.map((skill) => <Skill key={skill.name} name={skill.name} progress={skill.progress} />)}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ value, label }) {
  return <div className="rounded-2xl bg-white/[0.035] border border-white/5 p-4"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-slate-500 mt-1">{label}</p></div>;
}

function Skill({ name, progress }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] border border-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{name}</span>
        <span className="text-sm text-slate-400">{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 mt-5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default Dashboard;
