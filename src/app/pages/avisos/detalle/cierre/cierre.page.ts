import { AvisoModel } from './../../../../models/aviso.model';
import { DatosService } from './../../../../services/datos.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.page.html',
  styleUrls: ['./cierre.page.scss'],
})
export class CierrePage implements OnInit {

  cierreForm: FormGroup;
  aviso: AvisoModel;

  constructor(
    public datos: DatosService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.aviso = this.datos.avisoElegido;
    this.cierreForm = this.fb.group({
      cliente: ['', Validators.required],
      numAviso: [''],
      descripcionAviso: ['', Validators.required],
      intervencion: [''],
      fechaEntrada: [''],
      fechaCita: [''],
      fechaFin: [''],
      precio: [''],
      tecnicoID: ['', Validators.required],
      cerrado: false
    });
  }

}
