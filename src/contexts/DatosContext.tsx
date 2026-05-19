/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Aviso, Cliente } from '../types/models';

interface DatosContextType {
  avisoElegido: Aviso | null;
  setAvisoElegido: (aviso: Aviso | null) => void;
  clientes: Cliente[];
  setClientes: (clientes: Cliente[]) => void;
}

const DatosContext = createContext<DatosContextType | undefined>(undefined);

export function DatosProvider({ children }: { children: ReactNode }) {
  const [avisoElegido, setAvisoElegido] = useState<Aviso | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  return (
    <DatosContext.Provider value={{ avisoElegido, setAvisoElegido, clientes, setClientes }}>
      {children}
    </DatosContext.Provider>
  );
}

export function useDatos() {
  const context = useContext(DatosContext);
  if (!context) throw new Error('useDatos must be used within DatosProvider');
  return context;
}
