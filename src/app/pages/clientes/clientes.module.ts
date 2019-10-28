import { PipesModule } from './../../pipes/pipes.module';
import { FilterPipe } from '../../pipes/filter.pipe';
import { ClientesComponent } from './clientes.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: ClientesComponent
  }
];

@NgModule({
  declarations: [ClientesComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipesModule
  ]
})
export class ClientesPageModule { }
