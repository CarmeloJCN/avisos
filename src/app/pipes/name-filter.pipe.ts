import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameFilter'
})
export class NameFilterPipe implements PipeTransform {

  transform(items: any[], value: string, prop: string): any[] {
    if (!items) { return []; }
    if (!value) { return items; }

    return items.filter(singleItem =>
      singleItem[prop].toLowerCase().includes(value.toLowerCase())
    );
  }

}
