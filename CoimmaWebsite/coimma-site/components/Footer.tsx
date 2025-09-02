// Footer component for COIMMA website
export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">COIMMA</h3>
          <address className="not-italic text-gray-600">
            <p>Endereço: Rodovia SP 425, Km 344</p>
            <p>CEP 17.280-000 - Pederneiras - SP</p>
            <p>Telefone: (18) 3821-9900</p>
            <p>Email: contato@coimma.com.br</p>
          </address>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4">Plantões</h3>
          <p className="text-gray-600">Plantão Técnico: (18) 99999-9999</p>
          <p className="text-gray-600">Plantão Comercial: (18) 99999-9999</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4">Links Úteis</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="/politica-privacidade" className="hover:underline">Política de Privacidade</a></li>
            <li><a href="/termos-uso" className="hover:underline">Termos de Uso</a></li>
            <li><a href="/trabalhe-conosco" className="hover:underline">Trabalhe Conosco</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} COIMMA - Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
