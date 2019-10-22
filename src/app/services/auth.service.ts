import { Subject } from 'rxjs';
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
  unsubscribe$: Subject<void> = new Subject();
  userUID$: Subject<string> = new Subject();

  constructor(
    public afAuth: AngularFireAuth, public nav: NavController
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.user = user;
        this.userUID$.next(user.uid);
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

  logOut() {
    this.unsuscribe();
    this.afAuth.auth.signOut();
    localStorage.removeItem('user');
  }

  unsuscribe() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async login(usuario: UsuarioModel) {
    const result = await this.afAuth.auth.signInWithEmailAndPassword(usuario.email, usuario.password);
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }

}
