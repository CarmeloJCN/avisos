import { ClienteModel } from './../../models/cliente.model';
import { NavController } from '@ionic/angular';
import { AuthService } from './../../services/auth.service';
import { FirebaseService } from './../../services/firebase.service';
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {

  clientes$: Observable<ClienteModel[]>;

  constructor(
    private fb: FirebaseService,
    private auth: AuthService,
    private nav: NavController
  ) { }

  ngOnInit() {

    this.clientes$ = this.fb.readClients().pipe((takeUntil(this.auth.unsubscribe$)));

  }

  addCliente() {
    this.nav.navigateForward('/cliente');
  }

  deleteCliente(id: string) {
    this.fb.deleteClient(id);
  }

}
