import { AuthService } from './auth.service';
import { takeUntil } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { ClienteModel } from '../models/cliente.model';
import { Injectable } from '@angular/core';
import { AvisoModel } from '../models/aviso.model';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  clientes: Array<ClienteModel>;
  usuarioID: string;
  avisos: Array<AvisoModel>;

  constructor(
    private fb: FirebaseService,
    private auth: AuthService
  ) { }

  getClientes() {
    this.fb.leerClientes().pipe(takeUntil(this.auth.unsubscribe$))
      .subscribe(data => {
        this.clientes = data.map((c: any) => {
          return {
            id: c.payload.doc.id,
            nombre: c.payload.doc.data().nombre,
            direccion: c.payload.doc.data().direccion,
            cifNif: c.payload.doc.data().cifNif,
            telefono: c.payload.doc.data().telefono,
            email: c.payload.doc.data().email,
          };
        });
      });
  }

  getAvisos() {
    this.fb.leerAvisos().pipe(takeUntil(this.auth.unsubscribe$))
      .subscribe(data => {
        this.avisos = data.map((a: any) => {
          return {
            id: a.payload.doc.id,
            clienteID: a.payload.doc.data().clienteID,
            cliente: this.getCliente(a.payload.doc.data().clienteID),
            descripcionAviso: a.payload.doc.data().descripcionAviso,
            intervencion: a.payload.doc.data().intervencion || '',
            fechaEntrada: a.payload.doc.data().fechaEntrada,
            fechaFin: a.payload.doc.data().fechaFin || '',
            fechaCita: a.payload.doc.data().fechaCita || '',
            precio: a.payload.doc.data().precio || '',
            tecnicoID: a.payload.doc.data().tecnicoID,
            cerrado: a.payload.doc.data().cerrado
          };
        });
      });
  }

  getUsuarioID() {
    this.fb.leerTecnico(this.auth.user.uid).subscribe(data => {
      this.usuarioID = data[0].payload.doc.id;
    });
  }

  getCliente(id: string) {
    const cliente = this.clientes.filter(client => client.id === id);
    return cliente[0];
  }
}
