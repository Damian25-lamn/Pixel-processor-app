import { EstrategiaFiltroImagen } from './EstrategiaFiltroImagen';

export class EstrategiaEscalaGrises implements EstrategiaFiltroImagen {
  nombre = 'Escala de Grises';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number): Uint8ClampedArray {
    const salida = new Uint8ClampedArray(pixeles.length);
    for (let i = 0; i < pixeles.length; i += 4) {
      const gris = Math.floor((pixeles[i] + pixeles[i + 1] + pixeles[i + 2]) / 3);
      salida[i] = salida[i + 1] = salida[i + 2] = gris;
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaNegativo implements EstrategiaFiltroImagen {
  nombre = 'Negativo / Inversión';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number): Uint8ClampedArray {
    const salida = new Uint8ClampedArray(pixeles.length);
    for (let i = 0; i < pixeles.length; i += 4) {
      salida[i] = 255 - pixeles[i];
      salida[i + 1] = 255 - pixeles[i + 1];
      salida[i + 2] = 255 - pixeles[i + 2];
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaBrilloContraste implements EstrategiaFiltroImagen {
  nombre = 'Brillo y Contraste';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number, parametros?: { brillo?: number; contraste?: number }): Uint8ClampedArray {
    const brillo = parametros?.brillo ?? 0;
    const factorContraste = parametros?.contraste ?? 0;
    const contraste = Math.pow((100 + factorContraste) / 100, 2);
    const salida = new Uint8ClampedArray(pixeles.length);

    for (let i = 0; i < pixeles.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let v = pixeles[i + c] / 255.0;
        v = (v - 0.5) * contraste + 0.5;
        let ajustado = Math.floor(v * 255) + brillo;
        salida[i + c] = Math.min(255, Math.max(0, ajustado));
      }
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaBlancoNegro implements EstrategiaFiltroImagen {
  nombre = 'Blanco y Negro (Umbral)';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number, parametros?: { umbral?: number }): Uint8ClampedArray {
    const umbral = parametros?.umbral ?? 128;
    const salida = new Uint8ClampedArray(pixeles.length);
    for (let i = 0; i < pixeles.length; i += 4) {
      const gris = (pixeles[i] + pixeles[i + 1] + pixeles[i + 2]) / 3;
      const val = gris >= umbral ? 255 : 0;
      salida[i] = salida[i + 1] = salida[i + 2] = val;
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaCuantizacionNiveles implements EstrategiaFiltroImagen {
  nombre = 'Niveles de Color (Cuantización)';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number, parametros?: { niveles?: number }): Uint8ClampedArray {
    const niveles = parametros?.niveles ?? 16;
    const salida = new Uint8ClampedArray(pixeles.length);
    const paso = 256 / niveles;
    const escala = niveles > 1 ? 255 / (niveles - 1) : 255;
    for (let i = 0; i < pixeles.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        salida[i + c] = Math.min(255, Math.floor(Math.floor(pixeles[i + c] / paso) * escala));
      }
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaReduccionBits implements EstrategiaFiltroImagen {
  nombre = 'Reducción de Profundidad de Bits';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number, parametros?: { bits?: number }): Uint8ClampedArray {
    const bits = parametros?.bits ?? 4;
    const shift = 8 - bits;
    const salida = new Uint8ClampedArray(pixeles.length);
    for (let i = 0; i < pixeles.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        salida[i + c] = (pixeles[i + c] >> shift) << shift;
      }
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaEnfasisColor implements EstrategiaFiltroImagen {
  nombre = 'Énfasis Fondo de Color';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number, parametros?: { min?: number; max?: number }): Uint8ClampedArray {
    const min = parametros?.min ?? 100;
    const max = parametros?.max ?? 200;
    const salida = new Uint8ClampedArray(pixeles.length);
    for (let i = 0; i < pixeles.length; i += 4) {
      const gris = (pixeles[i] + pixeles[i + 1] + pixeles[i + 2]) / 3;
      if (gris >= min && gris <= max) {
        salida[i] = pixeles[i];
        salida[i + 1] = pixeles[i + 1];
        salida[i + 2] = pixeles[i + 2];
      } else {
        salida[i] = salida[i + 1] = salida[i + 2] = 50;
      }
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaPseudocolor implements EstrategiaFiltroImagen {
  nombre = 'Falsos Colores (Pseudocolor)';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number): Uint8ClampedArray {
    const salida = new Uint8ClampedArray(pixeles.length);
    for (let i = 0; i < pixeles.length; i += 4) {
      const r = pixeles[i];
      const g = pixeles[i + 1];
      const b = pixeles[i + 2];
      const a = pixeles[i + 3];
      const intensidad = Math.round((r + g + b) / 3);
      salida[i] = intensidad;
      salida[i + 1] = Math.floor(intensidad * 0.5);
      salida[i + 2] = 255 - intensidad;
      salida[i + 3] = a;
    }
    return salida;
  }
}

export class EstrategiaMapaPerdida implements EstrategiaFiltroImagen {
  nombre = 'Mapa de Pérdida por Cuantización';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number, parametros?: { niveles?: number }): Uint8ClampedArray {
    const niveles = parametros?.niveles ?? 16;
    const salida = new Uint8ClampedArray(pixeles.length);
    const paso = 256 / niveles;
    const escala = niveles > 1 ? 255 / (niveles - 1) : 255;
    for (let i = 0; i < pixeles.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const v = pixeles[i + c];
        const cuantizado = Math.min(255, Math.floor(Math.floor(v / paso) * escala));
        salida[i + c] = Math.abs(v - cuantizado);
      }
      salida[i + 3] = pixeles[i + 3];
    }
    return salida;
  }
}

export class EstrategiaSepia implements EstrategiaFiltroImagen {
  nombre = 'Matriz de Color (Sepia)';
  aplicar(pixeles: Uint8ClampedArray, ancho: number, alto: number): Uint8ClampedArray {
    const salida = new Uint8ClampedArray(pixeles.length);
    for (let i = 0; i < pixeles.length; i += 4) {
      const r = pixeles[i];
      const g = pixeles[i + 1];
      const b = pixeles[i + 2];
      const a = pixeles[i + 3];
      salida[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      salida[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      salida[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      salida[i + 3] = a;
    }
    return salida;
  }
}
