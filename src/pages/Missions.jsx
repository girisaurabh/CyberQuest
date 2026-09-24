import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const result = await api.missions();
      setMissions(result.missions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function complete(id) {
    setBusyId(id);
    try {
      await api.completeMission(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const completed = missions.filter((mission) => mission.status === "completed").length;

  return (
    <div className="min-h-screen">
      <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-white/5">
        <div><p className="text-sm text-slate-500">Training ground</p><h1 className="text-xl font-semibold">Missions</h1></div>
        <div className="px-4 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/10 text-sm"><span className="text-cyan-300 font-semibold">{completed}</span><span className="text-slate-500"> / {missions.length} completed</span></div>
      </header>
      <main className="p-6 md:p-10 max-w-[1400px] mx-auto">
        <section className="mb-8"><p className="text-cyan-400 text-sm font-medium mb-2">LEARN BY DOING</p><h2 className="text-4xl font-bold tracking-tight">Choose your next mission.</h2><p className="text-slate-500 mt-3 max-w-2xl">Short, focused cybersecurity missions designed to turn concepts into practical skills.</p></section>
        {error && <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}
        {loading ? <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-slate-400">Loading missions...</div> : (
          <div className="grid lg:grid-cols-2 gap-5">
            {missions.map((mission, index) => (
              <article key={mission.id} className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 hover:bg-white/[0.055] hover:border-cyan-400/15 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 border border-blue-400/10 flex items-center justify-center text-lg">{index + 1}</div><div><p className="text-xs uppercase tracking-wider text-cyan-400">{mission.skill_name}</p><h3 className="text-xl font-semibold mt-1">{mission.title}</h3></div></div>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${mission.status === "completed" ? "bg-emerald-400/10 text-emerald-300" : "bg-violet-400/10 text-violet-300"}`}>{mission.status === "completed" ? "COMPLETED" : mission.difficulty.toUpperCase()}</span>
                </div>
                <p className="text-slate-400 text-sm leading-6 mt-5">{mission.description}</p>
                <div className="flex flex-wrap gap-2 mt-5"><Meta>⚡ {mission.xp_reward} XP</Meta><Meta>◷ {mission.estimated_minutes} min</Meta><Meta>🎯 Practical</Meta></div>
                <div className="flex gap-3 mt-6">
                  <Link to={`/missions/${mission.id}`} className="flex-1 text-center px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-semibold hover:bg-white/[0.08] transition">Open mission</Link>
                  <button onClick={() => complete(mission.id)} disabled={busyId === mission.id || mission.status === "completed"} className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-sm font-semibold disabled:opacity-40">{mission.status === "completed" ? "Done ✓" : busyId === mission.id ? "Saving..." : "Complete"}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
function Meta({ children }) { return <span className="px-3 py-1.5 rounded-lg bg-white/[0.035] border border-white/5 text-xs text-slate-500">{children}</span>; }
export default Missions;
