import { DatosService } from '../../../services/datos.service';
import { AuthService } from './../../../services/auth.service';
import { NavController } from '@ionic/angular';
import { FirebaseService } from './../../../services/firebase.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-aviso',
  templateUrl: './add-aviso.page.html',
  styleUrls: ['./add-aviso.page.scss'],
})
export class AddAvisoPage implements OnInit {

  avisoForm: FormGroup;
  avisoID: string;

  constructor(
    private fb: FormBuilder,
    public fBase: FirebaseService,
    private nav: NavController,
    public datos: DatosService
  ) { }

  ngOnInit() {
    if (!this.datos.clientes) {
      this.datos.getClientes();
    }
    this.avisoForm = this.fb.group({
      clienteID: [''],
      descipcionAviso: [''],
      intervencion: [''],
      fechaEntrada: [''],
      fechaFin: [''],
      precio: [''],
      tecnicoID: ['']
    });
    this.avisoForm.get('tecnicoID').setValue(this.datos.usuarioID);
    this.avisoForm.get('fechaEntrada').setValue(new Date());
  }

  cancelar() {
    this.nav.navigateBack('/avisos');
  }

  elegirCliente(event) {
    this.avisoForm.get('clienteID').setValue(event.value.id);

  }

}
