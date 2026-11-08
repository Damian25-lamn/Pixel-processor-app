import { EstrategiaFiltroImagen } from '../../domain/strategies/EstrategiaFiltroImagen';
import { 
  EstrategiaEscalaGrises, 
  EstrategiaNegativo, 
  EstrategiaBrilloContraste, 
  EstrategiaBlancoNegro, 
  EstrategiaCuantizacionNiveles, 
  EstrategiaReduccionBits, 
  EstrategiaEnfasisColor, 
  EstrategiaPseudocolor, 
  EstrategiaMapaPerdida, 
  EstrategiaSepia,
  EstrategiaMatrizColor,
  EstrategiaKernel
} from '../../domain/strategies';

export class RegistroFiltros {
  private static estrategias: Map<string, EstrategiaFiltroImagen> = new Map<string, EstrategiaFiltroImagen>([
    ['escala-grises', new EstrategiaEscalaGrises()],
    ['negativo', new EstrategiaNegativo()],
    ['brillo-contraste', new EstrategiaBrilloContraste()],
    ['blanco-negro', new EstrategiaBlancoNegro()],
    ['cuantizacion-niveles', new EstrategiaCuantizacionNiveles()],
    ['reduccion-bits', new EstrategiaReduccionBits()],
    ['enfasis-color', new EstrategiaEnfasisColor()],
    ['pseudocolor', new EstrategiaPseudocolor()],
    ['mapa-perdida', new EstrategiaMapaPerdida()],
    //['sepia', new EstrategiaSepia()],
    ['matriz-color', new EstrategiaMatrizColor()],
    ['convolucion', new EstrategiaKernel()]
  ]);

  static obtener(clave: string): EstrategiaFiltroImagen | undefined {
    return this.estrategias.get(clave);
  }

  static obtenerTodos(): { clave: string; nombre: string; esRubrica: boolean }[] {
    const clavesRubrica = ['escala-grises', 'negativo', 'brillo-contraste', 'blanco-negro', 'cuantizacion-niveles', 'reduccion-bits', 'enfasis-color'];
    return Array.from(this.estrategias.entries()).map(([clave, valor]) => ({
      clave,
      nombre: valor.nombre,
      esRubrica: clavesRubrica.includes(clave)
    }));
  }
}
