export interface EstrategiaFiltroImagen {
  nombre: string;
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number, parametros?: Record<string, any>): Uint8ClampedArray;
}
