import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DatosProvider } from './contexts/DatosContext';
import { ProtectedRoute, GuestRoute } from './components/Guards';
import Layout from './components/Layout';
import LoginPage from './pages/Login/LoginPage';
import AvisosPage from './pages/Avisos/AvisosPage';
import AddAvisoPage from './pages/AddAviso/AddAvisoPage';
import DetallePage from './pages/Detalle/DetallePage';
import ClientesPage from './pages/Clientes/ClientesPage';
import ClientePage from './pages/Cliente/ClientePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DatosProvider>
          <Routes>
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/avisos" element={<AvisosPage />} />
              <Route path="/add-aviso/:id" element={<AddAvisoPage />} />
              <Route path="/detalle" element={<DetallePage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/cliente/:id" element={<ClientePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </DatosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
