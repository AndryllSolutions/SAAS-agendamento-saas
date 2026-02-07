import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { Button } from "./ui/button";

export default function FooterImproved() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Atendo</h3>
            <p className="text-background/70 text-sm mb-6">
              Sistema de gestão B2B que transforma seu negócio em receita.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Produto</h4>
            <ul className="space-y-3">
              <li><a href="#funcionalidades" className="text-background/70 hover:text-background transition-colors">Funcionalidades</a></li>
              <li><a href="#planos" className="text-background/70 hover:text-background transition-colors">Planos</a></li>
              <li><a href="#comparacao" className="text-background/70 hover:text-background transition-colors">Comparação</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Roadmap</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Empresa</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Carreiras</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Imprensa</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Privacidade</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Termos</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Cookies</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">LGPD</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-background/70 hover:text-background transition-colors cursor-pointer">
                <Mail size={16} />
                <span className="text-sm">suporte@atendo.com</span>
              </li>
              <li className="flex items-center gap-2 text-background/70 hover:text-background transition-colors cursor-pointer">
                <Phone size={16} />
                <span className="text-sm">+55 (11) 9999-9999</span>
              </li>
              <li className="flex items-center gap-2 text-background/70 hover:text-background transition-colors cursor-pointer">
                <MapPin size={16} />
                <span className="text-sm">São Paulo, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-primary/10 rounded-2xl p-8 mb-12 border border-primary/20">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">Fique Atualizado</h3>
            <p className="text-background/70 mb-4">Receba dicas exclusivas e novidades sobre gestão de negócios</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap">
                Inscrever
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-background/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm">
              © {currentYear} Atendo. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-background/70 hover:text-background transition-colors">Status</a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">Segurança</a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
