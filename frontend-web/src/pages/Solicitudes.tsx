import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errorApi } from '../api';
import type { Solicitud } from '../api';

export default function Solicitudes() {
  const { id } = useParams();
  const [datos, setDatos] = useState<Solicitud[]>([]);
  const [carga, setCarga] = useState(true);
  const [errorConsulta, setErrorConsulta] = useState('');
  const [errorCancelacion, setErrorCancelacion] = useState('');
  const [aviso, setAviso] = useState('');
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCarga(true);
    setErrorConsulta('');
    api.get<Solicitud[]>('/me/requests')
      .then(({ data }) => { if (vigente) setDatos(data); })
      .catch(err => { if (vigente) setErrorConsulta(errorApi(err).message); })
      .finally(() => { if (vigente) setCarga(false); });
    return () => { vigente = false; };
  }, [id, intento]);

  const visibles = id ? datos.filter(solicitud => String(solicitud.id) === id) : datos;

  async function cancelar(solicitud: Solicitud) {
    if (cancelando !== null || carga || solicitud.status !== 'PENDING') return;
    if (!window.confirm(`¿Cancelar la solicitud #${solicitud.id} con ${solicitud.resourceName}?`)) return;
    setErrorCancelacion('');
    setAviso('');
    setCancelando(solicitud.id);
    let actualizar = false;
    try {
      const { data } = await api.patch<Solicitud>(`/requests/${solicitud.id}/cancel`);
      setAviso(`Solicitud #${data.id} cancelada. Estado: ${data.status}.`);
      actualizar = true;
    } catch (err) {
      const fallo = errorApi(err);
      if (fallo.status === 409 && fallo.code === 'INVALID_STATE') {
        setErrorCancelacion('Se actualizará la lista.');
        actualizar = true;
      } else setErrorCancelacion(`No se pudo cancelar la solicitud: ${fallo.message}`);
    } finally {
      if (actualizar) {
        setCarga(true);
        setIntento(i => i + 1);
      }
      setCancelando(null);
    }
  }

  return <section className="space-y-5">
    <div>
      <h1 className="text-3xl font-bold">{id ? 'Detalle de solicitud' : 'Mis solicitudes'}</h1>
      <p className="mt-2 text-slate-600">Consulta tus mentorías y cancela las solicitudes.</p>
    </div>
    {id && <Link to="/my-requests" className="enlace">Volver a mis solicitudes</Link>}
    {aviso && <p role="status" className="mensaje-exito">{aviso}</p>}
    {errorCancelacion && <p role="alert" className="mensaje-error">{errorCancelacion}</p>}
    {carga ? <p role="status">Cargando solicitudes...</p> : errorConsulta ? <div role="alert" className="mensaje-error">
      <p>No se pudo consultar la lista: {errorConsulta}</p>
      <button onClick={() => setIntento(i => i + 1)} className="enlace mt-2">Reintentar consulta</button>
    </div> : visibles.length === 0 ? <div className="tarjeta space-y-3">
      <p>{id ? 'La solicitud no está en tu lista de solicitudes.' : 'Aún no tienes solicitudes de mentoría.'}</p>
      <Link to="/dashboard" className="enlace">Ver mentores</Link>
    </div> : <div className="grid gap-4 sm:grid-cols-2">
      {visibles.map(solicitud => <article key={solicitud.id} className="tarjeta flex flex-col items-start gap-3">
        <h2 className="text-xl font-bold">{solicitud.resourceName}</h2>
        <p className="text-sm text-slate-600">Solicitud #{solicitud.id}</p>
        <p><strong>Tema: </strong>{solicitud.topic}</p>
        <p className={solicitud.status === 'PENDING' ? 'rounded bg-blue-50 px-2 py-1 font-semibold text-blue-800' : 'rounded bg-slate-100 px-2 py-1 font-semibold'}>
          Estado: {solicitud.status}
        </p>
        {!id && <Link to={`/my-requests/${solicitud.id}`} className="enlace">Ver detalle de solicitud</Link>}
        <Link to={`/mentors/${solicitud.resourceId}`} className="enlace">Ver detalle del mentor</Link>
        {solicitud.status === 'PENDING' && <button className="boton-secundario mt-auto"
          aria-label={`Cancelar solicitud #${solicitud.id}`} disabled={cancelando !== null}
          onClick={() => cancelar(solicitud)}>
          {cancelando === solicitud.id ? 'Cancelando...' : 'Cancelar solicitud'}
        </button>}
      </article>)}
    </div>}
  </section>;
}
