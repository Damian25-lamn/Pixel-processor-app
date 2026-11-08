import { 
  EstrategiaEscalaGrises, 
  EstrategiaNegativo, 
  EstrategiaBrilloContraste, 
  EstrategiaBlancoNegro, 
  EstrategiaCuantizacionNiveles, 
  EstrategiaReduccionBits, 
  EstrategiaEnfasisColor, 
  EstrategiaPseudocolor, 
  EstrategiaMapaPerdida, 
  //EstrategiaSepia,
  EstrategiaMatrizColor,
  EstrategiaKernel
} from '../../domain/strategies';
import { EstrategiaFiltroImagen } from '../../domain/strategies/EstrategiaFiltroImagen';
import { EstrategiasSecuencia, FotogramaSecuenciaImagen } from '../../domain/strategies/EstrategiasSecuencia';

const estrategias: Record<string, EstrategiaFiltroImagen> = {
  'escala-grises': new EstrategiaEscalaGrises(),
  'negativo': new EstrategiaNegativo(),
  'brillo-contraste': new EstrategiaBrilloContraste(),
  'blanco-negro': new EstrategiaBlancoNegro(),
  'cuantizacion-niveles': new EstrategiaCuantizacionNiveles(),
  'reduccion-bits': new EstrategiaReduccionBits(),
  'enfasis-color': new EstrategiaEnfasisColor(),
  'pseudocolor': new EstrategiaPseudocolor(),
  'mapa-perdida': new EstrategiaMapaPerdida(),
  //'sepia': new EstrategiaSepia(),
  'matriz-color': new EstrategiaMatrizColor(),
  'convolucion': new EstrategiaKernel()
};

function procesarYResponder(
  estrategia: EstrategiaFiltroImagen,
  pixeles: Uint8ClampedArray,
  ancho: number,
  alto: number,
  parametros?: Record<string, any>
): void {
  const inicio = performance.now();
  const pixelesProcesados = estrategia.aplicar(pixeles, ancho, alto, parametros);
  const fin = performance.now();

  const tiempoEjecucion = fin - inicio;
  const totalPixeles = ancho * alto;
  const megapixeles = totalPixeles / 1_000_000;
  const mpPorSegundo = tiempoEjecucion > 0 ? megapixeles / (tiempoEjecucion / 1000) : 0;

  self.postMessage(
    {
      pixeles: pixelesProcesados,
      ancho,
      alto,
      rendimiento: {
        tiempoEjecucionMs: Number(tiempoEjecucion.toFixed(2)),
        mpPorSegundo: Number(mpPorSegundo.toFixed(2))
      }
    },
    [pixelesProcesados.buffer]
  );
}

self.onmessage = (e: MessageEvent) => {
  const { accion, claveFiltro, pixeles, ancho, alto, parametros, idEfecto, kernel, matrix, divisor, offset, tamanio, tipoEfecto } = e.data;

  if (accion === 'GENERAR_SECUENCIAS') {
    const inicio = performance.now();
    const escalaGrisAlpha = EstrategiasSecuencia.generarEscalaGrisesAlpha(pixeles, ancho, alto);
    const saturacion = EstrategiasSecuencia.generarSaturacion(pixeles, ancho, alto);
    const fin = performance.now();

    const tiempoEjecucion = fin - inicio;
    const totalPixeles = ancho * alto * 12;
    const megapixeles = totalPixeles / 1_000_000;
    const mpPorSegundo = tiempoEjecucion > 0 ? megapixeles / (tiempoEjecucion / 1000) : 0;

    const buffersTransferencia = [
      ...escalaGrisAlpha.map((f: FotogramaSecuenciaImagen) => f.pixeles.buffer),
      ...saturacion.map((f: FotogramaSecuenciaImagen) => f.pixeles.buffer)
    ];

    self.postMessage(
      {
        accion: 'GENERAR_SECUENCIAS',
        secuencias: { escalaGrisesAlpha: escalaGrisAlpha, saturacion },
        rendimiento: {
          tiempoEjecucionMs: Number(tiempoEjecucion.toFixed(2)),
          mpPorSegundo: Number(mpPorSegundo.toFixed(2))
        }
      },
      buffersTransferencia
    );
    return;
  }

  if (accion === 'APLICAR_MATRIZ_COLOR') {
    procesarYResponder(new EstrategiaMatrizColor(), pixeles, ancho, alto, {
      ...parametros,
      numEfecto: idEfecto
    });
    return;
  }

  if (accion === 'APLICAR_KERNEL') {
    procesarYResponder(new EstrategiaKernel(), pixeles, ancho, alto, {
      tamanio,
      tipoEfecto,
      matrix: matrix ?? kernel,
      divisor,
      offset
    });
    return;
  }

  const estrategia = estrategias[claveFiltro];
  if (!estrategia) {
    self.postMessage({ error: 'Filtro no encontrado' });
    return;
  }

  procesarYResponder(estrategia, pixeles, ancho, alto, parametros);
};
