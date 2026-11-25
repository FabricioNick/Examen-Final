import { useEffect, useState } from 'react';
import { api, errorApi } from '../api';
import type { Mentor, Pagina } from '../api';
import Tarjeta from '../components/Tarjeta';
import Paginacion from '../components/Paginacion';

export default function Mentores() {
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<Pagina<Mentor> | null>(null);
  const [carga, setCarga] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCarga(true);
    setError('');
    api.get<Pagina<Mentor>>('/mentors', { params: { page: pagina, size: 5 } })
      .then(({ data }) => { if (vigente) setDatos(data); })
      .catch(err => { if (vigente) setError(errorApi(err).message); })
      .finally(() => { if (vigente) setCarga(false); });
    return () => { vigente = false; };
  }, [pagina, intento]);

  return <section className="space-y-6" aria-busy={carga}>
    <div>
      <h1 className="text-3xl font-bold">Mentores</h1>
      <p className="mt-2 text-slate-600">Elige un mentor para consultar la mentoria.</p>
    </div>
    {carga ? <p role="status">Cargando mentores...</p> : error ? <div role="alert" className="mensaje-error">
      <p>No se pudo consultar la lista: {error}</p>
      <button onClick={() => setIntento(i => i + 1)} className="enlace mt-2">Reintentar</button>
    </div> : datos && <>
      <p className="text-sm text-slate-600">{datos.totalItems} mentores en el catálogo</p>
      {datos.items.length === 0 ? <p className="tarjeta">No hay mentores aqui</p> :
        <div className="grid gap-4 sm:grid-cols-2">{datos.items.map(mentor => <Tarjeta key={mentor.id} mentor={mentor} />)}</div>}
      <Paginacion pagina={datos.page} total={datos.totalPages} vacio={!datos.items.length} cambiar={setPagina} />
    </>}
  </section>;
}
