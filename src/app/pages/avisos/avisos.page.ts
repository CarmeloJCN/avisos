import { AngularFireStorage } from '@angular/fire/storage';
import { FirebaseService } from './../../services/firebase.service';
import { TranslateService } from '@ngx-translate/core';
import { AvisoModel } from './../../models/aviso.model';
import { DatosService } from './../../services/datos.service';
import { NavController, AlertController, IonList } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.page.html',
  styleUrls: ['./avisos.page.scss'],
})
export class AvisosPage implements OnInit {

  filterValue: string;
  filtroEstado: string;
  avisoID: string;
  aviso: AvisoModel;
  @ViewChild(IonList, { static: true }) lista: IonList;

  constructor(
    private nav: NavController,
    private alertController: AlertController,
    public datos: DatosService,
    private translate: TranslateService,
    private fb: FirebaseService,
    private storage: AngularFireStorage
  ) { }

  ngOnInit() {
    this.filtroEstado = 'activos';
  }

  addAviso() {
    this.nav.navigateForward('/add-aviso/new');
  }

  onSearchChange(event) {
    this.filterValue = event.detail.value;
  }

  goDetalle(aviso: AvisoModel) {
    this.datos.avisoElegido = aviso;
    this.nav.navigateForward('detalle');
  }

  deleteAviso(item: AvisoModel) {
    this.avisoID = item.id;
    this.aviso = item;
    this.presentAlert();
  }

  private borrarPDF() {
    if (this.aviso.pdf) {
      const filePath = `/pdfs/${this.aviso.numAviso}.pdf`;
      const ref = this.storage.ref(filePath);
      ref.delete().subscribe();
    }
  }

  editAviso(id: string) {
    this.nav.navigateForward(`/add-aviso/${id}`);
    this.lista.closeSlidingItems();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      animated: true,
      backdropDismiss: false,
      message: this.translate.instant('AVISOS.COMUN.BORRAR_MSG'),
      buttons: [
        {
          text: this.translate.instant('AVISOS.COMUN.NO'),
          role: 'cancel',
          handler: data => {
            this.lista.closeSlidingItems();
          }
        },
        {
          text: this.translate.instant('AVISOS.COMUN.SI'),
          handler: data => {
            this.fb.borrarAviso(this.avisoID);
            this.borrarPDF();
            this.lista.closeSlidingItems();
          }
        }
      ]
    });
    await alert.present();
  }
}
