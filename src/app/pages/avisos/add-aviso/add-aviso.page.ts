import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AVISOS_CONSTANTS } from './../../../app.constants';
import { DatosService } from '../../../services/datos.service';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { FirebaseService } from './../../../services/firebase.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { take } from 'rxjs/operators';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-add-aviso',
  templateUrl: './add-aviso.page.html',
  styleUrls: ['./add-aviso.page.scss'],
})
export class AddAvisoPage implements OnInit {

  avisoForm: FormGroup;
  avisoID = '';
  minDate: string;
  maxDate: string;
  loading: any;
  @ViewChild('select', { static: true }) select: IonicSelectableComponent;

  constructor(
    private fb: FormBuilder,
    public fBase: FirebaseService,
    private nav: NavController,
    public datos: DatosService,
    private datePipe: DatePipe,
    private toastController: ToastController,
    private translate: TranslateService,
    public loadingController: LoadingController,
    private router: ActivatedRoute
  ) { }

  ngOnInit() {
    this.setMinMaxDate();
    this.avisoForm = this.fb.group({
      cliente: ['', Validators.required],
      numAviso: [''],
      descripcionAviso: ['', Validators.required],
      intervencion: [''],
      fechaEntrada: [''],
      fechaCita: [''],
      fechaFin: [''],
      inicioAviso: [''],
      precio: [''],
      tecnicoID: ['', Validators.required],
      cerrado: false
    });
    this.router.params.subscribe(data => {
      if (data.id === 'new') { return; }
      this.avisoID = data.id;
      this.fBase.leerAviso(data.id).subscribe(dato => {
        this.avisoForm.patchValue(
          dato.data()
        );
      });
    });
    if (this.avisoID === '') {
      this.setTecnicoID();
      this.setNumAviso();
      this.avisoForm.get('fechaEntrada').setValue(new Date().toISOString());
    }

  }

  private setNumAviso() {
    this.fBase.leerNumAviso().subscribe(data => {
      if (data.docs[0].data().numAviso) {
        const aviso = data.docs[0].data().numAviso.split('-');
        const num = Number.parseInt(aviso[1], 10);
        const str = '' + (num + 1);
        const pad = '0000';
        this.avisoForm.get('numAviso').setValue(AVISOS_CONSTANTS.ENCABEZADO_AVISO + pad.substring(0, pad.length - str.length) + str);
      } else {
        this.avisoForm.get('numAviso').setValue(AVISOS_CONSTANTS.ENCABEZADO_AVISO + '0001');
      }
    });
  }

  private setTecnicoID() {
    if (localStorage.getItem('tecnicoID')) {
      const id = JSON.parse(localStorage.getItem('tecnicoID'));
      this.avisoForm.get('tecnicoID').setValue(id);
    } else {
      if (this.datos.usuarioID) {
        this.avisoForm.get('tecnicoID').setValue(this.datos.usuarioID);
      } else {
        this.datos.getUsuarioID().pipe(take(1)).subscribe(data => {
          this.avisoForm.get('tecnicoID').setValue(data[0].payload.doc.id);
        });
      }
    }

  }

  private setMinMaxDate() {
    const min = new Date();
    this.minDate = this.datePipe.transform(min, 'yyyy-MM-dd');
    const max = new Date().setDate(min.getDate() + 365);
    this.maxDate = this.datePipe.transform(max, 'yyyy-MM-dd');
  }

  cancelar() {
    this.nav.navigateBack('/avisos');
  }

  aceptar() {
    this.avisoForm.markAllAsTouched();
    if (this.avisoForm.invalid) { return; }
    this.presentLoading();
    if (this.avisoID === '') {
      this.fBase.addAviso(this.avisoForm.value).then(() => {
      }).finally(() => {
        if (this.loading) {
          this.loading.dismiss();
        }
      });
    } else {
      this.fBase.actualizarAviso(this.avisoID, this.avisoForm.value).then(() => {
      }).finally(() => {
        if (this.loading) {
          this.loading.dismiss();
        }
      });
    }
    this.presentToast();
    this.nav.back();

  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant('AVISOS.AVISO.ALTA_MSG'),
      duration: 2000,
      showCloseButton: true,
      translucent: true
    });
    toast.present();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: this.translate.instant('AVISOS.COMUN.LOADING_MSG'),
      duration: 2000
    });
    await this.loading.present();
  }

  addClient() {
    this.select.showAddItemTemplate();

  }

  cerrarAddClient() {
    this.select.hideAddItemTemplate();
  }

}
