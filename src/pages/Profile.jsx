import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [data, setData] = useState(null);
  const [name, setName] = useState(user?.name || "");
  const [project, setProject] = useState({ title: "", description: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.profile().then((result) => {
      setData(result);
      setName(result.user.name);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  async function saveName(event) {
    event.preventDefault();
    setSavingName(true); setError(""); setNotice("");
    try {
      const result = await api.updateProfile({ name });
      setData((current) => current ? { ...current, user: result.user } : current);
      await refreshUser();
      setNotice("Profile name updated.");
    } catch (err) { setError(err.message); }
    finally { setSavingName(false); }
  }

  async function addProject(event) {
    event.preventDefault();
    setSavingProject(true); setError(""); setNotice("");
    try {
      const result = await api.addProject(project);
      setData((current) => current ? { ...current, projects: [result.project, ...current.projects] } : current);
      setProject({ title: "", description: "", url: "" });
      setNotice("Project added to your portfolio.");
    } catch (err) { setError(err.message); }
    finally { setSavingProject(false); }
  }

  async function signOut() {
    await logout();
    window.location.href = "/login";
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading profile...</div>;

  const profileUser = data?.user || user;
  const initial = profileUser?.name?.charAt(0)?.toUpperCase() || "C";

  return <div className="min-h-screen">
    <header className="h-20 px-6 md:px-10 flex items-center justify-between border-b border-slate-200 bg-white">
      <div><p className="text-sm text-slate-400">Your account</p><h1 className="text-xl font-semibold text-slate-900">Profile</h1></div>
      <Link to="/" className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50">Back to dashboard</Link>
    </header>
    <main className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">{initial}</div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-slate-900">{profileUser?.name}</p>
            <p className="text-slate-500 mt-1">{profileUser?.email || profileUser?.phone || "No contact method"}</p>
            <div className="flex flex-wrap gap-2 mt-4"><Badge>Level {profileUser?.level}</Badge><Badge>{profileUser?.xp} XP</Badge><Badge>🔥 {profileUser?.streak_days} day streak</Badge></div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-600">ACCOUNT</p>
        <h2 className="text-xl font-semibold text-slate-900 mt-2">Edit your profile</h2>
        <form onSubmit={saveName} className="mt-5 flex flex-col sm:flex-row gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={60} required className="flex-1 rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          <button disabled={savingName} className="rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white disabled:opacity-50">{savingName ? "Saving..." : "Save name"}</button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-600">PORTFOLIO</p>
        <h2 className="text-xl font-semibold text-slate-900 mt-2">Projects</h2>
        <p className="text-sm text-slate-500 mt-2">Showcase security labs, scripts, CTF write-ups, and other work you build.</p>
        <form onSubmit={addProject} className="mt-6 space-y-3">
          <input required minLength={2} maxLength={120} placeholder="Project title" value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          <textarea required minLength={10} maxLength={1000} rows={4} placeholder="What did you build or learn?" value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none" />
          <input type="url" placeholder="Project URL (optional)" value={project.url} onChange={(e) => setProject({ ...project, url: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          <button disabled={savingProject} className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 disabled:opacity-50">{savingProject ? "Adding..." : "Add project"}</button>
        </form>
        <div className="mt-8 space-y-3">
          {data?.projects?.length ? data.projects.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{item.title}</h3><p className="text-sm text-slate-500 mt-2 whitespace-pre-line">{item.description}</p></div>{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Open ↗</a>}</div></article>) : <p className="text-sm text-slate-400 py-4">No projects yet. Add your first project above.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-7 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Session</h2>
        <p className="text-sm text-slate-500 mt-1">Sign out from this device.</p>
        <button onClick={signOut} className="mt-4 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">Sign out</button>
      </section>
    </main>
  </div>;
}

function Badge({ children }) { return <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">{children}</span>; }
export default Profile;
