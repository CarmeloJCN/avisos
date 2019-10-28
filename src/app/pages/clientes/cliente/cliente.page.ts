import { TranslateService } from '@ngx-translate/core';
import { FirebaseService } from '../../../services/firebase.service';
import { NavController, ToastController } from '@ionic/angular';
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
  toast: any;

  constructor(
    private fb: FormBuilder,
    private nav: NavController,
    private fbase: FirebaseService,
    private router: ActivatedRoute,
    private toastController: ToastController,
    private translate: TranslateService
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
        if (dato.data().telefono.length > 1) {
          this.addTelefono(dato.data().telefono.length - 1);
        }
        this.clienteForm.patchValue(
          dato.data()
        );
      });
    });

  }

  get telefonos() {
    return this.clienteForm.get('telefono') as FormArray;
  }

  addTelefono(cantidad: number) {
    for (let i = 0; i < cantidad; i++) {
      this.telefonos.push(new FormControl(''));
    }
  }

  removeTelefono(index: number) {
    this.telefonos.removeAt(index);
  }

  getTelefonoLabel(index: number) {
    const num = index + 1;
    return this.translate.instant('AVISOS.CLIENTES.TELEFONO', { num });
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
        this.presentToast(this.translate.instant('AVISOS.CLIENTES.ALTA_MSG'));
        this.nav.back();
      });
    } else {
      this.fbase.actualizarCliente(this.clienteID, this.clienteForm.value).then(() => {
        this.presentToast(this.translate.instant('AVISOS.CLIENTES.ACTU_MSG'));
        this.nav.back();
      });
    }
  }

  cancelar() {
    this.nav.navigateBack('/clientes');
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1200,
      showCloseButton: true,
      translucent: true
    });
    toast.present();
  }

}
