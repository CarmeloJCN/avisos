import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameFilter'
})
export class NameFilterPipe implements PipeTransform {

  transform(items: any[], value: string, prop: Array<string>): any[] {
    if (!items) { return []; }
    if (!value) { return items; }

    return items.filter(singleItem => {
      let encontrado = false;
      for (const i of prop) {
        if (Array.isArray(singleItem[i])) {
          singleItem[i].forEach((it: string) => {
            if (it.includes(value.toLowerCase())) {
              encontrado = true;
            }
          });
        } else {
          if (singleItem[i].toLowerCase().includes(value.toLowerCase())) {
            encontrado = true;
          }
        }

      }
      return encontrado;
    }
    );
  }

}
