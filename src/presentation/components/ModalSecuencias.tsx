import { useEffect, useRef, useState } from 'react';
import { EstadoImagen } from '../hooks/usarProcesadorImagen';
import { FotogramaSecuenciaImagen } from '../../domain/strategies/EstrategiasSecuencia';
import { ServicioCanvas } from '../../infrastructure/services/ServicioCanvas';

interface ModalSecuenciasProps {
  estaAbierto: boolean;
  onCerrar: () => void;
  imagenOriginal: EstadoImagen | null;
  worker: Worker | null;
}

export function ModalSecuencias({ estaAbierto, onCerrar, imagenOriginal, worker }: ModalSecuenciasProps) {
  const [fotogramasGrisAlpha, setFotogramasGrisAlpha] = useState<FotogramaSecuenciaImagen[]>([]);
  const [fotogramasSaturacion, setFotogramasSaturacion] = useState<FotogramaSecuenciaImagen[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [pestanaActiva, setPestanaActiva] = useState<'escalaGrises' | 'saturacion'>('escalaGrises');
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const [indiceActual, setIndiceActual] = useState<number>(0);
  const [temporizador, setTemporizador] = useState<number | null>(null);

  const lienzoOriginalRef = useRef<HTMLCanvasElement | null>(null);
  const temporizadorRef = useRef<number | null>(null);

  useEffect(() => {
    if (estaAbierto && imagenOriginal && worker) {
      setCargando(true);
      const copiaPixeles = new Uint8ClampedArray(imagenOriginal.pixeles);

      /*worker.onmessage = (e: MessageEvent) => {
        if (e.data.accion === 'GENERAR_SECUENCIAS') {
          setFotogramasGrisAlpha(e.data.secuencias.escalaGrisesAlpha);
          setFotogramasSaturacion(e.data.secuencias.saturacion);
          setCargando(false);
        }
      };*/

      const manejarMensajeWorker = (e : MessageEvent)=> {
        if (e.data.accion === 'GENERAR_SECUENCIAS') {
          setFotogramasGrisAlpha(e.data.secuencias.escalaGrisesAlpha);
          setFotogramasSaturacion(e.data.secuencias.saturacion);
          setCargando(false);
        }
      }

      worker.addEventListener('message', manejarMensajeWorker);

      worker.postMessage(
        {
          accion: 'GENERAR_SECUENCIAS',
          pixeles: copiaPixeles,
          ancho: imagenOriginal.ancho,
          alto: imagenOriginal.alto
        },
        [copiaPixeles.buffer]
      );
    }
  }, [estaAbierto, imagenOriginal, worker]);

  useEffect(() => {
    if (imagenOriginal && lienzoOriginalRef.current) {
      ServicioCanvas.renderizarEnCanvas(lienzoOriginalRef.current, imagenOriginal.pixeles, imagenOriginal.ancho, imagenOriginal.alto);
    }
  }, [imagenOriginal]);
  

  useEffect(() => {
    if (estaAbierto && imagenOriginal && worker) {
      setCargando(true);
      const copiaPixeles = new Uint8ClampedArray(imagenOriginal.pixeles);

      const manejarMensajeWorker = (e: MessageEvent) => {
        if (e.data.accion === 'GENERAR_SECUENCIAS') {
          setFotogramasGrisAlpha(e.data.secuencias.escalaGrisesAlpha);
          setFotogramasSaturacion(e.data.secuencias.saturacion);
          setCargando(false);
        }
      };

      worker.addEventListener('message', manejarMensajeWorker);

      worker.postMessage(
          {
            accion: 'GENERAR_SECUENCIAS',
            pixeles: copiaPixeles,
            ancho: imagenOriginal.ancho,
            alto: imagenOriginal.alto
          },
          [copiaPixeles.buffer]
      );

      return () => {
        worker.removeEventListener('message', manejarMensajeWorker);
      };
    }
  }, [estaAbierto, imagenOriginal, worker]);

  useEffect(() => {
    if (reproduciendo) {
      const timer = window.setInterval(() => {
        setIndiceActual((prev) => (prev + 1) % 6);
      }, 500);
      setTemporizador(timer);
    } else if (temporizador) {
      clearInterval(temporizador);
    }
    return () => {
      if (temporizador) clearInterval(temporizador);
    };
  }, [reproduciendo]);

  if (!estaAbierto) return null;

  const fotogramasActivos = pestanaActiva === 'escalaGrises' ? fotogramasGrisAlpha : fotogramasSaturacion;

  const exportarFotograma = (fotograma: FotogramaSecuenciaImagen, titulo: string) => {
    const lienzo = document.createElement('canvas');
    ServicioCanvas.renderizarEnCanvas(lienzo, fotograma.pixeles, fotograma.ancho, fotograma.alto);
    const enlace = document.createElement('a');
    enlace.download = `${titulo}-fotograma-${fotograma.indiceFotograma}.png`;
    enlace.href = lienzo.toDataURL('image/png');
    enlace.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-indigo-400">Visor de Secuencias Temporales y Devanados de Color</h2>
            <p className="text-xs text-slate-400">Portado de SecuenciaImage.java a TypeScript</p>
          </div>
          <button
            onClick={onCerrar}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Imagen Original</span>
              <div className="border border-slate-700 rounded-lg bg-slate-950 p-2">
                <canvas
                    ref={(nodo) => {
                      if (nodo && imagenOriginal) {
                        ServicioCanvas.renderizarEnCanvas(
                            nodo,
                            imagenOriginal.pixeles,
                            imagenOriginal.ancho,
                            imagenOriginal.alto
                        );
                      }
                    }}
                    className="h-32 object-contain rounded"
                />
              </div>
              <span className="text-xs text-slate-400">
                Dimensiones: {imagenOriginal?.ancho} &times; {imagenOriginal?.alto} px
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setPestanaActiva('escalaGrises')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    pestanaActiva === 'escalaGrises' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Secuencia 1: Grises con Opacidad Progresiva
                </button>
                <button
                  onClick={() => setPestanaActiva('saturacion')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    pestanaActiva === 'saturacion' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Secuencia 2: Interpolación de Saturación
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setReproduciendo(!reproduciendo)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {reproduciendo ? 'Pausar Animación' : 'Reproducir Animación'}
                </button>
                {reproduciendo && (
                  <span className="text-xs text-emerald-400 font-medium">
                    Reproduciendo fotograma {indiceActual + 1} / 6
                  </span>
                )}
              </div>
            </div>
          </div>

          {cargando ? (
            <div className="flex justify-center items-center py-20 text-indigo-400 font-semibold text-sm">
              Generando los 12 fotogramas en Web Worker...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                {pestanaActiva === 'escalaGrises' ? 'Secuencia 1: Grises y Alfa' : 'Secuencia 2: Saturación Progresiva'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {fotogramasActivos.map((fotograma, idx) => (
                  <div
                    key={fotograma.indiceFotograma}
                    className={`bg-slate-800/80 p-3 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                      reproduciendo && indiceActual === idx ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-slate-300">{fotograma.etiqueta}</span>
                    <div
                      className="w-full h-32 rounded-lg flex items-center justify-center p-1 overflow-hidden"
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        backgroundColor: '#0f172a'
                      }}
                    >
                      <canvas
                        ref={(node) => {
                          if (node) {
                            ServicioCanvas.renderizarEnCanvas(node, fotograma.pixeles, fotograma.ancho, fotograma.alto);
                          }
                        }}
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    </div>
                    <button
                      onClick={() => exportarFotograma(fotograma, pestanaActiva)}
                      className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-semibold rounded transition-colors"
                    >
                      Exportar PNG
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
