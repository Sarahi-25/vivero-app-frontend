import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import './index.css';

import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import { Plantas, NuevaPlanta } from './pages/Plantas';
import Movimientos from './pages/Movimientos';
import Ganancias   from './pages/Ganancias';
import Personal    from './pages/Personal';
import Reportes    from './pages/Reportes';

function ProtectedRoute({ children }) {
  const { usuario } = useApp();
  return usuario ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter   >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/plantas"      element={<ProtectedRoute><Plantas /></ProtectedRoute>} />
        <Route path="/plantas/nueva" element={<ProtectedRoute><NuevaPlanta /></ProtectedRoute>} />
        <Route path="/movimientos"  element={<ProtectedRoute><Movimientos /></ProtectedRoute>} />
        <Route path="/ganancias"    element={<ProtectedRoute><Ganancias /></ProtectedRoute>} />
        <Route path="/personal"     element={<ProtectedRoute><Personal /></ProtectedRoute>} />
        <Route path="/reportes"     element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
