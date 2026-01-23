export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200/70">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 text-gray-700">
            <h3 className="font-semibold text-gray-900">
              Portal de Decretos, Resoluciones y Ordenanzas
            </h3>
            <p className="text-sm">
              Sistema de gestión y publicación de normativas institucionales
            </p>
          </div>
          <div className="space-y-3 text-gray-700 min-h-[130px] flex flex-col justify-center">
            <h4 className="font-semibold text-gray-900">Enlaces Útiles</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/" className="hover:text-primary">Portal Público</a>
              </li>
              <li>
                <a href="/admin" className="hover:text-primary">Administración</a>
              </li>
            </ul>
          </div>
          <div className="space-y-2 text-gray-700">
            <h4 className="font-semibold text-gray-900">Contacto</h4>
            <p className="text-sm">
              Email: info@pdro.gob
              <br />
              Tel: (123) 456-7890
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300/70 to-transparent" />
          <p className="pt-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} PDRO. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
