import { DatosService } from './services/datos.service';
import { AuthService } from './services/auth.service';
import { Component } from '@angular/core';

import { Platform, MenuController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Avisos',
      url: '/avisos',
      icon: 'home'
    },
    {
      title: 'clientes',
      url: '/clientes',
      icon: 'contacts'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public auth: AuthService,
    private menu: MenuController,
    private nav: NavController,
    private datos: DatosService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.auth.userUID$.subscribe(user => {
        this.datos.getUsuarioID();
      });
      if (!this.datos.clientes) {
        this.datos.getClientes();
      }
      if (!this.datos.avisos) {
        this.datos.getAvisos();
      }
    });
  }

  logOut() {
    this.nav.navigateBack('/login');
    this.auth.logOut();
    this.menu.close();
  }
}
