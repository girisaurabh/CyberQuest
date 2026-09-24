import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Rewards() {
  const [data,setData]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{api.rewards().then(setData).catch(e=>setError(e.message))},[]);
  if(error) return <Page title="Rewards"><Error text={error}/></Page>;
  if(!data) return <Page title="Rewards"><p className="text-slate-500">Loading rewards...</p></Page>;
  const earned=data.badges.filter(b=>b.earned_at).length;
  return <Page title="Rewards"><div className="grid md:grid-cols-3 gap-4 mb-6"><Card label="Level" value={data.user.level}/><Card label="XP" value={data.user.xp}/><Card label="Streak" value={`${data.user.streak_days} days`}/></div><section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-blue-600 text-sm font-semibold">BADGES</p><h2 className="text-2xl font-bold text-slate-900 mt-1">Your achievements</h2><p className="text-sm text-slate-500 mt-2">{earned} of {data.badges.length} earned</p><div className="grid sm:grid-cols-2 gap-4 mt-6">{data.badges.map(b=><div key={b.id} className={`rounded-2xl border p-5 ${b.earned_at?"border-blue-100 bg-blue-50":"border-slate-200 bg-slate-50 opacity-60"}`}><div className="text-3xl">{b.icon}</div><h3 className="font-semibold text-slate-900 mt-3">{b.name}</h3><p className="text-sm text-slate-500 mt-1">{b.description}</p><p className="text-xs font-medium text-blue-600 mt-3">{b.earned_at?"Earned":"Locked"}</p></div>)}</div></section></Page>;
}
function Page({title,children}){return <div className="min-h-screen"><header className="h-20 px-6 md:px-10 flex items-center border-b border-slate-200 bg-white"><h1 className="text-xl font-semibold text-slate-900">{title}</h1></header><main className="p-6 md:p-10 max-w-5xl mx-auto">{children}</main></div>}
function Card({label,value}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs text-slate-400">{label}</p><p className="text-3xl font-bold text-slate-900 mt-2">{value}</p></div>}
function Error({text}){return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">{text}</div>}
