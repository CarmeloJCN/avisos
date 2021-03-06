import { TranslateService } from '@ngx-translate/core';
import { FirebaseService } from './../../../../services/firebase.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { DatosService } from './../../../../services/datos.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import * as jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.page.html',
  styleUrls: ['./cierre.page.scss'],
})
export class CierrePage implements OnInit {

  cierreForm: FormGroup;
  precioMaxLenght: number;
  firma: any;
  firmar = false;
  logo: any;
  pdf: Blob;
  downloadURL: any;
  loading: any;
  get aviso() {
    return this.cierreForm.value;
  }
  get precio() {
    return this.cierreForm.get('precio').value;
  }
  @ViewChild(SignaturePad, { static: true }) signaturePad: SignaturePad;
  signaturePadOptions = {
    minWidth: 0.2,
    canvasWidth: 350,
    canvasHeight: 120
  };

  constructor(
    public datos: DatosService,
    private fb: FormBuilder,
    private num: DecimalPipe,
    private nav: NavController,
    private storage: AngularFireStorage,
    private fBase: FirebaseService,
    public loadingController: LoadingController,
    private alertController: AlertController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.precioMaxLenght = 5;
    this.logo = '../../../assets/icons/icon-512x512.png';
    this.cierreForm = this.fb.group({
      id: [''],
      cliente: [''],
      numAviso: [''],
      descripcionAviso: [''],
      intervencion: ['', Validators.required],
      fechaEntrada: [''],
      fechaCita: [''],
      fechaFin: [''],
      inicioAviso: ['', Validators.required],
      precio: [''],
      tecnicoID: [''],
      pdf: [''],
      cerrado: false
    });
    this.cierreForm.patchValue(this.datos.avisoElegido);
  }

  borrarFirma() {
    this.signaturePad.clear();
    this.firma = '';
  }

  drawComplete(): void {
    this.firma = this.signaturePad.toDataURL('image/png', 0.5);
  }

  aceptar() {
    if ((this.firma || this.firmar) && this.cierreForm.valid) {
      this.presentLoading();

      setTimeout(() => {
        if (navigator.onLine) {
          this.cerrarAviso(true);
          this.captureScreen();
        } else {
          if (!this.firmar) {
            localStorage.setItem(this.aviso.numAviso, JSON.stringify(this.firma));
          }
          this.cerrarAviso(false);
          this.fBase.actualizarAviso(this.aviso.id, this.aviso).finally(() => {
            if (this.loading) {
              this.loading.dismiss();
            }
          });
          this.nav.navigateBack('/avisos');
        }

      }, 500);

    } else {
      this.presentAlert();
    }

  }

  cerrarAviso(estado: boolean) {
    this.cierreForm.get('cerrado').setValue(estado);
    const date = this.aviso.fechaFin ? this.aviso.fechaFin : new Date().toISOString();
    this.cierreForm.get('fechaFin').setValue(date);
  }

  cancelar() {
    this.nav.navigateBack('/avisos');
  }

  public captureScreen() {
    setTimeout(() => {
      const data = document.getElementById('pdf');
      const options = { background: 'white', height: 842, width: 600 };
      domtoimage.toPng(data, options).then((dataUrl) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const imgHeight = 842 * 208 / 600;
        doc.addImage(dataUrl, 'PNG', 0, 0, 208, imgHeight);
        this.pdf = doc.output('blob');
        this.guardarPdf();
      });
    }, 150);

  }

  private guardarPdf() {
    const filePath = `/pdfs/${this.aviso.numAviso}.pdf`;
    const ref = this.storage.ref(filePath);
    const task = ref.put(this.pdf);
    task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL()
          .subscribe(data => {
            this.cierreForm.get('pdf').setValue(data);
            this.fBase.actualizarAviso(this.aviso.id, this.aviso);
            if (localStorage.getItem(this.aviso.numAviso)) {
              localStorage.removeItem(this.aviso.numAviso);
            }
            this.nav.navigateBack('/avisos');
            if (this.loading) {
              this.loading.dismiss();
            }
          });
      })
    )
      .subscribe();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: this.translate.instant('AVISOS.COMUN.LOADING_MSG'),
      duration: 8000
    });
    await this.loading.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      animated: true,
      backdropDismiss: false,
      message: this.translate.instant('AVISOS.ERRORES.NO_COMPLETO'),
      buttons: [
        {
          text: this.translate.instant('AVISOS.COMUN.ACEPTAR'),
          handler: data => {

          }
        }
      ]
    });
    await alert.present();
  }

  ionViewDidEnter() {
    if (localStorage.getItem(this.aviso.numAviso)) {
      const imagen = JSON.parse(localStorage.getItem(this.aviso.numAviso));
      this.signaturePad.fromDataURL(imagen);
      this.firma = this.signaturePad.toDataURL('image/png', 0.5);
    }
  }

}
