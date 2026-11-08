import { useEffect, useRef, useState } from 'react';
import { EstadoImagen } from '../hooks/usarProcesadorImagen.ts';
import { ServicioCanvas } from '../../infrastructure/services/ServicioCanvas';

interface VisualizadorAntesDespuesProps {
  original: EstadoImagen | null;
  procesado: EstadoImagen | null;
}

export function VisualizadorAntesDespues({ original, procesado }: VisualizadorAntesDespuesProps) {
  const lienzoOriginalRef = useRef<HTMLCanvasElement | null>(null);
  const lienzoProcesadoRef = useRef<HTMLCanvasElement | null>(null);
  const [posicionDeslizador, setPosicionDeslizador] = useState<number>(50);

  useEffect(() => {
    if (original && lienzoOriginalRef.current) {
      ServicioCanvas.renderizarEnCanvas(lienzoOriginalRef.current, original.pixeles, original.ancho, original.alto);
    }
  }, [original]);

  useEffect(() => {
    if (procesado && lienzoProcesadoRef.current) {
      ServicioCanvas.renderizarEnCanvas(lienzoProcesadoRef.current, procesado.pixeles, procesado.ancho, procesado.alto);
    }
  }, [procesado]);

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow flex flex-col items-center gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original</span>
          <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 p-2 flex items-center justify-center max-w-full overflow-auto">
            <canvas ref={lienzoOriginalRef} className="max-h-[350px] object-contain rounded" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Procesada (Strategy)</span>
          <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 p-2 flex items-center justify-center max-w-full overflow-auto">
            <canvas ref={lienzoProcesadoRef} className="max-h-[350px] object-contain rounded" />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Comparativa Deslizante (Antes / Después)</span>
          <span>{posicionDeslizador}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={posicionDeslizador}
          onChange={(e) => setPosicionDeslizador(Number(e.target.value))}
          className="accent-indigo-500 cursor-pointer"
        />
        <div className="relative w-full h-[250px] overflow-hidden rounded border border-slate-700 bg-slate-950 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            {procesado && (
              <canvas
                ref={(node) => {
                  if (node && procesado) {
                    ServicioCanvas.renderizarEnCanvas(node, procesado.pixeles, procesado.ancho, procesado.alto);
                  }
                }}
                className="max-h-full object-contain"
              />
            )}
          </div>
          <div
            className="absolute inset-0 overflow-hidden flex items-center justify-center bg-slate-950"
            style={{ width: `${posicionDeslizador}%` }}
          >
            {original && (
              <canvas
                ref={(node) => {
                  if (node && original) {
                    ServicioCanvas.renderizarEnCanvas(node, original.pixeles, original.ancho, original.alto);
                  }
                }}
                className="max-h-full object-contain"
                style={{ width: original?.ancho ? `${original.ancho}px` : 'auto', maxWidth: 'none' }}
              />
            )}
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-indigo-500 shadow cursor-ew-resize"
            style={{ left: `${posicionDeslizador}%` }}
          />
        </div>
      </div>
    </div>
  );
}
