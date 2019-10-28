import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { UsuarioModel } from './../../models/usuario.model';
import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, NavController, MenuController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  usuario: UsuarioModel;
  recordar = false;
  loading: any;

  constructor(
    private authService: AuthService,
    private router: NavController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private menu: MenuController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.usuario = new UsuarioModel();
    if (localStorage.getItem('email')) {
      this.usuario.email = localStorage.getItem('email');
      this.recordar = true;
    }
  }

  login(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.presentLoading();
    this.authService.login(this.usuario).then(resp => {
      this.loading.dismiss();
      if (this.recordar) {
        localStorage.setItem('email', this.usuario.email);
      } else {
        localStorage.removeItem('email');
      }
      this.router.navigateForward('/avisos');

    }).catch(err => {
      this.loading.dismiss().then(
        this.presentAlert(err)
      );
    });

  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: this.translate.instant('AVISOS.COMUN.LOADING_MSG'),
      duration: 2000
    });
    await this.loading.present();
  }

  async presentAlert(err) {
    let msg: string;
    switch (err.code) {
      case ('auth/wrong-password'):
        msg = this.translate.instant('AVISOS.ERRORES.WRONG_PASS');
        break;
      case ('auth/user-not-found'):
        msg = this.translate.instant('AVISOS.ERRORES.WRONG_USER');
        break;
      case ('auth/too-many-requests'):
        msg = this.translate.instant('AVISOS.ERRORES.TOO_MANY_REQUEST');
        break;
      default:
        msg = this.translate.instant('AVISOS.ERRORES.GENERIC');
        break;

    }
    const alert = await this.alertController.create({
      header: this.translate.instant('AVISOS.ERRORES.HEADER'),
      animated: true,
      backdropDismiss: false,
      message: msg,
      buttons: [this.translate.instant('AVISOS.COMUN.ACEPTAR')]
    });
    await alert.present();
  }

  ionViewDidEnter() {
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    this.menu.enable(true);
  }

}
