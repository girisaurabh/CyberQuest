import { useEffect, useState } from "react";
import { api } from "../lib/api";

function Journey() {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.journey()
      .then((data) => setPhases(data.phases || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="h-20 px-6 md:px-10 flex items-center border-b border-white/5">
        <div><p className="text-sm text-slate-500">Your roadmap</p><h1 className="text-xl font-semibold">Cybersecurity Journey</h1></div>
      </header>
      <main className="p-6 md:p-10 max-w-5xl mx-auto">
        <p className="text-cyan-400 text-sm font-medium">ZERO → SPECIALIZATION</p>
        <h2 className="text-4xl md:text-5xl font-bold mt-2">Build skills in the right order.</h2>
        <p className="text-slate-500 mt-4 max-w-2xl">Each phase builds on the previous one. Complete practical missions to move your roadmap forward.</p>
        {error && <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">{error}</div>}
        {loading ? <p className="mt-10 text-slate-500">Loading journey...</p> : (
          <div className="mt-10 space-y-4">
            {phases.map((phase, index) => (
              <div key={phase.id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 md:p-7">
                <div className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/25 to-violet-500/15 border border-blue-400/10 flex items-center justify-center font-bold text-cyan-300">{String(index + 1).padStart(2, "0")}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-xs text-cyan-400">PHASE {phase.phase_number}</p><h3 className="text-xl font-semibold mt-1">{phase.name}</h3></div>
                      <span className="text-sm text-slate-400">{phase.completed_missions}/{phase.total_missions} missions</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-3">{phase.description}</p>
                    <div className="h-2 rounded-full bg-slate-800 mt-5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${phase.progress}%` }} /></div>
                    <p className="text-xs text-slate-600 mt-2">{phase.progress}% complete</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Journey;
