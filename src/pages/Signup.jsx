import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "./Login";

function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout eyebrow="START YOUR JOURNEY" title="Create your CyberQuest" subtitle="Build a real cybersecurity learning profile and track your progress over time.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          ["name", "Name", "text"],
          ["email", "Email", "email"],
          ["password", "Password", "password"],
        ].map(([key, label, type]) => (
          <label key={key} className="block">
            <span className="mb-2 block text-sm text-slate-600">{label}</span>
            <input required minLength={key === "password" ? 8 : undefined} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          </label>
        ))}
        {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 px-5 py-3.5 font-semibold disabled:opacity-50">
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link className="text-blue-600 hover:text-blue-700" to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;
