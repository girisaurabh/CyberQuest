import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() { try { setError(""); const result = await api.missions(); setMissions(result.missions || []); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const completed = missions.filter((m) => m.status === "completed").length;

  return <div className="min-h-screen">
    <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-slate-200 bg-white"><div><p className="text-sm text-slate-400">Training ground</p><h1 className="text-xl font-semibold text-slate-900">Missions</h1></div><div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm"><span className="text-blue-600 font-semibold">{completed}</span><span className="text-slate-400"> / {missions.length} completed</span></div></header>
    <main className="p-6 md:p-10 max-w-[1400px] mx-auto"><section className="mb-8"><p className="text-blue-600 text-sm font-medium mb-2">LEARN BY DOING</p><h2 className="text-4xl font-bold tracking-tight text-slate-900">Choose your next mission.</h2><p className="text-slate-500 mt-3 max-w-2xl">Short, focused cybersecurity missions designed to turn concepts into practical skills.</p></section>
      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {loading ? <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">Loading missions...</div> : <div className="grid lg:grid-cols-2 gap-5">{missions.map((mission, index) => <article key={mission.id} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition">
        <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-semibold">{index + 1}</div><div><p className="text-xs uppercase tracking-wider text-blue-600">{mission.skill_name}</p><h3 className="text-xl font-semibold mt-1 text-slate-900">{mission.title}</h3></div></div><span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${mission.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{mission.status === "completed" ? "COMPLETED" : mission.difficulty.toUpperCase()}</span></div>
        <p className="text-slate-500 text-sm leading-6 mt-5">{mission.description}</p><div className="flex flex-wrap gap-2 mt-5"><Meta>⚡ {mission.xp_reward} XP</Meta><Meta>◷ {mission.estimated_minutes} min</Meta><Meta>🎯 Practical</Meta></div>
        <div className="flex gap-3 mt-6"><Link to={`/missions/${mission.id}`} className="flex-1 text-center px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">{mission.status === "completed" ? "Review mission" : "Start mission"}</Link></div>
      </article>)}</div>}
    </main>
  </div>;
}
function Meta({ children }) { return <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">{children}</span>; }
export default Missions;
