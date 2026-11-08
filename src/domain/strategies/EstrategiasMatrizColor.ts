import { EstrategiaFiltroImagen } from './EstrategiaFiltroImagen';

export type CategoriaEfectoMatrizColor = 'general' | 'enfasis-oscuro' | 'enfasis-claro';

export interface DefinicionEfectoMatrizColor {
  id: number;
  nombre: string;
  categoria: CategoriaEfectoMatrizColor;
  colorBase?: readonly [number, number, number];
}

const AZUL_1 = [152, 182, 255] as const;
const NARANJA_2 = [255, 170, 124] as const;
const GRIS_3 = [165, 165, 165] as const;
const ORO_4 = [255, 242, 107] as const;
const AZUL_5 = [151, 210, 255] as const;
const VERDE_6 = [193, 255, 166] as const;
const GRIS_CLARO = [217, 217, 217] as const;

const COLORES_ENFASIS_OSCURO = [AZUL_1, NARANJA_2, GRIS_3, ORO_4, AZUL_5, VERDE_6] as const;
const COLORES_ENFASIS_CLARO = [AZUL_1, NARANJA_2, GRIS_3, ORO_4, AZUL_5, VERDE_6, GRIS_CLARO] as const;

const NOMBRES_ENFASIS_OSCURO = [
  'Énfasis Azul Oscuro',
  'Énfasis Naranja Oscuro',
  'Énfasis Gris Oscuro',
  'Énfasis Oro Oscuro',
  'Énfasis Celeste Oscuro',
  'Énfasis Verde Oscuro'
];

const NOMBRES_ENFASIS_CLARO = [
  'Decolorado Azul',
  'Decolorado Naranja',
  'Decolorado Gris',
  'Decolorado Oro',
  'Decolorado Celeste',
  'Decolorado Verde',
  'Decolorado Gris Claro'
];

export const EFECTOS_MATRIZ_COLOR: DefinicionEfectoMatrizColor[] = [
  { id: 1, nombre: 'Grises', categoria: 'general' },
  { id: 2, nombre: 'Sepia Estándar', categoria: 'general' },
  { id: 3, nombre: 'Decolorar / Lavado', categoria: 'general' },
  { id: 4, nombre: 'Blanco y Negro 25%', categoria: 'general' },
  { id: 5, nombre: 'Blanco y Negro 50%', categoria: 'general' },
  { id: 6, nombre: 'Blanco y Negro 75%', categoria: 'general' },
  { id: 7, nombre: 'Azul Grisáceo', categoria: 'general' },
  ...NOMBRES_ENFASIS_OSCURO.map((nombre, indice) => ({
    id: 8 + indice,
    nombre,
    categoria: 'enfasis-oscuro' as const,
    colorBase: COLORES_ENFASIS_OSCURO[indice]
  })),
  ...NOMBRES_ENFASIS_CLARO.map((nombre, indice) => ({
    id: 14 + indice,
    nombre,
    categoria: 'enfasis-claro' as const,
    colorBase: COLORES_ENFASIS_CLARO[indice]
  }))
];

export function obtenerDefinicionEfecto(idEfecto: number): DefinicionEfectoMatrizColor | undefined {
  return EFECTOS_MATRIZ_COLOR.find((efecto) => efecto.id === idEfecto);
}

function limitar(valor: number): number {
  return Math.min(255, Math.max(0, valor));
}

export class EstrategiaMatrizColor implements EstrategiaFiltroImagen {
  nombre = 'Matriz de Color (20 efectos)';

  aplicar(
    pixeles: Uint8ClampedArray,
    ancho: number,
    alto: number,
    parametros?: { numEfecto?: number }
  ): Uint8ClampedArray {
    const numEfecto = Math.min(20, Math.max(1, Math.floor(parametros?.numEfecto ?? 1)));
    const salida = new Uint8ClampedArray(pixeles.length);
    const definicion = obtenerDefinicionEfecto(numEfecto);
    const colorBase = definicion?.colorBase;
    const alfa = 1.0;

    for (let i = 0; i < pixeles.length; i += 4) {
      const r = pixeles[i];
      const g = pixeles[i + 1];
      const b = pixeles[i + 2];
      const gris = Math.floor(0.2126 * r + 0.7152 * g + 0.0722 * b);

      let nr: number;
      let ng: number;
      let nb: number;

      if (numEfecto === 1) {
        nr = ng = nb = gris;
      } else if (numEfecto === 2) {
        nr = Math.min(255, Math.floor((gris * 238) / 255));
        ng = Math.min(255, Math.floor((gris * 218) / 255));
        nb = Math.min(255, Math.floor((gris * 195) / 255));
      } else if (numEfecto === 3) {
        nr = Math.min(255, Math.floor(r * 0.4 + 195));
        ng = Math.min(255, Math.floor(g * 0.4 + 195));
        nb = Math.min(255, Math.floor(b * 0.4 + 195));
      } else if (numEfecto === 4 || numEfecto === 5 || numEfecto === 6) {
        const umbral = numEfecto === 4 ? 64 : numEfecto === 5 ? 128 : 191;
        const valor = gris < umbral ? 0 : 255;
        nr = ng = nb = valor;
      } else if (numEfecto === 7) {
        nr = Math.floor((gris * 191) / 255);
        ng = Math.floor((gris * 198) / 255);
        nb = Math.floor((gris * 218) / 255);
      } else if (numEfecto >= 8 && numEfecto <= 13 && colorBase) {
        const [tr, tg, tb] = colorBase;
        const rBase = (gris * tr) / 255;
        const gBase = (gris * tg) / 255;
        const bBase = (gris * tb) / 255;
        nr = limitar(Math.floor(gris * (1 - alfa) + rBase * alfa));
        ng = limitar(Math.floor(gris * (1 - alfa) + gBase * alfa));
        nb = limitar(Math.floor(gris * (1 - alfa) + bBase * alfa));
      } else if (numEfecto >= 14 && numEfecto <= 20 && colorBase) {
        const [tr, tg, tb] = colorBase;
        const rBase = tr + (gris * (255 - tr)) / 255;
        const gBase = tg + (gris * (255 - tg)) / 255;
        const bBase = tb + (gris * (255 - tb)) / 255;
        nr = limitar(Math.floor(gris * (1 - alfa) + rBase * alfa));
        ng = limitar(Math.floor(gris * (1 - alfa) + gBase * alfa));
        nb = limitar(Math.floor(gris * (1 - alfa) + bBase * alfa));
      } else {
        nr = ng = nb = gris;
      }

      salida[i] = nr;
      salida[i + 1] = ng;
      salida[i + 2] = nb;
      salida[i + 3] = pixeles[i + 3];
    }

    return salida;
  }
}
