import { ClienteModel } from './cliente.model';

export class AvisoModel {
  id?: string;
  numAviso: string;
  cliente: ClienteModel;
  descripcionAviso: string;
  intervencion: string;
  fechaEntrada: Date;
  fechaCita: Date;
  fechaFin: Date;
  precio: number;
  tecnicoID: string;
  cerrado: boolean;
}
