import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, BarChart3, Users, DollarSign, Calendar } from "lucide-react";

interface DemoSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  stats: { label: string; value: string }[];
}

const demoSlides: DemoSlide[] = [
  {
    id: 1,
    title: "Organize sua Agenda",
    description: "Gerencie todos os agendamentos em um único lugar com sincronização em tempo real",
    icon: <Calendar className="w-16 h-16 text-blue-500" />,
    bgColor: "from-blue-50 to-blue-100",
    stats: [
      { label: "Agendamentos", value: "227" },
      { label: "Taxa de ocupação", value: "94%" },
    ],
  },
  {
    id: 2,
    title: "Controle Financeiro",
    description: "Acompanhe receitas, despesas e lucros com relatórios detalhados",
    icon: <DollarSign className="w-16 h-16 text-green-500" />,
    bgColor: "from-green-50 to-green-100",
    stats: [
      { label: "Receita Hoje", value: "R$ 1.580,00" },
      { label: "Crescimento", value: "+12%" },
    ],
  },
  {
    id: 3,
    title: "Gerencie Clientes",
    description: "Mantenha informações completas de todos os seus clientes organizadas",
    icon: <Users className="w-16 h-16 text-purple-500" />,
    bgColor: "from-purple-50 to-purple-100",
    stats: [
      { label: "Clientes Ativos", value: "5.042" },
      { label: "Novos Clientes", value: "+12" },
    ],
  },
  {
    id: 4,
    title: "Relatórios Inteligentes",
    description: "Analise dados com gráficos interativos e tome decisões baseadas em dados",
    icon: <BarChart3 className="w-16 h-16 text-orange-500" />,
    bgColor: "from-orange-50 to-orange-100",
    stats: [
      { label: "Faturamento Mensal", value: "R$ 42.950" },
      { label: "Ticket Médio", value: "R$ 13.975" },
    ],
  },
];

export default function DemoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + demoSlides.length) % demoSlides.length);
    setIsAutoPlay(false);
  };

  const slide = demoSlides[currentSlide];

  return (
    <div className="w-full">
      {/* Main Carousel */}
      <div className={`bg-gradient-to-br ${slide.bgColor} rounded-3xl p-8 md:p-12 min-h-[500px] flex flex-col justify-between transition-all duration-500`}>
        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-center h-24">
            <div className="animate-bounce" style={{ animationDelay: "0s" }}>
              {slide.icon}
            </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
              {slide.title}
            </h3>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          {slide.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-soft hover:shadow-lg transition-all"
              style={{
                animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
              }}
            >
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-8">
        {/* Dots */}
        <div className="flex gap-2 flex-1 justify-center">
          {demoSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "bg-primary w-8"
                  : "bg-gray-300 w-3 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex gap-3 ml-4">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-soft hover:shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-soft hover:shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Auto-play indicator */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          {isAutoPlay ? "▶ Auto-play ativo" : "⏸ Pausado"}
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
