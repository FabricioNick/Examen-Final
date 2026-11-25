import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, errorApi } from '../api';
import type { Sesion } from '../api';

export default function Login() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errores, setErrores] = useState({ correo: '', clave: '' });
  const [error, setError] = useState('');
  const [envio, setEnvio] = useState(false);

  async function ingresar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (envio) return;
    setError('');
    const campos = {
      correo: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ? 'Ingresa un correo válido.' : '',
      clave: !clave ? 'Ingresa tu contraseña.' : '',
    };
    setErrores(campos);
    if (campos.correo || campos.clave) return;
    setEnvio(true);
    try {
      const { data } = await api.post<Sesion>('/auth/login', { email: correo.trim(), password: clave });
      localStorage.setItem('token', data.token);
      navegar('/dashboard', { replace: true });
    } catch (err) {
      const fallo = errorApi(err);
      setError(fallo.status === 401 ? 'Correo o contraseña incorrectos.' : fallo.message);
    } finally { setEnvio(false); }
  }

  return <main className="mx-auto max-w-md px-5 py-12">
    <p className="mb-5 text-xl font-bold text-blue-800">MentoriaUTEC</p>
    <form noValidate onSubmit={ingresar} className="tarjeta space-y-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <p className="text-slate-600">Consulta mentores y maneja solicitudes</p>
      {ubicacion.state?.registro && <p role="status" className="mensaje-exito">Cuenta creada. Inicia sesión.</p>}
      <div>
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" required autoComplete="email" value={correo} disabled={envio}
          aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'error-correo' : undefined}
          onChange={e => setCorreo(e.target.value)} className="campo" />
        {errores.correo && <p id="error-correo" role="alert" className="error-campo">{errores.correo}</p>}
      </div>
      <div>
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" required autoComplete="current-password" value={clave} disabled={envio}
          aria-invalid={!!errores.clave} aria-describedby={errores.clave ? 'error-clave' : undefined}
          onChange={e => setClave(e.target.value)} className="campo" />
        {errores.clave && <p id="error-clave" role="alert" className="error-campo">{errores.clave}</p>}
      </div>
      {error && <p role="alert" className="mensaje-error">{error}</p>}
      <button disabled={envio} className="boton w-full">{envio ? 'Ingresando...' : 'Ingresar'}</button>
      <p className="text-center text-sm"> No hay cuenta? <Link to="/register" className="enlace">crear cuenta</Link></p>
    </form>
  </main>;
}
