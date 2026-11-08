import React from 'react';

interface CargadorArchivosProps {
  onArchivoCargado: (archivo: File) => void;
}

export function CargadorArchivos({ onArchivoCargado }: CargadorArchivosProps) {
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      onArchivoCargado(archivo);
    }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Cargar Archivo</h2>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-lg p-4 cursor-pointer transition-colors bg-slate-900/50">
        <span className="text-xs text-slate-300 font-medium mb-1">Seleccionar Imagen JPG / PNG</span>
        <span className="text-[10px] text-slate-500">Arrastra o haz clic</span>
        <input type="file" accept="image/png, image/jpeg" onChange={manejarCambio} className="hidden" />
      </label>
    </div>
  );
}
