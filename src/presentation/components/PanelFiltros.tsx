import { useState } from 'react';
import { RegistroFiltros } from '../../application/services/RegistroFiltros';
import { PanelKernel } from './PanelKernel';
import { crearParametrosKernelPorDefecto, ParametrosKernel } from '../../domain/strategies/EstrategiaKernel';

interface PanelFiltrosProps {
  filtroActual: string;
  onSeleccionarFiltro: (clave: string, parametros: Record<string, any>) => void;
  onAbrirMatrizColor: () => void;
}

export function PanelFiltros({ filtroActual, onSeleccionarFiltro, onAbrirMatrizColor }: PanelFiltrosProps) {
  const filtros = RegistroFiltros.obtenerTodos();

  const [brillo, setBrillo] = useState<number>(0);
  const [contraste, setContraste] = useState<number>(0);
  const [umbral, setUmbral] = useState<number>(128);
  const [niveles, setNiveles] = useState<number>(16);
  const [bits, setBits] = useState<number>(4);
  const [min, setMin] = useState<number>(100);
  const [max, setMax] = useState<number>(200);
  const [parametrosKernel, setParametrosKernel] = useState<ParametrosKernel>(() => crearParametrosKernelPorDefecto());

  const manejarSeleccion = (clave: string) => {
    if (clave === 'matriz-color') {
      onAbrirMatrizColor();
      return;
    }

    if (clave === 'convolucion') {
      onSeleccionarFiltro(clave, parametrosKernel);
      return;
    }

    let parametros = {};
    if (clave === 'brillo-contraste') parametros = { brillo, contraste };
    if (clave === 'blanco-negro') parametros = { umbral };
    if (clave === 'cuantizacion-niveles' || clave === 'mapa-perdida') parametros = { niveles };
    if (clave === 'reduccion-bits') parametros = { bits };
    if (clave === 'enfasis-color') parametros = { min, max };
    onSeleccionarFiltro(clave, parametros);
  };

  const manejarCambioParametro = (clave: string, nuevosParametros: Record<string, any>) => {
    onSeleccionarFiltro(clave, nuevosParametros);
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Estrategias de Procesamiento</h2>
      
      <div className="grid grid-cols-1 gap-2">
        {filtros.map((f) => (
          <button
            key={f.clave}
            onClick={() => manejarSeleccion(f.clave)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left flex justify-between items-center ${
              filtroActual === f.clave
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <span>{f.nombre}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
              f.esRubrica 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {f.esRubrica ? 'Rúbrica' : 'PDI Extra'}
            </span>
          </button>
        ))}
      </div>

      {filtroActual === 'brillo-contraste' && (
        <div className="flex flex-col gap-3 border-t border-slate-700 pt-3">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Brillo</span>
              <span className="font-bold text-indigo-400">{brillo}</span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              value={brillo}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBrillo(val);
                manejarCambioParametro('brillo-contraste', { brillo: val, contraste });
              }}
              className="accent-indigo-500 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Contraste</span>
              <span className="font-bold text-indigo-400">{contraste}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={contraste}
              onChange={(e) => {
                const val = Number(e.target.value);
                setContraste(val);
                manejarCambioParametro('brillo-contraste', { brillo, contraste: val });
              }}
              className="accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {filtroActual === 'blanco-negro' && (
        <div className="flex flex-col gap-1 border-t border-slate-700 pt-3">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Umbral (T)</span>
            <span className="font-bold text-indigo-400">{umbral}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={umbral}
            onChange={(e) => {
              const val = Number(e.target.value);
              setUmbral(val);
              manejarCambioParametro('blanco-negro', { umbral: val });
            }}
            className="accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {(filtroActual === 'cuantizacion-niveles' || filtroActual === 'mapa-perdida') && (
        <div className="flex flex-col gap-1 border-t border-slate-700 pt-3">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Niveles (N)</span>
            <span className="font-bold text-indigo-400">{niveles} niveles</span>
          </div>
          <input
            type="range"
            min="2"
            max="256"
            step="2"
            value={niveles}
            onChange={(e) => {
              const val = Number(e.target.value);
              setNiveles(val);
              manejarCambioParametro(filtroActual, { niveles: val });
            }}
            className="accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {filtroActual === 'reduccion-bits' && (
        <div className="flex flex-col gap-1 border-t border-slate-700 pt-3">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Reducción de Bits</span>
            <span className="font-bold text-indigo-400">{bits} bits</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={bits}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBits(val);
              manejarCambioParametro('reduccion-bits', { bits: val });
            }}
            className="accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {filtroActual === 'enfasis-color' && (
        <div className="flex flex-col gap-2 border-t border-slate-700 pt-3">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Límites de Énfasis</span>
            <span className="font-bold text-indigo-400">{min} - {max}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="range"
              min="0"
              max="255"
              value={min}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMin(val);
                manejarCambioParametro('enfasis-color', { min: val, max });
              }}
              className="accent-indigo-500 cursor-pointer w-1/2"
            />
            <input
              type="range"
              min="0"
              max="255"
              value={max}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMax(val);
                manejarCambioParametro('enfasis-color', { min, max: val });
              }}
              className="accent-indigo-500 cursor-pointer w-1/2"
            />
          </div>
        </div>
      )}

      {filtroActual === 'convolucion' && (
        <div className="border-t border-slate-700 pt-3">
          <PanelKernel
            parametros={parametrosKernel}
            onCambiar={(nuevos) => {
              setParametrosKernel(nuevos);
              onSeleccionarFiltro('convolucion', nuevos);
            }}
          />
        </div>
      )}
    </div>
  );
}
