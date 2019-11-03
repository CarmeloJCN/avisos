import { NoAvisoGuard } from './../../../guards/no-aviso.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DetallePage } from './detalle.page';

const routes: Routes = [
  {
    path: '',
    component: DetallePage,
    canLoad: [NoAvisoGuard],
    children: [

      {
        path: 'info',
        loadChildren: './info/info.module#InfoPageModule',
        canLoad: [NoAvisoGuard]
      },
      {
        path: 'cierre',
        loadChildren: './cierre/cierre.module#CierrePageModule',
        canLoad: [NoAvisoGuard]
      },
      {
        path: 'pdf',
        loadChildren: './pdf/pdf.module#PdfPageModule',
        canLoad: [NoAvisoGuard]
      },
      {
        path: '',
        redirectTo: '/detalle/info',
        pathMatch: 'full',
        canLoad: [NoAvisoGuard]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DetallePage]
})
export class DetallePageModule { }
