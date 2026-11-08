import { useEffect, useState } from 'react';
import {
  KERNELS,
  LADOS_KERNEL,
  ParametrosKernel,
  TAMANIOS_KERNEL,
  TIPOS_EFECTO_KERNEL,
  TamanioKernel,
  TipoEfectoKernel
} from '../../domain/strategies/EstrategiaKernel';

interface PanelKernelProps {
  parametros: ParametrosKernel;
  onCambiar: (parametros: ParametrosKernel) => void;
}

const MATRIZ_PERSONALIZADA_POR_DEFECTO = [...KERNELS['3x3']['Enfoque (Sharpen)'].matrix];

const DESCRIPCIONES_EFECTO: Record<TipoEfectoKernel, string> = {
  'Box Blur': 'Promedia uniformemente todos los píxeles del vecindario.',
  'Gaussian Blur': 'Suaviza con mayor peso hacia el centro del kernel.',
  'Enfoque (Sharpen)': 'Acentúa los cambios de intensidad para resaltar detalles.',
  'Detección de Bordes': 'Resalta contornos y transiciones bruscas.',
  'Emboss': 'Crea un efecto de 3D simulando sombras orientadas en diagonal'
};

function esNumeroValido(texto: string): boolean {
  return texto.trim() !== '' && Number.isFinite(Number(texto));
}

export function PanelKernel({ parametros, onCambiar }: PanelKernelProps) {
  const tamanio: TamanioKernel = parametros.tamanio ?? '3x3';
  const esPersonalizado = !parametros.tipoEfecto;
  const lado = esPersonalizado ? 3 : LADOS_KERNEL[tamanio];
  const configPreset = parametros.tipoEfecto ? KERNELS[tamanio][parametros.tipoEfecto] : undefined;

  const matrizVisible = esPersonalizado
    ? (parametros.matrix ?? MATRIZ_PERSONALIZADA_POR_DEFECTO)
    : (configPreset?.matrix ?? []);
  const divisorVisible = esPersonalizado
    ? (parametros.divisor ?? 1)
    : (configPreset?.divisor ?? 1);

  const [textoKernel, setTextoKernel] = useState<string[]>(() =>
    MATRIZ_PERSONALIZADA_POR_DEFECTO.map(String)
  );
  const [textoDivisor, setTextoDivisor] = useState<string>(String(parametros.divisor ?? 1));
  const [textoOffset, setTextoOffset] = useState<string>(String(parametros.offset ?? 0));

  useEffect(() => {
    if (!esPersonalizado) return;

    const base = parametros.matrix && parametros.matrix.length === 9
      ? parametros.matrix
      : MATRIZ_PERSONALIZADA_POR_DEFECTO;

    setTextoKernel(base.map(String));
    setTextoDivisor(String(parametros.divisor ?? 1));
    setTextoOffset(String(parametros.offset ?? 0));
  }, [parametros, esPersonalizado]);

  const emitirPreset = (nuevoTamanio: TamanioKernel, nuevoTipo: TipoEfectoKernel) => {
    const config = KERNELS[nuevoTamanio][nuevoTipo];
    onCambiar({
      tamanio: nuevoTamanio,
      tipoEfecto: nuevoTipo,
      matrix: [...config.matrix],
      divisor: config.divisor,
      offset: 0
    });
  };

  const emitirPersonalizado = (kernel: string[], divisor: string, offset: string) => {
    if (kernel.length !== 9 || !kernel.every(esNumeroValido)) return;
    if (!esNumeroValido(divisor) || Number(divisor) === 0) return;
    if (!esNumeroValido(offset)) return;

    onCambiar({
      tamanio: '3x3',
      tipoEfecto: undefined,
      matrix: kernel.map(Number),
      divisor: Number(divisor),
      offset: Number(offset)
    });
  };

  const manejarCambioTamanio = (valor: string) => {
    const nuevoTamanio = valor as TamanioKernel;
    const nuevoTipo: TipoEfectoKernel = esPersonalizado
      ? 'Box Blur'
      : (parametros.tipoEfecto ?? 'Box Blur');
    emitirPreset(nuevoTamanio, nuevoTipo);
  };

  const manejarCambioEfecto = (valor: string) => {
    if (valor === 'personalizado') {
      const base = KERNELS['3x3']['Enfoque (Sharpen)'];
      onCambiar({
        tamanio: '3x3',
        tipoEfecto: undefined,
        matrix: [...base.matrix],
        divisor: base.divisor,
        offset: 0
      });
      return;
    }

    emitirPreset(tamanio, valor as TipoEfectoKernel);
  };

  const manejarCambioCelda = (indice: number, texto: string) => {
    const nuevos = [...textoKernel];
    nuevos[indice] = texto;
    setTextoKernel(nuevos);
    emitirPersonalizado(nuevos, textoDivisor, textoOffset);
  };

  const manejarCambioDivisor = (texto: string) => {
    setTextoDivisor(texto);
    emitirPersonalizado(textoKernel, texto, textoOffset);
  };

  const manejarCambioOffset = (texto: string) => {
    setTextoOffset(texto);
    emitirPersonalizado(textoKernel, textoDivisor, texto);
  };

  const divisorInvalido = !esNumeroValido(textoDivisor) || Number(textoDivisor) === 0;
  const claseCelda = lado === 3
    ? 'py-1.5 text-[11px]'
    : lado === 7
      ? 'py-1 text-[9px]'
      : 'py-0.5 text-[8px]';

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Matriz de Convolución
      </h3>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">Tamaño del Kernel</span>
        <select
          value={tamanio}
          onChange={(e) => manejarCambioTamanio(e.target.value)}
          className="w-full bg-[#151c2c] border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          {TAMANIOS_KERNEL.map((opcion) => (
            <option key={opcion} value={opcion}>{opcion}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">Tipo de Efecto</span>
        <select
          value={esPersonalizado ? 'personalizado' : parametros.tipoEfecto}
          onChange={(e) => manejarCambioEfecto(e.target.value)}
          className="w-full bg-[#151c2c] border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          {TIPOS_EFECTO_KERNEL.map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
          <option value="personalizado">Personalizado (3×3)</option>
        </select>
      </label>

      {!esPersonalizado && configPreset && (
        <div className="flex flex-col gap-2">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${lado}, minmax(0, 1fr))` }}
          >
            {matrizVisible.map((valor, indice) => (
              <div
                key={indice}
                className={`bg-[#151c2c] border border-slate-700 rounded-md text-center font-mono text-slate-200 ${claseCelda}`}
              >
                {valor}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{lado}×{lado} · {lado * lado} coeficientes</span>
            <span>Divisor: <span className="font-mono text-slate-200">{divisorVisible}</span></span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            {DESCRIPCIONES_EFECTO[parametros.tipoEfecto as TipoEfectoKernel]}
          </p>
        </div>
      )}

      {esPersonalizado && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-1.5">
            {textoKernel.map((valor, indice) => (
              <input
                key={indice}
                type="number"
                step="1"
                value={valor}
                onChange={(e) => manejarCambioCelda(indice, e.target.value)}
                onBlur={() => {
                  if (!esNumeroValido(textoKernel[indice])) {
                    const nuevos = [...textoKernel];
                    nuevos[indice] = String(parametros.matrix?.[indice] ?? 0);
                    setTextoKernel(nuevos);
                  }
                }}
                className="w-full bg-[#151c2c] border border-slate-600 rounded-md py-2 text-center text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Divisor</span>
              <input
                type="number"
                step="1"
                value={textoDivisor}
                onChange={(e) => manejarCambioDivisor(e.target.value)}
                onBlur={() => {
                  if (divisorInvalido) setTextoDivisor(String(parametros.divisor ?? 1));
                }}
                className="w-full bg-[#151c2c] border border-slate-600 rounded-md px-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Offset</span>
              <input
                type="number"
                step="1"
                value={textoOffset}
                onChange={(e) => manejarCambioOffset(e.target.value)}
                onBlur={() => {
                  if (!esNumeroValido(textoOffset)) setTextoOffset(String(parametros.offset ?? 0));
                }}
                className="w-full bg-[#151c2c] border border-slate-600 rounded-md px-2 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
              />
            </label>
          </div>

          {divisorInvalido && (
            <p className="text-[10px] text-rose-400">El divisor debe ser distinto de 0 para aplicar el kernel.</p>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">
        Los bordes replican el píxel del extremo para evitar índices fuera de rango.
      </p>
    </div>
  );
}
