import { NavController } from '@ionic/angular';
import { AvisoModel } from './../../../../models/aviso.model';
import { DatosService } from './../../../../services/datos.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.page.html',
  styleUrls: ['./cierre.page.scss'],
})
export class CierrePage implements OnInit {

  cierreForm: FormGroup;
  aviso: AvisoModel;
  precioMaxLenght: number;
  firma: any;
  firmar = false;
  get precio() {
    return this.cierreForm.get('precio').value;
  }
  @ViewChild(SignaturePad, { static: true }) signaturePad: SignaturePad;
  signaturePadOptions = {
    minWidth: 1,
    canvasWidth: 350,
    canvasHeight: 120
  };

  constructor(
    public datos: DatosService,
    private fb: FormBuilder,
    private num: DecimalPipe,
    private nav: NavController
  ) { }

  ngOnInit() {
    this.precioMaxLenght = 5;
    this.aviso = this.datos.avisoElegido;
    this.cierreForm = this.fb.group({
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
      cerrado: false
    });
    this.cierreForm.patchValue(this.aviso);
  }

  format() {
    this.cierreForm.get('precio').setValue(this.num.transform(this.precio, '0.2-2'));
  }

  borrarFirma() {
    this.signaturePad.clear();
    this.firma = '';
  }

  drawComplete(): void {
    this.firma = this.signaturePad.toDataURL('image/jpeg', 0.5);
  }

  cerrarAviso() {
    if ((this.firma || this.firmar) && this.cierreForm.valid) {
      this.cierreForm.patchValue({
        fechaFin: new Date().toISOString(),
        cerrado: true
      });
      console.log(this.cierreForm.value);

    } else {
      console.log('no');

    }

  }

  cancelar() {
    this.nav.navigateBack('/avisos');
  }

}
