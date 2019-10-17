import { NameFilterPipe } from './../../pipes/name-filter.pipe';
import { AuthGuard } from './../../guards/auth.guard';
import { ClientesComponent } from './clientes.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [ClientesComponent, NameFilterPipe],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: ClientesComponent,
        canActivate: [AuthGuard]
      }
    ])
  ]
})
export class ClientesPageModule { }
