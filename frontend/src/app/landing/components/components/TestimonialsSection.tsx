import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Marina Silva",
    role: "Proprietária",
    company: "Salão Marina Beleza",
    content: "O Atendo transformou completamente meu salão. Aumentei meus agendamentos em 40% e consigo controlar tudo de um único lugar. Recomendo demais!",
    rating: 5,
    avatar: "👩‍💼"
  },
  {
    name: "Carlos Mendes",
    role: "Gerente",
    company: "Clínica Estética Premium",
    content: "Antes gastava horas com planilhas. Agora o sistema faz tudo automaticamente. Meu faturamento cresceu 35% em 3 meses.",
    rating: 5,
    avatar: "👨‍💼"
  },
  {
    name: "Juliana Costa",
    role: "Proprietária",
    company: "Studio de Pilates",
    content: "A integração com WhatsApp é incrível! Meus clientes recebem confirmações automáticas e nunca mais faltam reuniões.",
    rating: 5,
    avatar: "👩‍🏫"
  },
  {
    name: "Roberto Alves",
    role: "Dono",
    company: "Academia Força Total",
    content: "O ROI foi imediato. Consegui aumentar meu ticket médio com a precificação inteligente. Melhor investimento que fiz.",
    rating: 5,
    avatar: "👨‍🏫"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-muted/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 animate-slide-in-up">
            Confie em Quem Já Transformou Seu Negócio
          </h2>
          <p className="text-lg text-muted-foreground animate-slide-in-up stagger-1">
            Milhares de proprietários e gerentes já aumentaram sua receita com o Atendo
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-none animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 line-clamp-4">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-border">
          <div className="text-center animate-slide-in-up">
            <div className="text-4xl font-bold text-primary mb-2">5000+</div>
            <p className="text-muted-foreground">Clientes Satisfeitos</p>
          </div>
          <div className="text-center animate-slide-in-up stagger-1">
            <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
            <p className="text-muted-foreground">Avaliação Média</p>
          </div>
          <div className="text-center animate-slide-in-up stagger-2">
            <div className="text-4xl font-bold text-primary mb-2">+35%</div>
            <p className="text-muted-foreground">Aumento Médio de Receita</p>
          </div>
        </div>
      </div>
    </section>
  );
}
