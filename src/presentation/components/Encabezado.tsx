export function Encabezado() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <h1 className="text-xl font-bold text-indigo-400">Procesamiento Gráfico de Bajo Nivel</h1>
        <span className="text-sm text-slate-400">TypeScript &middot; React &middot; Web Workers</span>
      </div>
    </header>
  );
}
