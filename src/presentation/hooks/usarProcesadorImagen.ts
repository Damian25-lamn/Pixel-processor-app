import { useState, useEffect, useRef, useCallback } from 'react';
import { GeneradorImagenSintetica } from '../../application/generators/GeneradorImagenSintetica';
import { ServicioCanvas } from '../../infrastructure/services/ServicioCanvas';
import { esEscalaGrises } from '../../application/services/analizadorImagen';

export interface EstadoImagen {
  pixeles: Uint8ClampedArray;
  ancho: number;
  alto: number;
}

export interface DatosRendimiento {
  tiempoEjecucionMs: number;
  mpPorSegundo: number;
}

export function usarProcesadorImagen() {
  const [imagenOriginal, setImagenOriginal] = useState<EstadoImagen | null>(null);
  const [imagenProcesada, setImagenProcesada] = useState<EstadoImagen | null>(null);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>('escala-grises');
  const [parametrosFiltro, setParametrosFiltro] = useState<Record<string, any>>({});
  const [rendimiento, setRendimiento] = useState<DatosRendimiento | null>(null);
  const [estaProcesando, setEstaProcesando] = useState<boolean>(false);
  const [esEscalaGrisesImagen, setEsEscalaGrises] = useState<boolean>(false);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
        new URL('../../infrastructure/workers/procesadorPixeles.worker.ts', import.meta.url),
        { type: 'module' }
    );
    workerRef.current = worker;

    const manejarMensajeWorker = (e: MessageEvent)=>{
      if (e.data.accion === 'GENERAR_SECUENCIAS') return;

      if (e.data.error) {
        setEstaProcesando(false);
        return;
      }

      if (e.data.pixeles) {
        const { pixeles, ancho, alto, rendimiento: rend } = e.data;
        setImagenProcesada({ pixeles, ancho, alto });
        setRendimiento(rend);
        setEstaProcesando(false);
      }
    };

    worker.addEventListener('message', manejarMensajeWorker);

    const inicial = GeneradorImagenSintetica.generar(0);
    setImagenOriginal(inicial);

    return () => {
      worker.removeEventListener('message', manejarMensajeWorker);
      workerRef.current?.terminate();
    };
  }, []);

  const ejecutarFiltro = useCallback((imagen: EstadoImagen, clave: string, parametros: Record<string, any>) => {
    if (!workerRef.current) return;
    setEstaProcesando(true);
    setEsEscalaGrises(esEscalaGrises(imagen.pixeles));
    const copiaPixeles = new Uint8ClampedArray(imagen.pixeles);

    const mensaje: Record<string, any> = {
      pixeles: copiaPixeles,
      ancho: imagen.ancho,
      alto: imagen.alto,
      parametros
    };

    if (clave === 'matriz-color') {
      mensaje.accion = 'APLICAR_MATRIZ_COLOR';
      mensaje.idEfecto = parametros?.numEfecto ?? 1;
    } else if (clave === 'convolucion') {
      mensaje.accion = 'APLICAR_KERNEL';
      mensaje.tamanio = parametros?.tamanio;
      mensaje.tipoEfecto = parametros?.tipoEfecto;
      mensaje.matrix = parametros?.matrix ?? parametros?.kernel;
      mensaje.divisor = parametros?.divisor;
      mensaje.offset = parametros?.offset;
    } else {
      mensaje.claveFiltro = clave;
    }

    workerRef.current.postMessage(mensaje, [copiaPixeles.buffer]);
  }, []);

  useEffect(() => {
    if (imagenOriginal) {
      ejecutarFiltro(imagenOriginal, filtroSeleccionado, parametrosFiltro);
    }
  }, [imagenOriginal, filtroSeleccionado, parametrosFiltro, ejecutarFiltro]);

  const cargarImagenSintetica = useCallback((idPatron: number) => {
    const sintetica = GeneradorImagenSintetica.generar(idPatron);
    setImagenOriginal(sintetica);
  }, []);

  const cargarArchivoSubido = useCallback(async (archivo: File) => {
    try {
      const img = await ServicioCanvas.cargarImagen(archivo);
      setImagenOriginal(img);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const aplicarFiltroPersonalizado = useCallback((clave: string, parametros: Record<string, any>) => {
    setFiltroSeleccionado(clave);
    setParametrosFiltro(parametros);
  }, []);

  return {
    imagenOriginal,
    imagenProcesada,
    filtroSeleccionado,
    setFiltroSeleccionado,
    rendimiento,
    estaProcesando,
    esEscalaGrisesImagen,
    cargarImagenSintetica,
    cargarArchivo: cargarArchivoSubido,
    aplicarFiltroPersonalizado,
    obtenerWorker: () => workerRef.current
  };
}
