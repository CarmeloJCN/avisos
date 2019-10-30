import { NavController } from '@ionic/angular';
import { DatosService } from './../services/datos.service';
import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoAvisoGuard implements CanLoad {

  constructor(
    private datos: DatosService,
    private nav: NavController
  ) {

  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.datos.avisoElegido) {
      this.nav.back();
      return false;
    }
    return true;
  }
}
