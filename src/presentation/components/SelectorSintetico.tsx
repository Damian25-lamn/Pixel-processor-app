interface SelectorSinteticoProps {
  onSelectPattern: (patternId: number) => void;
}

const patterns = [
  { id: 0, label: 'Círculos Arriba/Abajo' },
  { id: 1, label: 'Líneas Horizontales' },
  { id: 2, label: 'Gradiente Radial' },
  { id: 3, label: 'Círculos Concéntricos' },
  { id: 4, label: 'Tablero de Escaqueo' }
];

export function SelectorSintetico({ onSelectPattern }: SelectorSinteticoProps) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Imágenes Sintéticas</h2>
      <div className="grid grid-cols-1 gap-2">
        {patterns.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPattern(p.id)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 active:bg-indigo-600 text-slate-200 text-xs font-medium rounded-lg text-left transition-colors"
          >
            Patrón {p.id}: {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
