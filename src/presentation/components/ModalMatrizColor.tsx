import { useEffect, useState } from 'react';
import { EstadoImagen } from '../hooks/usarProcesadorImagen';
import { EFECTOS_MATRIZ_COLOR, EstrategiaMatrizColor, DefinicionEfectoMatrizColor } from '../../domain/strategies/EstrategiasMatrizColor';

interface ModalMatrizColorProps {
  estaAbierto: boolean;
  onCerrar: () => void;
  imagenOriginal: EstadoImagen | null;
  idEfectoActual: number;
  onSeleccionarEfecto: (idEfecto: number) => void;
}

interface MiniaturaEfecto {
  id: number;
  nombre: string;
  categoria: DefinicionEfectoMatrizColor['categoria'];
  url: string;
}

const LADO_MAXIMO_MINIATURA = 110;

function generarMiniaturas(imagen: EstadoImagen): MiniaturaEfecto[] {
  const factorEscala = Math.min(1, LADO_MAXIMO_MINIATURA / Math.max(imagen.ancho, imagen.alto));
  const anchoMini = Math.max(1, Math.round(imagen.ancho * factorEscala));
  const altoMini = Math.max(1, Math.round(imagen.alto * factorEscala));

  const lienzoOriginal = document.createElement('canvas');
  lienzoOriginal.width = imagen.ancho;
  lienzoOriginal.height = imagen.alto;
  const contextoOriginal = lienzoOriginal.getContext('2d');
  if (!contextoOriginal) return [];
  const datosOriginales = new ImageData(new Uint8ClampedArray(imagen.pixeles), imagen.ancho, imagen.alto);
  contextoOriginal.putImageData(datosOriginales, 0, 0);

  const lienzoMini = document.createElement('canvas');
  lienzoMini.width = anchoMini;
  lienzoMini.height = altoMini;
  const contextoMini = lienzoMini.getContext('2d');
  if (!contextoMini) return [];
  contextoMini.drawImage(lienzoOriginal, 0, 0, anchoMini, altoMini);
  const datosMini = contextoMini.getImageData(0, 0, anchoMini, altoMini).data;

  const estrategia = new EstrategiaMatrizColor();

  return EFECTOS_MATRIZ_COLOR.map((efecto) => {
    const pixelesProcesados = estrategia.aplicar(
      new Uint8ClampedArray(datosMini),
      anchoMini,
      altoMini,
      { numEfecto: efecto.id }
    );

    const lienzoTarjeta = document.createElement('canvas');
    lienzoTarjeta.width = anchoMini;
    lienzoTarjeta.height = altoMini;
    const contextoTarjeta = lienzoTarjeta.getContext('2d');
    if (contextoTarjeta) {
      contextoTarjeta.putImageData(new ImageData(new Uint8ClampedArray(pixelesProcesados), anchoMini, altoMini), 0, 0);
    }

    return {
      id: efecto.id,
      nombre: efecto.nombre,
      categoria: efecto.categoria,
      url: lienzoTarjeta.toDataURL('image/png')
    };
  });
}

const colorCategoria: Record<DefinicionEfectoMatrizColor['categoria'], string> = {
  general: 'bg-slate-500',
  'enfasis-oscuro': 'bg-indigo-400',
  'enfasis-claro': 'bg-amber-300'
};

export function ModalMatrizColor({
  estaAbierto,
  onCerrar,
  imagenOriginal,
  idEfectoActual,
  onSeleccionarEfecto
}: ModalMatrizColorProps) {
  const [miniaturas, setMiniaturas] = useState<MiniaturaEfecto[]>([]);

  useEffect(() => {
    if (!estaAbierto || !imagenOriginal) {
      setMiniaturas([]);
      return;
    }
    setMiniaturas(generarMiniaturas(imagenOriginal));
  }, [estaAbierto, imagenOriginal]);

  if (!estaAbierto) return null;

  const efectoActual = EFECTOS_MATRIZ_COLOR.find((efecto) => efecto.id === idEfectoActual);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-start gap-4 px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-indigo-400">Matriz de Color — 20 variaciones estilo Word</h2>
            <p className="text-xs text-slate-400">
              Selecciona una variante para aplicarla al visor
              {efectoActual ? ` · Actual: Efecto ${efectoActual.id} — ${efectoActual.nombre}` : ''}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {miniaturas.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Cargando previsualizaciones de los 20 efectos...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {miniaturas.map((miniatura) => {
                const estaSeleccionado = miniatura.id === idEfectoActual;
                return (
                  <button
                    key={miniatura.id}
                    onClick={() => onSeleccionarEfecto(miniatura.id)}
                    className={`group flex flex-col gap-2 p-2 rounded-xl border text-left transition-all ${
                      estaSeleccionado
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40'
                        : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img
                        src={miniatura.url}
                        alt={miniatura.nombre}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-200">
                        {miniatura.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colorCategoria[miniatura.categoria]}`} />
                      <span className="text-[11px] font-medium text-slate-200 truncate">{miniatura.nombre}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 flex flex-wrap gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Efectos base</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Énfasis oscuro</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300" /> Énfasis claro / decolorado</span>
        </div>
      </div>
    </div>
  );
}
