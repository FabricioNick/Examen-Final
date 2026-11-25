interface Props {
  pagina: number;
  total: number;
  vacio: boolean;
  cambiar: (pagina: number) => void;
}

export default function Paginacion({ pagina, total, vacio, cambiar }: Props) {
  return <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-4">
    <button className="boton-secundario" disabled={vacio || pagina <= 1} onClick={() => cambiar(pagina - 1)}>Anterior</button>
    <span>Página {pagina} de {total}</span>
    <button className="boton-secundario" disabled={vacio || pagina >= total} onClick={() => cambiar(pagina + 1)}>Siguiente</button>
  </nav>;
}
