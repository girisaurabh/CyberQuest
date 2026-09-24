import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

function Login() {
  const { user, login, phoneLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("email");
  const [form, setForm] = useState({ email: "", password: "", phone: "", code: "", name: "" });
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={location.state?.from || "/"} replace />;

  async function submitEmail(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function sendCode() {
    setError("");
    setBusy(true);
    try {
      await api.sendPhoneCode(form.phone);
      setCodeSent(true);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await phoneLogin({ phone: form.phone, code: form.code, name: form.name });
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  function social(provider) {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  }

  return (
    <AuthLayout eyebrow="WELCOME BACK" title="Continue your CyberQuest" subtitle="Use a real account so your progress stays yours across devices.">
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 mb-5">
        <button type="button" onClick={() => { setMode("email"); setError(""); }} className={`rounded-lg py-2.5 text-sm font-semibold ${mode === "email" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Email</button>
        <button type="button" onClick={() => { setMode("phone"); setError(""); }} className={`rounded-lg py-2.5 text-sm font-semibold ${mode === "phone" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Phone OTP</button>
      </div>

      {mode === "email" ? (
        <form onSubmit={submitEmail} className="space-y-4">
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <button disabled={busy} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50">{busy ? "Signing in..." : "Sign in"}</button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          {!codeSent && <Field label="Your name" type="text" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />}
          <Field label="Phone number" type="tel" placeholder="+91..." value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          {codeSent && <Field label="Verification code" type="text" inputMode="numeric" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />}
          {!codeSent ? (
            <button type="button" onClick={sendCode} disabled={busy} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white disabled:opacity-50">{busy ? "Sending code..." : "Send SMS code"}</button>
          ) : (
            <button disabled={busy} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white disabled:opacity-50">{busy ? "Verifying..." : "Verify & continue"}</button>
          )}
        </form>
      )}

      <div className="flex items-center gap-3 my-6"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-400">OR CONTINUE WITH</span><div className="h-px flex-1 bg-slate-200" /></div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => social("google")} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Google</button>
        <button type="button" onClick={() => social("facebook")} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Facebook</button>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <p className="mt-6 text-center text-sm text-slate-500">New to CyberQuest? <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/signup">Create an account</Link></p>
    </AuthLayout>
  );
}

function Field({ label, type, value, onChange, placeholder, inputMode }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-600">{label}</span><input required type={type} inputMode={inputMode} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>;
}

export function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-slate-50">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 text-xl font-bold text-slate-900"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">🛡️</span>Cyber<span className="text-blue-600">Quest</span></Link>
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60">
          <p className="text-xs font-semibold tracking-[0.18em] text-blue-600">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </section>
      </div>
    </div>
  );
}

export default Login;
