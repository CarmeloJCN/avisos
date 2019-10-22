import { ClienteModel } from './../models/cliente.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { tap, take } from 'rxjs/operators';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {


  constructor(
    private firestore: AngularFirestore
  ) { }

  addCliente(cliente: ClienteModel) {
    return this.firestore.collection('clientes').add(cliente);
  }

  leerClientes() {
    return this.firestore.collection('clientes').snapshotChanges();
  }

  leerCliente(clienteID: string) {
    return this.firestore.doc('clientes/' + clienteID).get();
  }

  actualizarCliente(clienteID: string, cliente: ClienteModel) {
    return this.firestore.doc('clientes/' + clienteID).update(cliente);
  }

  borrarCliente(clienteID: string) {
    this.firestore.doc('clientes/' + clienteID).delete();
  }

  leerTecnico(usuarioUID: string) {
    return this.firestore.collection('usuarios', ref => ref.where('uid', '==', usuarioUID))
      .snapshotChanges().pipe(take(1));
  }

}
