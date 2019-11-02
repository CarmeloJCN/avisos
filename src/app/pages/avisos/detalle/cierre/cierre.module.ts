import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SignaturePadModule } from 'angular2-signaturepad';

import { IonicModule } from '@ionic/angular';

import { CierrePage } from './cierre.page';

const routes: Routes = [
  {
    path: '',
    component: CierrePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TranslateModule,
    SignaturePadModule
  ],
  declarations: [CierrePage],
  providers: [DecimalPipe, TranslateService]
})
export class CierrePageModule { }
