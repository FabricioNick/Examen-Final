import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Mentores from './pages/Mentores';
import Detalle from './pages/Detalle';
import Solicitudes from './pages/Solicitudes';

function Protegida() {
  const navegar = useNavigate();
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;

  function salir() {
    localStorage.removeItem('token');
    navegar('/login', { replace: true });
  }

  return <>
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link to="/dashboard" className="text-xl font-bold text-blue-800">MentoríaUTEC</Link>
        <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-4 text-sm">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'font-bold text-blue-800 underline' : 'enlace'}>Mentores</NavLink>
          <NavLink to="/my-requests" className={({ isActive }) => isActive ? 'font-bold text-blue-800 underline' : 'enlace'}>Mis solicitudes</NavLink>
          <button onClick={salir} className="boton-secundario">Cerrar sesión</button>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-5 py-8"><Outlet /></main>
  </>;
}

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registro />} />
      <Route element={<Protegida />}>
        <Route path="/dashboard" element={<Mentores />} />
        <Route path="/mentors/:id" element={<Detalle />} />
        <Route path="/my-requests" element={<Solicitudes />} />
        <Route path="/my-requests/:id" element={<Solicitudes />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>;
}
