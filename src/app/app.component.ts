import { AVISOS_CONSTANTS } from './app.constants';
import { AuthService } from './services/auth.service';
import { Component } from '@angular/core';

import { Platform, MenuController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'AVISOS.TITLE',
      url: '/avisos',
      icon: 'create'
    },
    {
      title: 'AVISOS.CLIENTES.TITLE',
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
    private swUpdate: SwUpdate,
    private translate: TranslateService
  ) {
    this.initializeApp();
    this.setLanguage();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.comprobarActualizaciones();
    });
  }

  private comprobarActualizaciones() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm(this.translate.instant('AVISOS.COMUN.NEW_VERSION_MSG'))) {
          window.location.reload();
        }
      });
    }
  }

  private setLanguage() {
    const idioma = window.navigator.language;
    if (AVISOS_CONSTANTS.IDIOMAS.indexOf(idioma) > -1) {
      this.translate.setDefaultLang(idioma);
    } else {
      this.translate.setDefaultLang('es');
    }
  }

  logOut() {
    this.nav.navigateBack('/login');
    this.auth.logOut();
    this.menu.close();
  }
}
