import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.page.html',
  styleUrls: ['./avisos.page.scss'],
})
export class AvisosPage implements OnInit {

  constructor(
    private nav: NavController
  ) { }

  ngOnInit() {
  }



  addAviso() {
    this.nav.navigateForward('/add-aviso/new');
  }

}
