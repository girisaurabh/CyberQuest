import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try { setError(""); setData(await api.dashboard()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading your CyberQuest...</div>;
  if (error && !data) return <div className="min-h-screen p-6 md:p-10"><div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-8"><h1 className="text-xl font-semibold text-slate-900">Dashboard unavailable</h1><p className="mt-2 text-sm text-red-600">{error}</p><p className="mt-4 text-sm text-slate-500">Make sure the CyberQuest backend and PostgreSQL database are running locally.</p></div></div>;

  const mission = data?.todayMission;

  return <div className="min-h-screen">
    <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-slate-200 bg-white">
      <div><p className="text-sm text-slate-400">Your workspace</p><h2 className="text-xl font-semibold text-slate-900">Dashboard</h2></div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100"><span>🔥</span><span className="text-sm font-medium text-slate-700">{data.user.streak_days} day streak</span></div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100"><span>⚡</span><span className="text-sm font-semibold text-blue-700">{data.user.xp} XP</span></div>
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">{data.user.name.charAt(0).toUpperCase()}</div>
      </div>
    </header>

    <main className="p-6 md:p-10 max-w-[1500px] mx-auto">
      <section className="mb-8">
        <p className="text-blue-600 text-sm font-medium mb-2">KEEP BUILDING 🚀</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Good to see you, <span className="text-blue-600">{data.user.name}</span> 👋</h1>
        <p className="text-slate-500 mt-3 text-lg">Build real cybersecurity skills, one mission at a time.</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      <div className="grid xl:grid-cols-[1.5fr_0.8fr] gap-6">
        <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-7 md:p-9 shadow-sm">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between"><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold">🎯 TODAY'S MISSION</div><span className="text-xs text-slate-400">+{mission?.xp_reward || 0} XP</span></div>
            {mission ? <><div className="mt-8 max-w-2xl"><p className="text-sm text-blue-600 mb-2">{mission.skill_name?.toUpperCase()} • {mission.difficulty.toUpperCase()}</p><h2 className="text-3xl md:text-4xl font-bold text-slate-900">{mission.title}</h2><p className="text-slate-500 mt-4 leading-relaxed">{mission.description}</p></div><div className="flex flex-wrap gap-3 mt-7"><Tag>🌐 {mission.skill_name}</Tag><Tag>🧠 {mission.difficulty}</Tag><Tag>◷ {mission.estimated_minutes} min</Tag></div><Link to={`/missions/${mission.id}`} className="inline-flex mt-8 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">{mission.status === "in_progress" ? "Continue mission →" : "Start mission →"}</Link></> : <div className="mt-10"><h2 className="text-2xl font-bold text-slate-900">You are caught up 🎉</h2><p className="text-slate-500 mt-2">More missions will be added to your journey.</p></div>}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">YOUR PROGRESS</p><h3 className="text-xl font-semibold mt-1 text-slate-900">Cybersecurity Journey</h3></div><div className="text-3xl font-bold text-blue-600">{data.progress}%</div></div>
          <div className="mt-7 h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${data.progress}%` }} /></div>
          <div className="grid grid-cols-2 gap-3 mt-7"><Stat value={data.stats.modules} label="Modules" /><Stat value={data.stats.missions} label="Missions" /><Stat value={data.stats.projects} label="Projects" /><Stat value={data.stats.badges} label="Badges" /></div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 md:p-8 shadow-sm"><div className="mb-7"><p className="text-sm text-blue-600 font-medium">SKILL DEVELOPMENT</p><h2 className="text-2xl font-bold mt-1 text-slate-900">Your cybersecurity skills</h2></div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{data.skills.map((skill) => <Skill key={skill.name} name={skill.name} progress={skill.progress} />)}</div></section>
    </main>
  </div>;
}
function Tag({ children }) { return <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600">{children}</span>; }
function Stat({ value, label }) { return <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4"><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-400 mt-1">{label}</p></div>; }
function Skill({ name, progress }) { return <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate-800">{name}</span><span className="text-sm text-slate-400">{progress}%</span></div><div className="h-2 rounded-full bg-slate-200 mt-5 overflow-hidden"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div></div>; }
export default Dashboard;
