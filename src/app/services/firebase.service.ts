import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  createClient(cliente) {
    return this.firestore.collection('clientes').add(cliente);
  }

  readClients() {
    return this.firestore.collection('clientes').snapshotChanges();
  }

  updateClient(clienteID: string, cliente) {
    this.firestore.doc('clientes/' + clienteID).update(cliente);
  }

  deleteClient(clienteID: string) {
    this.firestore.doc('clientes/' + clienteID).delete();
  }
}
