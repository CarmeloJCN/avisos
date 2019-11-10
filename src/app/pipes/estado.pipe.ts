import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estado'
})
export class EstadoPipe implements PipeTransform {

  transform(items: any[], value: string): any[] {
    if (!items) { return []; }
    if (!value) { return items; }

    switch (value) {
      case 'activos':
        return items.filter(item => !item.cerrado);
      case 'cerrados':
        return items.filter(item => item.cerrado);
      case 'todos':
        return items;
    }
  }

}
