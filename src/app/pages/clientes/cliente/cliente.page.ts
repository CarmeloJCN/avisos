import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
})
export class ClientePage implements OnInit {

  constructor(
    private nav: NavController,
  ) { }

  ngOnInit() {

  }

  cerrar() {
    this.nav.back();
  }

}
