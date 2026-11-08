import { useEffect, useState } from 'react';
import { Encabezado } from './presentation/components/Encabezado';
import { SelectorSintetico } from './presentation/components/SelectorSintetico.tsx';
import { CargadorArchivos } from './presentation/components/CargadorArchivos';
import { PanelFiltros } from './presentation/components/PanelFiltros.tsx';
import { PanelRendimiento } from './presentation/components/PanelRendimiento';
import { VisualizadorAntesDespues } from './presentation/components/VisualizadorAntesDespues.tsx';
import { ModalSecuencias } from './presentation/components/ModalSecuencias';
import { ModalMatrizColor } from './presentation/components/ModalMatrizColor';
import { usarProcesadorImagen } from './presentation/hooks/usarProcesadorImagen.ts';

export function App() {
  const {
    imagenOriginal,
    imagenProcesada,
    filtroSeleccionado,
    setFiltroSeleccionado,
    rendimiento,
    estaProcesando,
    esEscalaGrisesImagen,
    cargarImagenSintetica,
    cargarArchivo,
    aplicarFiltroPersonalizado,
    obtenerWorker
  } = usarProcesadorImagen();

  const [estaModalAbierto, setEstaModalAbierto] = useState(false);
  const [estaMatrizColorAbierta, setEstaMatrizColorAbierta] = useState(false);
  const [idEfectoMatrizColor, setIdEfectoMatrizColor] = useState<number>(1);
  const [notificacionDescartada, setNotificacionDescartada] = useState(false);

  useEffect(() => {
    setNotificacionDescartada(false);
  }, [imagenOriginal]);

  const aplicarPseudocolor = () => {
    setFiltroSeleccionado('pseudocolor');
    setNotificacionDescartada(true);
  };

  const seleccionarEfectoMatrizColor = (idEfecto: number) => {
    setIdEfectoMatrizColor(idEfecto);
    aplicarFiltroPersonalizado('matriz-color', { numEfecto: idEfecto });
    setEstaMatrizColorAbierta(false);
  };

  return (
      <div className="h-screen w-screen bg-[#0b0f19] text-slate-100 p-4 flex flex-col gap-4 font-sans overflow-hidden">
        <Encabezado />

        <main className="flex-1 max-w-[1700px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

          {/* COLUMNA IZQUIERDA (3 columnas) */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-y-auto">
            <SelectorSintetico onSelectPattern={cargarImagenSintetica} />

            <button
                onClick={() => setEstaModalAbierto(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Ver Secuencias Temporales</span>
            </button>

            <CargadorArchivos onArchivoCargado={cargarArchivo} />
          </aside>

          {/* COLUMNA CENTRAL (6 columnas) */}
          <section className="col-span-12 lg:col-span-6 flex flex-col gap-3 min-h-0">
            {esEscalaGrisesImagen && filtroSeleccionado !== 'pseudocolor' && !notificacionDescartada && (
                <div className="bg-indigo-950/80 border border-indigo-500/50 p-3 rounded-xl flex items-center justify-between gap-4 shadow-lg shrink-0">
              <span className="text-xs font-medium text-indigo-200">
                ✨ Imagen monocromática detectada — ¿Aplicar filtro de coloreado sintético?
              </span>
                  <div className="flex items-center gap-2">
                    <button
                        onClick={aplicarPseudocolor}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Aplicar Pseudocolor
                    </button>
                    <button
                        onClick={() => setNotificacionDescartada(true)}
                        className="px-2 py-1 text-indigo-300 hover:text-white hover:bg-indigo-900/50 text-xs font-bold rounded-lg"
                        title="Descartar aviso"
                    >
                      ✕
                    </button>
                  </div>
                </div>
            )}

            {/* Única área del visor */}
            <div className="flex-1 bg-[#151c2c] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col min-h-0 overflow-hidden">
              <VisualizadorAntesDespues original={imagenOriginal} procesado={imagenProcesada} />
            </div>
          </section>

          {/* COLUMNA DERECHA (3 columnas) */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-y-auto">
            <PanelFiltros
                filtroActual={filtroSeleccionado}
                onSeleccionarFiltro={aplicarFiltroPersonalizado}
                onAbrirMatrizColor={() => setEstaMatrizColorAbierta(true)}
            />
            <PanelRendimiento rendimiento={rendimiento} estaProcesando={estaProcesando} />
          </aside>

        </main>

        {/* Modal de Secuencias */}
        <ModalSecuencias
            estaAbierto={estaModalAbierto}
            onCerrar={() => setEstaModalAbierto(false)}
            imagenOriginal={imagenOriginal}
            worker={obtenerWorker()}
        />

        <ModalMatrizColor
            estaAbierto={estaMatrizColorAbierta}
            onCerrar={() => setEstaMatrizColorAbierta(false)}
            imagenOriginal={imagenOriginal}
            idEfectoActual={idEfectoMatrizColor}
            onSeleccionarEfecto={seleccionarEfectoMatrizColor}
        />
      </div>
  );
}

export default App;