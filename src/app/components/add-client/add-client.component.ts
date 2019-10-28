import { ToastController } from '@ionic/angular';
import { FirebaseService } from './../../services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss'],
})
export class AddClientComponent implements OnInit {

  form: FormGroup;
  @Output() cerrar = new EventEmitter<any>();
  clienteID = '';

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private fbase: FirebaseService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
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
        this.form.patchValue(
          dato.data()
        );
      });
    });

  }

  get telefonos() {
    return this.form.get('telefono') as FormArray;
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
    if (this.form.invalid) { return; }
    if (this.clienteID === '') {
      this.fbase.addCliente(this.form.value).then(() => {
        this.presentToast(this.translate.instant('AVISOS.CLIENTES.ALTA_MSG'));
      });
    } else {
      this.fbase.actualizarCliente(this.clienteID, this.form.value).then(() => {
        this.presentToast(this.translate.instant('AVISOS.CLIENTES.ACTU_MSG'));
      });
    }
    this.cerrar.emit();
  }

  cancelar() {
    this.cerrar.emit();
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
