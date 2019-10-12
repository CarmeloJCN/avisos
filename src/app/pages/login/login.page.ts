import { NgForm } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { UsuarioModel } from './../../models/usuario.model';
import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, NavController } from '@ionic/angular';


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
      message: 'Por favor, espere...',
    });
    await this.loading.present();
  }

  async presentAlert(err) {
    let msg: string;
    switch (err.code) {
      case ('auth/wrong-password'):
        msg = 'Contraseña incorrecta.';
        break;
      case ('auth/user-not-found'):
        msg = 'Usuario no encontrado.';
        break;
      case ('auth/too-many-requests'):
        msg = 'Demasiados intentos, intentelo de nuevo más tarde';
        break;
      default:
        msg = 'Ha ocurrido un problema.';
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
