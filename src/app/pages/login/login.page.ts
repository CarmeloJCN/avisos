import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  get recordar() { return this.loginForm.get('recordar'); }
  loading: any;
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: NavController,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private menu: MenuController,
    private translate: TranslateService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      recordar: ['']
    });
    this.usuario = new UsuarioModel();
    if (localStorage.getItem('email')) {
      this.loginForm.get('email').setValue(localStorage.getItem('email'));
      this.recordar.setValue(true);
    }
  }

  login() {
    this.loginForm.markAsTouched();
    if (this.loginForm.invalid) {
      return;
    }
    this.usuario = this.loginForm.value;
    this.presentLoading();
    this.authService.login(this.usuario).then(resp => {
      this.loading.dismiss();
      if (this.recordar.value) {
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
