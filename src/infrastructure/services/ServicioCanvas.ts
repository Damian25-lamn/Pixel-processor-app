export class ServicioCanvas {
  static async cargarImagen(archivo: File): Promise<{ pixeles: Uint8ClampedArray; ancho: number; alto: number }> {
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader();
      lector.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const lienzo = document.createElement('canvas');
          lienzo.width = img.width;
          lienzo.height = img.height;
          const contexto = lienzo.getContext('2d');
          if (!contexto) {
            rechazar(new Error('No se pudo obtener contexto 2D'));
            return;
          }
          contexto.drawImage(img, 0, 0);
          const datosImagen = contexto.getImageData(0, 0, img.width, img.height);
          resolver({
            pixeles: datosImagen.data,
            ancho: img.width,
            alto: img.height
          });
        };
        img.onerror = rechazar;
        img.src = e.target?.result as string;
      };
      lector.onerror = rechazar;
      lector.readAsDataURL(archivo);
    });
  }

  static renderizarEnCanvas(lienzo: HTMLCanvasElement, pixeles: Uint8ClampedArray, ancho: number, alto: number): void {
    lienzo.width = ancho;
    lienzo.height = alto;
    const contexto = lienzo.getContext('2d');
    if (!contexto) return;
    const datosImagen = new ImageData(new Uint8ClampedArray(pixeles), ancho, alto);
    contexto.putImageData(datosImagen, 0, 0);
  }
}
