import { UsuarioModel } from './../models/usuario.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'https://identitytoolkit.googleapis.com/v1/accounts';
  private apiKey = 'AIzaSyA1tEN8jUT7Ol5TZMdbxBvmPdGo_CQXHBc';
  userToken: string;

  constructor(
    private http: HttpClient,
    private nav: Router
    ) {
    this.leerToken();
  }

  logOut() {
    this.userToken = '';
    localStorage.removeItem('token');
    this.nav.navigateByUrl('login');

  }

  login(usuario: UsuarioModel) {
    const authData = {
      ...usuario,
      returnSecureToken: true
    };

    return this.http.post(
      `${this.url}:signInWithPassword?key=${this.apiKey}`,
      authData
    ).pipe(
      map((resp: any) => {
        this.guardarToken(resp);
        return resp;
      })
    );
  }


  nuevoUsuario(usuario: UsuarioModel) {

    const authData = {
      ...usuario,
      returnSecureToken: true
    };

    return this.http.post(
      `${this.url}:signUp?key=${this.apiKey}`,
      authData
    ).pipe(
      map((resp: any) => {
        this.guardarToken(resp);
        return resp;
      })
    );
  }

  private guardarToken(resp: any) {
    this.userToken = resp.idToken;
    localStorage.setItem('token', resp.idToken);
    localStorage.setItem('expiresIn', resp.expiresIn);
    const hoy = new Date();
    hoy.setSeconds(Number(localStorage.getItem('expiresIn')));
    localStorage.setItem('expira', hoy.getTime().toString());

  }

  leerToken() {
    if (localStorage.getItem('token')) {
      this.userToken = localStorage.getItem('token');
    } else {
      this.userToken = '';
    }

    return this.userToken;
  }

  autentificado(): boolean {

    if (this.userToken.length < 2) {
      return false;
    }
    const expira = Number(localStorage.getItem('expira'));
    const expiraDate = new Date();
    expiraDate.setTime(expira);

    if (expiraDate > new Date()) {
      return true;
    }
    return false;
  }
}
