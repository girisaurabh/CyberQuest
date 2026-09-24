function PlaceholderPage({ title, description }) {
  return <div className="min-h-screen">
    <header className="h-20 px-6 md:px-10 flex items-center border-b border-slate-200 bg-white"><div><p className="text-sm text-slate-400">CyberQuest</p><h1 className="text-xl font-semibold text-slate-900">{title}</h1></div></header>
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 md:p-10">
        <p className="text-blue-600 text-sm font-semibold tracking-wide">COMING NEXT</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">{title}</h2>
        <p className="mt-4 max-w-2xl text-slate-500 leading-relaxed">{description}</p>
      </section>
    </main>
  </div>;
}
export default PlaceholderPage;
