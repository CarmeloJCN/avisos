import { NameFilterPipe } from './name-filter.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    NameFilterPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [NameFilterPipe]
})
export class PipesModule { }
