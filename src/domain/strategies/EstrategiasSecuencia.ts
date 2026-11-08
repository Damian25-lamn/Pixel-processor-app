export interface FotogramaSecuenciaImagen {
  indiceFotograma: number;
  etiqueta: string;
  pixeles: Uint8ClampedArray;
  ancho: number;
  alto: number;
}

export class EstrategiasSecuencia {
  static generarEscalaGrisesAlpha(pixeles: Uint8ClampedArray, ancho: number, alto: number): FotogramaSecuenciaImagen[] {
    const fotogramas: FotogramaSecuenciaImagen[] = [];
    for (let i = 0; i < 6; i++) {
      const factor = i / 5;
      const pixelesFotograma = new Uint8ClampedArray(pixeles.length);
      for (let p = 0; p < pixeles.length; p += 4) {
        const r = pixeles[p];
        const g = pixeles[p + 1];
        const b = pixeles[p + 2];
        const a = pixeles[p + 3];
        const gris = Math.floor((r + g + b) / 3);
        pixelesFotograma[p] = gris;
        pixelesFotograma[p + 1] = gris;
        pixelesFotograma[p + 2] = gris;
        pixelesFotograma[p + 3] = Math.floor(a * factor);
      }
      fotogramas.push({
        indiceFotograma: i,
        etiqueta: `Alfa: ${Math.round(factor * 100)}%`,
        pixeles: pixelesFotograma,
        ancho,
        alto
      });
    }
    return fotogramas;
  }

  static generarSaturacion(pixeles: Uint8ClampedArray, ancho: number, alto: number): FotogramaSecuenciaImagen[] {
    const fotogramas: FotogramaSecuenciaImagen[] = [];
    for (let i = 0; i < 6; i++) {
      const s = i * 0.20;
      const pixelesFotograma = new Uint8ClampedArray(pixeles.length);
      for (let p = 0; p < pixeles.length; p += 4) {
        const r = pixeles[p];
        const g = pixeles[p + 1];
        const b = pixeles[p + 2];
        const a = pixeles[p + 3];
        const gris = Math.floor((r + g + b) / 3);

        const nr = Math.min(255, Math.max(0, Math.floor(gris + s * (r - gris))));
        const ng = Math.min(255, Math.max(0, Math.floor(gris + s * (g - gris))));
        const nb = Math.min(255, Math.max(0, Math.floor(gris + s * (b - gris))));

        pixelesFotograma[p] = nr;
        pixelesFotograma[p + 1] = ng;
        pixelesFotograma[p + 2] = nb;
        pixelesFotograma[p + 3] = a;
      }
      fotogramas.push({
        indiceFotograma: i,
        etiqueta: `Saturación: ${Math.round(s * 100)}%`,
        pixeles: pixelesFotograma,
        ancho,
        alto
      });
    }
    return fotogramas;
  }
}
