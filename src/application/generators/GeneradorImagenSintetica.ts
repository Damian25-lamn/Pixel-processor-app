export class GeneradorImagenSintetica {
  static generar(idPatron: number, ancho: number = 200, alto: number = 200): { pixeles: Uint8ClampedArray; ancho: number; alto: number } {
    const pixeles = new Uint8ClampedArray(ancho * alto * 4);
    const maxDist = Math.hypot(ancho / 2, alto / 2);

    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        const indice = (y * ancho + x) * 4;

        let r = 255;
        let g = 255;
        let b = 255;
        let a = 255;

        if (idPatron === 0) {
          const dist1 = Math.hypot(x - 100, y - 50);
          const dist2 = Math.hypot(x - 100, y - 150);
          if (dist1 <= 35 || dist2 <= 35) {
            r = 255;
            g = 255;
            b = 0;
          }
        } else if (idPatron === 1) {
          if (x % 40 < 10) {
            r = 0;
            g = 0;
            b = 0;
          }
        } else if (idPatron === 2) {
          const dist = Math.hypot(x - 100, y - 100);
          const norm = Math.min(1, dist / maxDist);
          r = Math.floor(Math.sin(norm * Math.PI) * 255);
          g = Math.floor(Math.cos((norm * Math.PI) / 2) * 255);
          b = Math.floor(norm * 255);
        } else if (idPatron === 3) {
          const dist = Math.hypot(x - 100, y - 100);
          if (Math.floor(dist / 20) % 2 === 0) {
            r = 0;
            g = 0;
            b = 0;
          }
        } else if (idPatron === 4) {
          if (Math.floor(x / 20 + y / 20) % 4 === 0) {
            r = 0;
            g = 0;
            b = 0;
          }
        }

        pixeles[indice] = r;
        pixeles[indice + 1] = g;
        pixeles[indice + 2] = b;
        pixeles[indice + 3] = a;
      }
    }

    return { pixeles, ancho, alto };
  }
}
