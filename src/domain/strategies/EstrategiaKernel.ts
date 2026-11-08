import { EstrategiaFiltroImagen } from './EstrategiaFiltroImagen';

export type TamanioKernel = '3x3' | '7x7' | '9x9';
export type TipoEfectoKernel = 'Box Blur' | 'Gaussian Blur' | 'Enfoque (Sharpen)' | 'Detección de Bordes' | 'Emboss';

export interface ConfigKernel {
  matrix: number[];
  divisor: number;
}

export interface ParametrosKernel {
  tamanio?: TamanioKernel;
  tipoEfecto?: TipoEfectoKernel;
  matrix?: number[];
  divisor?: number;
  offset?: number;
}

export interface KernelResuelto extends ConfigKernel {
  tamanio: TamanioKernel;
  offset: number;
}

export const TAMANIOS_KERNEL: TamanioKernel[] = ['3x3', '7x7', '9x9'];

export const TIPOS_EFECTO_KERNEL: TipoEfectoKernel[] = [
  'Box Blur',
  'Gaussian Blur',
  'Enfoque (Sharpen)',
  'Detección de Bordes',
  'Emboss'
];

export const LADOS_KERNEL: Record<TamanioKernel, number> = {
  '3x3': 3,
  '7x7': 7,
  '9x9': 9
};

const GAUSSIANO_7X7 = [
  1, 1, 2, 2, 2, 1, 1,
  1, 2, 4, 4, 4, 2, 1,
  2, 4, 8, 8, 8, 4, 2,
  2, 4, 8, 16, 8, 4, 2,
  2, 4, 8, 8, 8, 4, 2,
  1, 2, 4, 4, 4, 2, 1,
  1, 1, 2, 2, 2, 1, 1
];

function crearKernelRealce(lado: number, centro: number): ConfigKernel {
  const total = lado * lado;
  const matrix = new Array<number>(total).fill(-1);
  matrix[(total - 1) / 2] = centro;
  return { matrix, divisor: 1 };
}

function crearGaussianaEntera(lado: number): ConfigKernel {
  const radio = (lado - 1) / 2;
  const sigma = radio / 2;
  const crudos: number[] = [];
  let maximo = 0;

  for (let y = -radio; y <= radio; y++) {
    for (let x = -radio; x <= radio; x++) {
      const peso = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      crudos.push(peso);
      if (peso > maximo) maximo = peso;
    }
  }

  const matrix = crudos.map((peso) => Math.max(1, Math.round((peso / maximo) * 128)));
  const divisor = matrix.reduce((total, valor) => total + valor, 0);

  return { matrix, divisor };
}

function crearKernelEmboss(n: number): ConfigKernel {
  const matrix: number[] = [];
  const centro = Math.floor(n / 2);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const sumaPos = r + c;
      const diagonalPrincipal = 2 * centro;

      if (sumaPos < diagonalPrincipal) {
        // Zona superior-izquierda (Valores negativos)
        matrix.push(r === c ? -2 : -1);
      } else if (sumaPos > diagonalPrincipal) {
        // Zona inferior-derecha (Valores positivos)
        matrix.push(r === c ? 2 : 1);
      } else {
        // Diagonal secundaria y centro
        matrix.push(r === centro && c === centro ? 1 : 0);
      }
    }
  }
  return {matrix, divisor: 1};
}

export const KERNELS: Record<TamanioKernel, Record<TipoEfectoKernel, ConfigKernel>> = {
  '3x3': {
    'Box Blur': {
      matrix: [
          1, 1, 1,
          1, 1, 1,
          1, 1, 1],
      divisor: 9
    },
    'Gaussian Blur': {
      matrix: [1, 2, 1,
               2, 4, 2,
               1, 2, 1],
      divisor: 16
    },
    'Enfoque (Sharpen)': {
      matrix: [0, -1, 0,
              -1, 5, -1,
               0, -1, 0],
      divisor: 1
    },
    'Detección de Bordes': {
      matrix: [
          -1, -1, -1,
          -1, 8, -1,
          -1, -1, -1],
      divisor: 1
    },
    'Emboss': {
      matrix: [
        -2, -1,  0,
        -1,  1,  1,
         0,  1,  2],
      divisor: 1
    }
  },

  '7x7': {
    'Box Blur': {
      matrix: new Array(49).fill(1),
      divisor: 49
    },
    'Gaussian Blur': {
      matrix: [...GAUSSIANO_7X7],
      divisor: 172
    },
    'Enfoque (Sharpen)': crearKernelRealce(7, 49),
    'Detección de Bordes': crearKernelRealce(7, 48),
    'Emboss': crearKernelEmboss(7)
  },
  '9x9': {
    'Box Blur': {
      matrix: new Array(81).fill(1),
      divisor: 81
    },
    'Gaussian Blur': crearGaussianaEntera(9),
    'Enfoque (Sharpen)': crearKernelRealce(9, 81),
    'Detección de Bordes': crearKernelRealce(9, 80),
    'Emboss': crearKernelEmboss(9)
  }
};

function normalizarMatriz(matrix: number[] | undefined, longitud: number): number[] {
  const normalizada = new Array<number>(longitud).fill(0);
  if (!Array.isArray(matrix)) return normalizada;

  for (let i = 0; i < longitud; i++) {
    const valor = Number(matrix[i]);
    normalizada[i] = Number.isFinite(valor) ? valor : 0;
  }
  return normalizada;
}

export function resolverParametrosKernel(parametros?: ParametrosKernel): KernelResuelto {
  const tamanio = parametros?.tamanio && KERNELS[parametros.tamanio]
    ? parametros.tamanio
    : '3x3';
  const tipoEfecto = parametros?.tipoEfecto;

  if (tipoEfecto && KERNELS[tamanio][tipoEfecto]) {
    const config = KERNELS[tamanio][tipoEfecto];
    return {
      tamanio,
      matrix: [...config.matrix],
      divisor: config.divisor,
      offset: 0
    };
  }

  const lado = LADOS_KERNEL[tamanio];
  const tieneMatrizPersonalizada = Array.isArray(parametros?.matrix) && parametros.matrix.length === lado * lado;

  if (!tieneMatrizPersonalizada) {
    const config = KERNELS[tamanio]['Enfoque (Sharpen)'];
    return {
      tamanio,
      matrix: [...config.matrix],
      divisor: config.divisor,
      offset: 0
    };
  }

  const divisorIngresado = Number(parametros?.divisor ?? 1);
  const offsetIngresado = Number(parametros?.offset ?? 0);

  return {
    tamanio,
    matrix: normalizarMatriz(parametros?.matrix, lado * lado),
    divisor: Number.isFinite(divisorIngresado) && divisorIngresado !== 0 ? divisorIngresado : 1,
    offset: Number.isFinite(offsetIngresado) ? offsetIngresado : 0
  };
}

export function crearParametrosKernelPorDefecto(): ParametrosKernel {
  const config = KERNELS['3x3']['Enfoque (Sharpen)'];
  return {
    tamanio: '3x3',
    tipoEfecto: 'Enfoque (Sharpen)',
    matrix: [...config.matrix],
    divisor: config.divisor,
    offset: 0
  };
}

export class EstrategiaKernel implements EstrategiaFiltroImagen {
  nombre = 'Convolución por Matriz (Kernels)';

  aplicar(
    pixeles: Uint8ClampedArray,
    ancho: number,
    alto: number,
    parametros?: Record<string, any>
  ): Uint8ClampedArray {
    const { tamanio, matrix, divisor, offset } = resolverParametrosKernel(parametros as ParametrosKernel);
    const lado = LADOS_KERNEL[tamanio];
    const radio = (lado - 1) / 2;
    const salida = new Uint8ClampedArray(pixeles.length);
    const filaBytes = ancho * 4;
    const ultimaColumna = ancho - 1;
    const ultimaFila = alto - 1;
    const filasDesplazamiento = new Int32Array(lado);

    if (ancho <= 0 || alto <= 0 || matrix.length !== lado * lado) {
      return salida;
    }

    for (let y = 0; y < alto; y++) {
      for (let ky = 0; ky < lado; ky++) {
        const fila = y + ky - radio;
        const filaLimitada = fila < 0 ? 0 : fila > ultimaFila ? ultimaFila : fila;
        filasDesplazamiento[ky] = filaLimitada * filaBytes;
      }

      for (let x = 0; x < ancho; x++) {
        let sumaR = 0;
        let sumaG = 0;
        let sumaB = 0;
        let k = 0;

        for (let ky = 0; ky < lado; ky++) {
          const baseFila = filasDesplazamiento[ky];

          for (let kx = 0; kx < lado; kx++) {
            const columna = x + kx - radio;
            const columnaLimitada = columna < 0 ? 0 : columna > ultimaColumna ? ultimaColumna : columna;
            const indiceP = baseFila + columnaLimitada * 4;
            const peso = matrix[k++];

            sumaR += pixeles[indiceP] * peso;
            sumaG += pixeles[indiceP + 1] * peso;
            sumaB += pixeles[indiceP + 2] * peso;
          }
        }

        const indice = y * filaBytes + x * 4;
        const r = Math.round(sumaR / divisor + offset);
        const g = Math.round(sumaG / divisor + offset);
        const b = Math.round(sumaB / divisor + offset);

        salida[indice] = r < 0 ? 0 : r > 255 ? 255 : r;
        salida[indice + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        salida[indice + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
        salida[indice + 3] = pixeles[indice + 3];
      }
    }

    return salida;
  }
}
