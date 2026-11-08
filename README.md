# Procesador de Imágenes por Píxel

Aplicación web para el procesamiento digital de imágenes a bajo nivel, desarrollada como parte del **Taller 2**.

**Autor:** Anthony Minda  
**Materia:** Taller 2  
**Tecnologías:** TypeScript, React, Vite, Tailwind CSS y Web Workers

## Aplicación desplegada

La aplicación está publicada en Netlify y puede utilizarse directamente desde el navegador, sin instalar dependencias:

**https://procesamiento-grafico.netlify.app/**

## Repositorio

**https://github.com/Damian25-lamn/Pixel-processor-app**

## Descripción

El proyecto implementa un procesador de imágenes que trabaja directamente sobre los canales RGBA de cada píxel. Toda la lógica de procesamiento se ejecuta en un Web Worker para mantener la interfaz fluida y evitar bloqueos durante las operaciones de convolución y generación de secuencias.

La aplicación permite cargar imágenes JPG o PNG, generar imágenes sintéticas de prueba, aplicar filtros de la rúbrica, comparar el resultado con la imagen original y medir el rendimiento del procesamiento.

## Funcionalidades

### Imágenes de entrada

- Generación de cinco imágenes sintéticas:
  - Círculos arriba/abajo.
  - Líneas horizontales.
  - Gradiente radial.
  - Círculos concéntricos.
  - Tablero de escaqueo.
- Carga de archivos locales en formato JPG o PNG.
- Detección automática de imágenes monocromáticas y sugerencia del filtro de pseudocolor.

### Filtros de la rúbrica

| Clave interna | Filtro | Parámetros |
| --- | --- | --- |
| `escala-grises` | Escala de grises | Sin parámetros |
| `negativo` | Negativo / inversión | Sin parámetros |
| `brillo-contraste` | Brillo y contraste | Brillo y contraste |
| `blanco-negro` | Blanco y negro por umbral | Umbral |
| `cuantizacion-niveles` | Cuantización de niveles de color | Número de niveles |
| `reduccion-bits` | Reducción de profundidad de bits | Bits por canal |
| `enfasis-color` | Énfasis de fondo por rango de color | Límite mínimo y máximo |

### Filtros adicionales

- **Pseudocolor:** transforma la intensidad de la imagen en una paleta sintética.
- **Mapa de pérdida:** muestra el error absoluto producido por la cuantización.
- **Matriz de Color:** 20 variaciones inspiradas en los efectos de color de un procesador de texto.
- **Convolución por matriz:** kernels de 3×3, 7×7 y 9×9 con cinco efectos predefinidos y modo personalizado de 3×3.

### Matriz de Color

El modal de Matriz de Color genera miniaturas de los 20 efectos a partir de la imagen actual y permite seleccionar uno para aplicarlo al visor.

Los efectos se organizan en tres grupos:

- Efectos base: grises, sepia estándar, decolorado, blanco y negro al 25 %, 50 % y 75 %, y azul grisáceo.
- Énfasis oscuro: azul, naranja, gris, oro, celeste y verde.
- Énfasis claro / decolorado: azul, naranja, gris, oro, celeste, verde y gris claro.

### Convolución por matriz

La estrategia de convolución permite seleccionar el tamaño del kernel y el tipo de efecto:

| Tamaño | Efectos disponibles |
| --- | --- |
| 3×3 | Box Blur, Gaussian Blur, Enfoque, Detección de Bordes, Emboss |
| 7×7 | Box Blur, Gaussian Blur, Enfoque, Detección de Bordes, Emboss |
| 9×9 | Box Blur, Gaussian Blur, Enfoque, Detección de Bordes, Emboss |

Características de la implementación:

- Convolución genérica para matrices de 3×3, 7×7 y 9×9.
- Radio calculado a partir del lado del kernel.
- Borde replicado: los píxeles fuera de la imagen toman el valor del extremo más cercano.
- División por el divisor del kernel y suma de un desplazamiento opcional.
- Saturación de cada canal al rango 0–255.
- Canal alfa preservado.
- Modo personalizado de 3×3 con edición de los nueve coeficientes, divisor y offset.

### Secuencias temporales

El visor de secuencias genera dos animaciones de seis fotogramas cada una:

1. **Grises con opacidad progresiva:** convierte la imagen a grises y reduce el canal alfa de forma lineal.
2. **Interpolación de saturación:** interpola cada canal entre la versión en grises y el color original.

Cada fotograma puede exportarse como PNG. La animación se reproduce a 500 ms por fotograma.

### Rendimiento

El panel de rendimiento muestra:

- Tiempo de ejecución del filtro en milisegundos.
- Megapíxeles procesados por segundo.

Las métricas se calculan con `performance.now()` dentro del Web Worker.

## Arquitectura

El código está organizado por capas para separar las reglas de procesamiento de la interfaz:

```text
src/
├── domain/
│   └── strategies/
│       ├── EstrategiaFiltroImagen.ts
│       ├── EstrategiasRubrica.ts
│       ├── EstrategiasSecuencia.ts
│       ├── EstrategiasMatrizColor.ts
│       ├── EstrategiaKernel.ts
│       └── index.ts
├── application/
│   ├── generators/
│   │   └── GeneradorImagenSintetica.ts
│   └── services/
│       ├── RegistroFiltros.ts
│       └── analizadorImagen.ts
├── infrastructure/
│   ├── services/
│   │   └── ServicioCanvas.ts
│   └── workers/
│       └── procesadorPixeles.worker.ts
├── presentation/
│   ├── components/
│   │   ├── CargadorArchivos.tsx
│   │   ├── Encabezado.tsx
│   │   ├── ModalMatrizColor.tsx
│   │   ├── ModalSecuencias.tsx
│   │   ├── PanelFiltros.tsx
│   │   ├── PanelKernel.tsx
│   │   ├── PanelRendimiento.tsx
│   │   ├── SelectorSintetico.tsx
│   │   └── VisualizadorAntesDespues.tsx
│   └── hooks/
│       └── usarProcesadorImagen.ts
├── App.tsx
├── index.css
└── main.tsx
```

### Capas

- **Dominio:** estrategias de filtrado, secuencias, matrices de color y convolución. No depende de React ni del DOM.
- **Aplicación:** registro de estrategias, generación de imágenes sintéticas y análisis de imágenes.
- **Infraestructura:** acceso a Canvas, carga de archivos y comunicación con el Web Worker.
- **Presentación:** componentes React, hook principal y visualización de resultados.

### Patrón Strategy

Cada filtro implementa la interfaz común:

```ts
export interface EstrategiaFiltroImagen {
  nombre: string;
  aplicar(
    pixeles: Uint8ClampedArray,
    ancho: number,
    alto: number,
    parametros?: Record<string, unknown>
  ): Uint8ClampedArray;
}
```

El registro central asigna una clave interna a cada estrategia. La interfaz y el worker utilizan la misma clave para seleccionar el algoritmo.

## Web Worker

El procesamiento se ejecuta en `src/infrastructure/workers/procesadorPixeles.worker.ts`.

### Mensaje de entrada

```ts
{
  accion?: 'GENERAR_SECUENCIAS' | 'APLICAR_MATRIZ_COLOR' | 'APLICAR_KERNEL';
  claveFiltro?: string;
  pixeles: Uint8ClampedArray;
  ancho: number;
  alto: number;
  parametros?: Record<string, unknown>;
  idEfecto?: number;
  tamanio?: '3x3' | '7x7' | '9x9';
  tipoEfecto?: string;
  matrix?: number[];
  divisor?: number;
  offset?: number;
}
```

### Mensaje de salida

```ts
{
  pixeles: Uint8ClampedArray;
  ancho: number;
  alto: number;
  rendimiento: {
    tiempoEjecucionMs: number;
    mpPorSegundo: number;
  };
}
```

Los búferes de los píxeles se transfieren con `postMessage` para evitar copias innecesarias entre el hilo principal y el worker.

## Correspondencia Java → TypeScript

La implementación toma como referencia los ejercicios desarrollados en Java durante la materia y los adapta al modelo de datos del navegador.

| Java | TypeScript / navegador |
| --- | --- |
| `BufferedImage` | `EstadoImagen` con `pixeles`, `ancho` y `alto` |
| `getRGB(x, y)` | Índice calculado: `(y * ancho + x) * 4` |
| `setRGB(x, y, valor)` | Asignación directa en `Uint8ClampedArray` |
| Píxel ARGB empaquetado | Canales R, G, B y A consecutivos |
| Máscaras `0xFF` y desplazamientos | Acceso directo a los índices del arreglo |
| `int` / `double` | `number` |
| `Color` | Componentes R, G y B separados |
| `ImageIO` | Canvas y `ServicioCanvas` |
| Hilos de Java | Web Worker |
| `System.nanoTime()` | `performance.now()` |
| Matrices `double[][]` / `int[][]` | Arreglo plano `number[]` |

### Nombres conservados

Se mantuvieron nombres del código original lorsque describen correctamente el dominio:

- `ancho`, `alto`
- `gris`
- `entrada`, `salida`
- `borde`
- `factor`
- `radio`

### Nombres adaptados

| Java | TypeScript | Motivo |
| --- | --- | --- |
| `pixel` | `pixeles` / `indice` | El navegador trabaja con un arreglo de canales, no con un entero ARGB |
| `pixel2` | `salida[indice]` | El resultado se escribe directamente en el arreglo de salida |
| `imagen2` | `salida` | Nombre más descriptivo para el búfer procesado |
| `newR`, `newG`, `newB` | `nr`, `ng`, `nb` | Se conserva la intención y se mantiene la convención local |
| `tamKernel` | `tamanio` / `lado` | Se distingue el tamaño nominal del lado numérico |
| `mascara` | No aplica | Los canales ya están separados en el `Uint8ClampedArray` |
| `factorTrans` | `factor` | El contexto de la secuencia ya indica que es una transición |
| `ImageFilterStrategy` | `EstrategiaFiltroImagen` | Nombres del dominio en español |
| `SyntheticImageFactory` | `GeneradorImagenSintetica` | Nombres del dominio en español |

### Adaptaciones documentadas

- El pseudocolor utiliza la intensidad promedio de R, G y B; el ejercicio Java tomaba el canal azul como referencia.
- El énfasis de color trabaja con un rango de luminancia configurable desde la interfaz.
- La convolución amplía el caso Java de 3×3 con tamaños de 7×7 y 9×9, borde replicado y un modo personalizado.
- La cuantización y el mapa de pérdida se calculan con la misma idea de niveles, adaptados a los controles de la interfaz.
- El contraste se expresa como un porcentaje y se aplica alrededor del punto medio de intensidad.

## Instalación y ejecución local

### Requisitos

- Node.js 20.19+ o 22.12+ (recomendado Node.js 22 LTS).
- npm 10 o superior.

### Pasos

```bash
npm ci
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

### Compilación de producción

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`.

### Vista previa de la compilación

```bash
npm run preview
```

## Despliegue

La aplicación se despliega en Netlify con la siguiente configuración:

- Comando de compilación: `npm run build`
- Directorio de publicación: `dist`

No se requiere configuración adicional de rutas base.

## Estructura de archivos de la raíz

```text
pixel-processor-app/
├── src/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .gitignore
└── README.md
```

## Autor

**Anthony Minda**  
Taller 2
