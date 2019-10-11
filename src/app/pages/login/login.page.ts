import { NgForm } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { UsuarioModel } from './../../models/usuario.model';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';


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
    private router: Router,
    public loadingController: LoadingController,
    public alertController: AlertController
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
    this.authService.login(this.usuario).subscribe(resp => {
      this.loading.dismiss();
      if (this.recordar) {
        localStorage.setItem('email', this.usuario.email);
      } else {
        localStorage.removeItem('email');
      }
      this.router.navigateByUrl('/avisos');

    }, (err) => {
      this.loading.dismiss().then(
        this.presentAlert(err)
      );


    });

  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Por favor, espere...',
    });
    await this.loading.present();
  }

  async presentAlert(err) {
    let msg: string;
    switch (err.error.error.message) {
      case ('INVALID_PASSWORD'):
        msg = 'Contraseña incorrecta.';
        break;
      case ('EMAIL_NOT_FOUND'):
        msg = 'Usuario no encontrado.';
        break;
      default:
        if (err.error.error.message.match(/TOO_MANY_ATTEMPTS_TRY_LATER/gi)) {
          msg = 'Demasiados intentos, intentelo de nuevo más tarde';
        } else {
          msg = 'Ha ocurrido un problema.';
        }
        break;

    }
    const alert = await this.alertController.create({
      header: 'Error',
      animated: true,
      backdropDismiss: false,
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

}
