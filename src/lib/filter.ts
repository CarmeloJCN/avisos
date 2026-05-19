export function filterItems<T>(items: T[], value: string, prop: string[]): T[] {
  if (!items) return [];
  if (!value) return items;

  return items.filter(singleItem => {
    let encontrado = false;
    for (const i of prop) {
      const campos = i.split('.');
      if (campos.length > 1) {
        encontrado = filtrarObjetos(singleItem as Record<string, unknown>, campos, value, encontrado);
      } else {
        encontrado = filtrar(singleItem as Record<string, unknown>, i, value, encontrado);
      }
    }
    return encontrado;
  });
}

function filtrar(singleItem: Record<string, unknown>, key: string, value: string, encontrado: boolean): boolean {
  const val = singleItem[key];
  if (!val) return encontrado;
  if (Array.isArray(val)) {
    (val as string[]).forEach((it: string) => {
      if (it.toLowerCase().includes(value.toLowerCase())) {
        encontrado = true;
      }
    });
  } else {
    if (String(val).toLowerCase().includes(value.toLowerCase())) {
      encontrado = true;
    }
  }
  return encontrado;
}

function filtrarObjetos(singleItem: Record<string, unknown>, campos: string[], value: string, encontrado: boolean): boolean {
  const obj = singleItem[campos[0]] as Record<string, unknown> | undefined;
  if (!obj) return encontrado;
  const val = obj[campos[1]];
  if (Array.isArray(val)) {
    (val as string[]).forEach((it: string) => {
      if (it.toLowerCase().includes(value.toLowerCase())) {
        encontrado = true;
      }
    });
  } else {
    if (val && String(val).toLowerCase().includes(value.toLowerCase())) {
      encontrado = true;
    }
  }
  return encontrado;
}

export function filterByEstado<T extends { cerrado?: boolean }>(items: T[], value: string): T[] {
  if (!items) return [];
  if (!value) return items;

  switch (value) {
    case 'activos':
      return items.filter(item => !item.cerrado);
    case 'cerrados':
      return items.filter(item => item.cerrado);
    case 'todos':
      return items;
    default:
      return items;
  }
}
