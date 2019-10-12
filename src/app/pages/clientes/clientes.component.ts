import { FirebaseService } from './../../services/firebase.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {

  clientes: any;
  studentName;
  studentAge;
  studentAddress;

  constructor(
    private fb: FirebaseService
  ) { }

  ngOnInit() {
    this.fb.readClients().subscribe(data => {
      this.clientes = data.map(c => {
        return {
          id: c.payload.doc.id,
          isEdit: false,
          Name: c.payload.doc.data()['Name'],
          Age: c.payload.doc.data()['Age'],
          Address: c.payload.doc.data()['Address'],
        };
      });
    });
  }

  CreateRecord() {
    const record = {};
    record['Name'] = this.studentName;
    record['Age'] = this.studentAge;
    record['Address'] = this.studentAddress;
    this.fb.createClient(record).then(resp => {
      this.studentName = '';
      this.studentAge = undefined;
      this.studentAddress = '';
      console.log(resp);
    })
      .catch(error => {
        console.log(error);
      });
  }

}
