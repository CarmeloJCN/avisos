import { NavController } from '@ionic/angular';
import { UsuarioModel } from './../models/usuario.model';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: User;

  constructor(
    public afAuth: AngularFireAuth, public nav: NavController
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  async logOut() {
    await this.afAuth.auth.signOut();
    localStorage.removeItem('user');
    this.nav.navigateForward(['/login']);

  }
  async login(usuario: UsuarioModel) {
    const result = await this.afAuth.auth.signInWithEmailAndPassword(usuario.email, usuario.password);
    this.nav.navigateForward(['/avisos']);
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }

}
