import { ClienteModel } from './../../models/cliente.model';
import { NavController } from '@ionic/angular';
import { AuthService } from './../../services/auth.service';
import { FirebaseService } from './../../services/firebase.service';
import { Component, OnInit } from '@angular/core';
import { takeUntil, filter, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {

  clientes: Array<ClienteModel>;
  filteredClients: Array<ClienteModel>;
  nameFilter: string;

  constructor(
    private fb: FirebaseService,
    private auth: AuthService,
    private nav: NavController
  ) { }

  ngOnInit() {
    this.fb.readClients().pipe(takeUntil(this.auth.unsubscribe$))
      .subscribe(data => {
        this.clientes = data.map((c: any) => {
          return {
            id: c.payload.doc.id,
            nombre: c.payload.doc.data().nombre,
            apellidos: c.payload.doc.data().apellidos,
            direccion: c.payload.doc.data().direccion,
            cifNif: c.payload.doc.data().cifNif,
            telefono: c.payload.doc.data().telefono,
            email: c.payload.doc.data().email,
          };
        });
      });
  }

  addCliente() {
    this.nav.navigateForward('/cliente');
  }

  deleteCliente(id: string) {
    this.fb.deleteClient(id);
  }

  onSearchChange(event) {
    this.nameFilter = event.detail.value;

  }

}
