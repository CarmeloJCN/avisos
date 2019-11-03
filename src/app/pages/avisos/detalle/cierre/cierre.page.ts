import { FirebaseService } from './../../../../services/firebase.service';
import { NavController, MenuController } from '@ionic/angular';
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
  pdf: any;
  downloadURL: any;
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
    private menu: MenuController,
    private storage: AngularFireStorage,
    private fBase: FirebaseService
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

  format() {
    this.cierreForm.get('precio').setValue(this.num.transform(this.precio, '0.2-2'));
  }

  borrarFirma() {
    this.signaturePad.clear();
    this.firma = '';
  }

  drawComplete(): void {
    this.firma = this.signaturePad.toDataURL('image/png', 0.5);
  }

  cerrarAviso() {
    if ((this.firma || this.firmar) && this.cierreForm.valid) {
      this.cierreForm.patchValue({
        fechaFin: new Date().toISOString(),
        cerrado: true
      });
      setTimeout(() => {
        this.captureScreen();
      }, 500);

    }

  }

  cancelar() {
    this.nav.navigateBack('/avisos');
  }

  public captureScreen() {
    const data = document.getElementById('pdf');
    const options = { background: 'white', height: 600, width: 845 };
    domtoimage.toPng(data, options).then((dataUrl) => {
      const doc = new jsPDF('l', 'mm', 'a5');
      const imgHeight = 600 * 208 / 845;
      doc.addImage(dataUrl, 'PNG', 0, 0, 208, imgHeight);
      this.pdf = doc.output('blob');
      this.guardarPdf();
    });
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
          });
      })
    )
      .subscribe();
  }

}
