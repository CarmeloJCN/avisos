import { AngularFireStorageModule } from '@angular/fire/storage';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AvisosPage } from './avisos.page';

const routes: Routes = [
  {
    path: '',
    component: AvisosPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipesModule,
    TranslateModule,
    AngularFireStorageModule
  ],
  declarations: [AvisosPage],
  providers: [TranslateService]
})
export class AvisosPageModule { }
