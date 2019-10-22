import { FirebaseService } from './../../services/firebase.service';
import { NavController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
})
export class ClientePage implements OnInit {

  clienteForm: FormGroup;
  clienteID = '';

  constructor(
    private fb: FormBuilder,
    private nav: NavController,
    private fbase: FirebaseService,
    private alertController: AlertController,
    private router: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      cifNif: ['', [Validators.pattern('([a-z]|[A-Z]|[0-9])[0-9]{7}([a-z]|[A-Z]|[0-9])'), this.validarCif]],
      telefono: this.fb.array([
        this.fb.control('', Validators.required)
      ]),
      email: ['']
    });
    this.router.params.subscribe(data => {
      if (data.id === 'new') { return; }
      this.clienteID = data.id;
      this.fbase.leerCliente(data.id).subscribe(dato => {
        this.clienteForm.patchValue(
          dato.data()
        );
      });
    });

  }

  get telefonos() {
    return this.clienteForm.get('telefono') as FormArray;
  }

  addTelefono() {
    this.telefonos.push(new FormControl(''));
  }

  removeTelefono(index: number) {
    this.telefonos.removeAt(index);
  }

  getTelefonoLabel(index: number) {
    return `Teléfono ${index + 1}`;
  }

  validarCif(control: FormControl): { [s: string]: boolean } {
    if (control.value.length > 9) {
      control.setValue(control.value.slice(0, 9));
    }
    return null;
  }

  aceptar() {
    if (this.clienteForm.invalid) { return; }
    if (this.clienteID === '') {
      this.fbase.addCliente(this.clienteForm.value).then(() => {
        this.presentAlert('Cliente añadido correctamente.');
      });
    } else {
      this.fbase.actualizarCliente(this.clienteID, this.clienteForm.value).then(() => {
        this.presentAlert('Cliente actualizado correctamente.');
      });
    }
  }

  cancelar() {
    this.nav.navigateBack('/clientes');
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      header: 'Completado',
      animated: true,
      backdropDismiss: false,
      message: msg,
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
