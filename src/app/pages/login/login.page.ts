import { AuthService } from './../../services/auth.service';
import { UsuarioModel } from './../../models/usuario.model';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';


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
    public loadingController: LoadingController
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
      }
      this.router.navigateByUrl('/home');
      console.log(resp);

    }, (err) => {
      console.log(err);

    });

  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Por favor, espere...',
    });
    await this.loading.present();
  }

}
