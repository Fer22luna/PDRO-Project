export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Portal de Decretos, Resoluciones y Ordenanzas
            </h3>
            <p className="text-sm text-gray-600">
              Sistema de gestión y publicación de normativas institucionales
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Enlaces Útiles</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <a href="/" className="hover:text-primary">Portal Público</a>
              </li>
              <li>
                <a href="/admin" className="hover:text-primary">Administración</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contacto</h4>
            <p className="text-sm text-gray-600">
              Email: info@pdro.gob
              <br />
              Tel: (123) 456-7890
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PDRO. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
