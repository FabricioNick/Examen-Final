import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorApi } from '../api';
import type { Usuario } from '../api';

export default function Registro() {
  const navegar = useNavigate();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errores, setErrores] = useState({ nombre: '', correo: '', clave: '' });
  const [error, setError] = useState('');
  const [envio, setEnvio] = useState(false);

  async function registrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (envio) return;
    setError('');
    const campos = {
      nombre: !nombre.trim() || nombre.trim().length > 100 ? 'Ingresa un nombre de 1 a 100 caracteres.' : '',
      correo: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ? 'Ingresa un correo válido.' : '',
      clave: clave.length < 8 || clave.length > 72 ? 'Ingresa de 8 a 72 caracteres.' : '',
    };
    setErrores(campos);
    if (campos.nombre || campos.correo || campos.clave) return;
    setEnvio(true);
    try {
      await api.post<Usuario>('/auth/register', { name: nombre.trim(), email: correo.trim(), password: clave });
      navegar('/login', { replace: true, state: { registro: true } });
    } catch (err) {
      const fallo = errorApi(err);
      if (fallo.status === 409 && fallo.code === 'EMAIL_EXISTS') setErrores({ ...campos, correo: fallo.message });
      else setError(fallo.message);
    } finally { setEnvio(false); }
  }

  return <main className="mx-auto max-w-md px-5 py-12">
    <p className="mb-5 text-xl font-bold text-blue-800">MentoríaUTEC</p>
    <form noValidate onSubmit={registrar} className="tarjeta space-y-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <div>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" required autoComplete="name" value={nombre} disabled={envio}
          aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'error-nombre' : undefined}
          onChange={e => setNombre(e.target.value)} className="campo" />
        {errores.nombre && <p id="error-nombre" role="alert" className="error-campo">{errores.nombre}</p>}
      </div>
      <div>
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" required autoComplete="email" value={correo} disabled={envio}
          aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'error-correo' : undefined}
          onChange={e => setCorreo(e.target.value)} className="campo" />
        {errores.correo && <p id="error-correo" role="alert" className="error-campo">{errores.correo}</p>}
      </div>
      <div>
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" required autoComplete="new-password" value={clave} disabled={envio}
          aria-invalid={!!errores.clave} aria-describedby="ayuda-clave error-clave"
          onChange={e => setClave(e.target.value)} className="campo" />
        <p id="ayuda-clave" className="mt-1 text-sm text-slate-600">De 8 a 72 caracteres.</p>
        <p id="error-clave" role={errores.clave ? 'alert' : undefined} className="error-campo">{errores.clave}</p>
      </div>
      {error && <p role="alert" className="mensaje-error">{error}</p>}
      <button disabled={envio} className="boton w-full">{envio ? 'Registrando...' : 'Registrarme'}</button>
      <p className="text-center text-sm">Ya tienes cuenta? <Link to="/login" className="enlace">Iniciar sesión</Link></p>
    </form>
  </main>;
}
