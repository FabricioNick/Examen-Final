import { Link } from 'react-router-dom';
import type { Mentor } from '../api';

export default function Tarjeta({ mentor }: { mentor: Mentor }) {
  return <article className="tarjeta flex flex-col items-start gap-3">
    <h2 className="text-xl font-bold">{mentor.name}</h2>
    <dl className="space-y-2">
      <div><dt className="inline font-semibold">Especialidad: </dt><dd className="inline">{mentor.specialty}</dd></div>
      <div><dt className="inline font-semibold">Modalidad: </dt><dd className="inline">{mentor.modality}</dd></div>
      <div><dt className="inline font-semibold">Cupos disponibles: </dt><dd className="inline">{mentor.availableSlots}</dd></div>
    </dl>
    <Link to={`/mentors/${mentor.id}`} className="enlace mt-auto">Ver detalle</Link>
  </article>;
}
