import { DatosService } from '../../services/datos.service';
import { ClienteModel } from './../../models/cliente.model';
import { NavController, AlertController, IonList } from '@ionic/angular';
import { FirebaseService } from './../../services/firebase.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {

  clientes: Array<ClienteModel>;
  nameFilter: string;
  clientID: string;
  @ViewChild(IonList, { static: true }) lista: IonList;

  constructor(
    public fb: FirebaseService,
    private nav: NavController,
    private alertController: AlertController,
    public datos: DatosService
  ) { }

  ngOnInit() {

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
          role: 'cancel',
          handler: data => {
            this.lista.closeSlidingItems();
          }
        },
        {
          text: 'SI',
          handler: data => {
            this.fb.borrarCliente(this.clientID);
            this.lista.closeSlidingItems();
          }
        }
      ]
    });
    await alert.present();
  }

}
