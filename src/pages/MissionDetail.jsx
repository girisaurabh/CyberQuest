import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

function MissionDetail() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.mission(missionId)
      .then((data) => setMission(data.mission))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [missionId]);

  async function submitAnswer(event) {
    event.preventDefault();
    if (!answer || submitting || mission?.status === "completed") return;
    setSubmitting(true);
    setError("");
    try {
      const data = await api.attemptMission(missionId, answer);
      setResult(data);
      if (data.correct) {
        setMission((current) => ({ ...current, status: "completed", attempts: data.attempts }));
      } else {
        setMission((current) => ({ ...current, attempts: data.attempts, status: "in_progress" }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen p-8 text-slate-500">Loading mission...</div>;
  if (!mission) return <div className="min-h-screen p-8"><div className="max-w-3xl mx-auto rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">{error || "Mission not found."}</div></div>;

  const completed = mission.status === "completed" || result?.correct;

  return <div className="min-h-screen">
    <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-slate-200 bg-white">
      <div>
        <p className="text-sm text-slate-400">Mission / {mission.skill_name}</p>
        <h1 className="text-xl font-semibold text-slate-900">{mission.title}</h1>
      </div>
      <Link to="/missions" className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50">Back to missions</Link>
    </header>

    <main className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600">PHASE {mission.phase_number}</span>
        <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">⚡ {mission.xp_reward} XP</span>
        <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">◷ {mission.estimated_minutes} min</span>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-sm">
        <p className="text-blue-600 text-sm font-medium">MISSION BRIEF</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-2">{mission.title}</h2>
        <p className="text-slate-500 mt-4 leading-7">{mission.description}</p>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-sm">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div><h3 className="text-xl font-semibold text-slate-900">Learn</h3></div>
        <p className="text-slate-600 leading-7 mt-5 whitespace-pre-line">{mission.learn_content}</p>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-sm">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">2</div><h3 className="text-xl font-semibold text-slate-900">Practice</h3></div>
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-700 font-mono">{mission.practice_content}</pre>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-sm">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">3</div><h3 className="text-xl font-semibold text-slate-900">Challenge</h3></div>
        <p className="text-slate-700 font-medium mt-5">{mission.question}</p>
        <form onSubmit={submitAnswer} className="mt-5 space-y-3">
          {mission.options.map((option) => <label key={option} className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition ${answer === option ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300"} ${completed ? "cursor-default opacity-80" : ""}`}>
            <input type="radio" name="answer" value={option} checked={answer === option} onChange={(event) => setAnswer(event.target.value)} disabled={completed || submitting} className="accent-blue-600" />
            <span className="text-sm text-slate-700">{option}</span>
          </label>)}
          {!completed && <button type="submit" disabled={!answer || submitting} className="w-full mt-3 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{submitting ? "Checking..." : "Submit answer"}</button>}
        </form>

        {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
        {result && <div className={`mt-5 rounded-2xl border p-5 ${result.correct ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className={`font-semibold ${result.correct ? "text-emerald-700" : "text-amber-700"}`}>{result.correct ? "Challenge passed ✓" : "Not quite yet"}</p>
          <p className="text-sm text-slate-600 mt-2">{result.correct ? result.explanation : result.message}</p>
          {result.correct && <button onClick={() => navigate("/missions")} className="mt-4 rounded-xl bg-white border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700">Back to missions</button>}
        </div>}
      </section>
    </main>
  </div>;
}

export default MissionDetail;
