export interface DatosRendimiento {
  tiempoEjecucionMs: number;
  mpPorSegundo: number;
}

interface PanelRendimientoProps {
  rendimiento: DatosRendimiento | null;
  estaProcesando: boolean;
}

export function PanelRendimiento({ rendimiento, estaProcesando }: PanelRendimientoProps) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Panel de Rendimiento</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Tiempo</span>
          <span className="text-lg font-bold text-indigo-400">
            {estaProcesando ? '...' : `${rendimiento?.tiempoEjecucionMs ?? 0} ms`}
          </span>
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Rendimiento</span>
          <span className="text-lg font-bold text-emerald-400">
            {estaProcesando ? '...' : `${rendimiento?.mpPorSegundo ?? 0} MP/s`}
          </span>
        </div>
      </div>
    </div>
  );
}
