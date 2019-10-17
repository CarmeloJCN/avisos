import { FirebaseService } from './../../services/firebase.service';
import { NavController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
})
export class ClientePage implements OnInit {

  clienteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nav: NavController,
    private fbase: FirebaseService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.clienteForm = this.fb.group({
      nombre: [''],
      apellidos: [''],
      direccion: [''],
      cifNif: [''],
      telefono: this.fb.array([
        this.fb.control('')
      ]),
      email: ['']
    });
  }

  get telefonos() {
    return this.clienteForm.get('telefono') as FormArray;
  }

  addTelefono() {
    this.telefonos.push(new FormControl(''));
  }

  aceptar() {
    this.fbase.createClient(this.clienteForm.value).then(() => {
      this.presentAlert();
    });
  }

  cancelar() {
    this.nav.navigateBack('/clientes');
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Completado',
      animated: true,
      backdropDismiss: false,
      message: 'Cliente añadido correctamente.',
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.cancelar();
          }
        }
      ]
    });
    await alert.present();
  }

}
