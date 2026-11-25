import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errorApi } from '../api';
import type { Mentor, Solicitud } from '../api';

export default function Detalle() {
  const { id } = useParams();
  const [dato, setDato] = useState<Mentor | null>(null);
  const [tema, setTema] = useState('');
  const [errorTema, setErrorTema] = useState('');
  const [errorConsulta, setErrorConsulta] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  const [aviso, setAviso] = useState('');
  const [carga, setCarga] = useState(true);
  const [envio, setEnvio] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setTema('');
    setErrorTema('');
    setErrorEnvio('');
    setAviso('');
  }, [id]);

  useEffect(() => {
    let vigente = true;
    setDato(null);
    setCarga(true);
    setErrorConsulta('');
    api.get<Mentor>(`/mentors/${id}`)
      .then(({ data }) => { if (vigente) setDato(data); })
      .catch(err => { if (vigente) setErrorConsulta(errorApi(err).message); })
      .finally(() => { if (vigente) setCarga(false); });
    return () => { vigente = false; };
  }, [id, intento]);

  async function solicitar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dato || envio || carga) return;
    setErrorEnvio('');
    setAviso('');
    const texto = tema.trim();
    const valido = texto.length >= 5 && texto.length <= 100;
    setErrorTema(valido ? '' : 'No escribas mucho xd, solo 100 caracteres');
    if (!valido) return;
    setEnvio(true);
    let actualizar = false;
    try {
      const { data } = await api.post<Solicitud>(`/mentors/${dato.id}/requests`, { topic: texto });
      setAviso(`Solicitud #${data.id} creada. Estado: ${data.status}.`);
      setTema('');
      actualizar = true;
    } catch (err) {
      const fallo = errorApi(err);
      if (fallo.status === 409 && fallo.code === 'NO_CAPACITY') {
        setErrorEnvio('E mentor ya no tiene cupos disponibles');
        actualizar = true;
      } else if (fallo.status === 400 && fallo.code === 'INVALID_INPUT') setErrorTema(fallo.message);
      else setErrorEnvio(`No se pudo crear la solicitud: ${fallo.message}`);
    } finally {
      if (actualizar) {
        setCarga(true);
        setIntento(i => i + 1);
      }
      setEnvio(false);
    }
  }

  return <section className="space-y-5">
    <Link to="/dashboard" className="enlace">Volver al dashboard</Link>
    {aviso && <p role="status" className="mensaje-exito">{aviso} <Link to="/my-requests" className="enlace">Ver mis solicitudes</Link></p>}
    {errorEnvio && <p role="alert" className="mensaje-error">{errorEnvio}</p>}
    {carga ? <p role="status">Cargando detalle...</p> : errorConsulta ? <div role="alert" className="mensaje-error">
      <p>No se pudo consultar el detalle: {errorConsulta}</p>
      <button onClick={() => setIntento(i => i + 1)} className="enlace mt-2">Reintentar consulta</button>
    </div> : dato && <>
      <article className="tarjeta space-y-3">
        <h1 className="text-3xl font-bold">{dato.name}</h1>
        <p>{dato.description}</p>
        <dl className="space-y-2">
          <div><dt className="inline font-semibold">Especialidad: </dt><dd className="inline">{dato.specialty}</dd></div>
          <div><dt className="inline font-semibold">Modalidad: </dt><dd className="inline">{dato.modality}</dd></div>
          <div><dt className="inline font-semibold">Cupos disponibles: </dt><dd className="inline">{dato.availableSlots}</dd></div>
        </dl>
      </article>
      <form noValidate onSubmit={solicitar} className="tarjeta space-y-4">
        <h2 className="text-xl font-bold">Solicitar mentoría</h2>
        <div>
          <label htmlFor="tema">Tema de la mentoría</label>
          <textarea id="tema" required rows={3} value={tema} disabled={envio}
            onChange={e => setTema(e.target.value)} className="campo"
            aria-invalid={!!errorTema} aria-describedby="ayuda-tema error-tema" />
          <p id="ayuda-tema" className="mt-1 text-sm text-slate-600">No escribas mucho xd, solo 100 caracteres</p>
          <p id="error-tema" role={errorTema ? 'alert' : undefined} className="error-campo">{errorTema}</p>
        </div>
        <button disabled={envio || carga} className="boton">{envio ? 'Enviando...' : 'Solicitar mentoría'}</button>
      </form>
    </>}
  </section>;
}
