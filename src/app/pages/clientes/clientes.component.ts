import { ClienteModel } from './../../models/cliente.model';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from './../../services/auth.service';
import { FirebaseService } from './../../services/firebase.service';
import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {

  clientes: Array<ClienteModel>;
  filteredClients: Array<ClienteModel>;
  nameFilter: string;
  clientID: string;

  constructor(
    private fb: FirebaseService,
    private auth: AuthService,
    private nav: NavController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.fb.readClients().pipe(takeUntil(this.auth.unsubscribe$))
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

  goClient(id: string) {
    this.nav.navigateForward(`/cliente/${id}`);
  }

  addCliente() {
    this.nav.navigateForward('/cliente/new');
  }

  deleteCliente(id: string) {
    this.clientID = id;
    this.presentAlert();
  }

  onSearchChange(event) {
    this.nameFilter = event.detail.value;

  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Completado',
      animated: true,
      backdropDismiss: false,
      message: '¿Estás seguro de que quieres borrar este elemento?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel'
        },
        {
          text: 'SI',
          handler: data => {
            this.fb.deleteClient(this.clientID);
          }
        }
      ]
    });
    await alert.present();
  }

}
