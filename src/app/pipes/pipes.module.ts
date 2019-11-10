import { FilterPipe } from './filter.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoPipe } from './estado.pipe';



@NgModule({
  declarations: [
    FilterPipe,
    EstadoPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [FilterPipe, EstadoPipe]
})
export class PipesModule { }
