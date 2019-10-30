import { DatosService } from './../../../services/datos.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  constructor(
    private datos: DatosService
  ) { }

  ngOnInit() {
  }

  ionViewDidLeave() {
    this.datos.avisoElegido = undefined;
  }

}
