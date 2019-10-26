import { DatosService } from '../../../services/datos.service';
import { NavController, ToastController } from '@ionic/angular';
import { FirebaseService } from './../../../services/firebase.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-add-aviso',
  templateUrl: './add-aviso.page.html',
  styleUrls: ['./add-aviso.page.scss'],
})
export class AddAvisoPage implements OnInit {

  avisoForm: FormGroup;
  avisoID: string;
  minDate: string;
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    public fBase: FirebaseService,
    private nav: NavController,
    public datos: DatosService,
    private datePipe: DatePipe,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    if (!this.datos.clientes) {
      this.datos.getClientes();
    }
    this.setMinMaxDate();
    this.avisoForm = this.fb.group({
      clienteID: ['', Validators.required],
      descripcionAviso: ['', Validators.required],
      intervencion: [''],
      fechaEntrada: [''],
      fechaCita: [''],
      fechaFin: [''],
      precio: [''],
      tecnicoID: ['', Validators.required],
      cerrado: false
    });
    this.setTecnicoID();
    this.avisoForm.get('fechaEntrada').setValue(new Date().toISOString());
  }

  setTecnicoID() {
    if (this.datos.usuarioID) {
      this.avisoForm.get('tecnicoID').setValue(this.datos.usuarioID);
    } else {
      this.datos.getUsuarioID().pipe(take(1)).subscribe(data => {
        this.avisoForm.get('tecnicoID').setValue(data[0].payload.doc.id);
      });
    }
  }

  setMinMaxDate() {
    const min = new Date();
    this.minDate = this.datePipe.transform(min, 'yyyy-MM-dd');
    const max = new Date().setDate(min.getDate() + 365);
    this.maxDate = this.datePipe.transform(max, 'yyyy-MM-dd');
  }

  cancelar() {
    this.nav.navigateBack('/avisos');
  }

  aceptar() {
    if (this.avisoForm.invalid) { return; }
    this.fBase.addAviso(this.avisoForm.value).then(data => {
      this.presentToast();
      this.nav.back();
    });
  }

  elegirCliente(event) {
    this.avisoForm.get('clienteID').setValue(event.value.id);

  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Aviso dado de alta correctamente.',
      duration: 2000,
      showCloseButton: true,
      translucent: true
    });
    toast.present();
  }

}
