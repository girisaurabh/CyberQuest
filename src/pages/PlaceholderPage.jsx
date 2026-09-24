function PlaceholderPage({ title, description }) {
  return (
    <div className="min-h-screen">
      <header className="h-20 px-6 md:px-10 flex items-center border-b border-white/5">
        <div>
          <p className="text-sm text-slate-500">CyberQuest</p>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </header>
      <main className="p-6 md:p-10 max-w-5xl mx-auto">
        <section className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-8 md:p-10">
          <p className="text-cyan-400 text-sm font-semibold tracking-wide">COMING NEXT</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">{title}</h2>
          <p className="mt-4 max-w-2xl text-slate-400 leading-relaxed">{description}</p>
        </section>
      </main>
    </div>
  );
}
export default PlaceholderPage;
