export function esEscalaGrises(pixeles: Uint8ClampedArray): boolean {
  const tamanoMuestra = 1000;
  const paso = Math.max(1, Math.floor(pixeles.length / (tamanoMuestra * 4)));

  for (let i = 0; i < pixeles.length; i += paso * 4) {
    const r = pixeles[i];
    const g = pixeles[i + 1];
    const b = pixeles[i + 2];

    if (Math.abs(r - g) > 3 || Math.abs(g - b) > 3) {
      return false;
    }
  }

  return true;
}
