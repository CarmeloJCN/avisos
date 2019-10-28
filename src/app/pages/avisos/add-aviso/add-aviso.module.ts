import { ComponentsModule } from './../../../components/components.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { IonicSelectableModule } from 'ionic-selectable';

import { AddAvisoPage } from './add-aviso.page';

const routes: Routes = [
  {
    path: '',
    component: AddAvisoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    IonicSelectableModule,
    TranslateModule,
    ComponentsModule
  ],
  declarations: [AddAvisoPage],
  providers: [DatePipe, TranslateService]
})
export class AddAvisoPageModule { }
