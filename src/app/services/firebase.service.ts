import { ClienteModel } from './../models/cliente.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {


  constructor(
    private firestore: AngularFirestore
  ) { }

  createClient(cliente: ClienteModel) {
    return this.firestore.collection('clientes').add(cliente);
  }

  readClients() {
    return this.firestore.collection('clientes').snapshotChanges();
  }

  readClient(clienteID: string) {
    return this.firestore.doc('clientes/' + clienteID).get();
  }

  updateClient(clienteID: string, cliente: ClienteModel) {
    return this.firestore.doc('clientes/' + clienteID).update(cliente);
  }

  deleteClient(clienteID: string) {
    this.firestore.doc('clientes/' + clienteID).delete();
  }

}
