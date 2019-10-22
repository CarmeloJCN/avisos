import { AuthService } from './auth.service';
import { takeUntil } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { ClienteModel } from '../models/cliente.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  clientes: Array<ClienteModel>;
  usuarioID: string;

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

  getUsuarioID() {
    this.fb.leerTecnico(this.auth.user.uid).subscribe(data => {
      this.usuarioID = data[0].payload.doc.id;
    });
  }
}
