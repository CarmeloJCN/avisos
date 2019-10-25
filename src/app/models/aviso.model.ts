
export class AvisoModel {
  id?: string;
  clienteID: string;
  descripcionAviso: string;
  intervencion: string;
  fechaEntrada: Date;
  fechaFin: Date;
  precio: number;
  tecnicoID: string;
  cerrado: boolean;
}
