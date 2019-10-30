import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AvisoModel } from './../../../../models/aviso.model';
import { DatosService } from './../../../../services/datos.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  aviso: AvisoModel;

  constructor(
    public datos: DatosService,
  ) { }

  ngOnInit() {
    this.aviso = this.datos.avisoElegido;
  }

}
