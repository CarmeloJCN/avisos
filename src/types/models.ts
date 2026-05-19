export interface Cliente {
  id?: string;
  nombre: string;
  direccion: string;
  cifNif: string;
  telefono: string[];
  email: string;
}

export interface Aviso {
  id?: string;
  numAviso: string;
  cliente: Cliente;
  descripcionAviso: string;
  intervencion: string;
  fechaEntrada: Date | string;
  fechaCita: Date | string | null;
  fechaFin: Date | string | null;
  inicioAviso: Date | string | null;
  precio: number | string;
  tecnicoID: string;
  cerrado: boolean;
  pdf?: string;
}

export interface Usuario {
  email: string;
  password: string;
}
