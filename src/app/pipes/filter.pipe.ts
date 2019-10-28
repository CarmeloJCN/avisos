import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], value: string, prop: Array<string>): any[] {
    if (!items) { return []; }
    if (!value) { return items; }

    return items.filter(singleItem => {
      let encontrado = false;
      for (const i of prop) {
        const valor = i.split('.');
        if (valor.length > 1) {
          encontrado = this.filtrarObjetos(singleItem, valor, value, encontrado);

        } else {
          encontrado = this.filtrar(singleItem, i, value, encontrado);
        }
      }
      return encontrado;
    });
  }


  private filtrar(singleItem: any, i: string, value: string, encontrado: boolean) {
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
    return encontrado;
  }

  private filtrarObjetos(singleItem: any, valor: string[], value: string, encontrado: boolean) {
    if (Array.isArray(singleItem[valor[0]][valor[1]])) {
      singleItem[valor[0]][valor[1]].forEach((it: string) => {
        if (it.includes(value.toLowerCase())) {
          encontrado = true;
        }
      });
    } else {
      if (singleItem[valor[0]][valor[1]].toLowerCase().includes(value.toLowerCase())) {
        encontrado = true;
      }
    }
    return encontrado;
  }
}
