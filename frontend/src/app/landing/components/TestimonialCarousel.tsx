import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { Button } from "./ui/button";
import { testimonials, testimonialLabels } from "../lib/testimonialData";
import { useLanguage } from "../contexts/LanguageContext";
import { useCurrency } from "../contexts/CurrencyContext";

export default function TestimonialCarousel() {
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTestimonial, setSelectedTestimonial] = useState<string | null>(null);

  const labels = testimonialLabels[language as keyof typeof testimonialLabels] || testimonialLabels.pt;

  // Filtrar depoimentos por país baseado na moeda
  const countryMap: Record<string, "br" | "ar" | "py"> = {
    BRL: "br",
    ARS: "ar",
    PYG: "py",
  };

  const selectedCountry = countryMap[currency] || "br";
  const filteredTestimonials = testimonials.filter((t) => t.country === selectedCountry);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredTestimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === filteredTestimonials.length - 1 ? 0 : prev + 1));
  };

  if (filteredTestimonials.length === 0) {
    return null;
  }

  const currentTestimonial = filteredTestimonials[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-foreground">{labels.title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{labels.subtitle}</p>
        </div>

        {/* Carrossel Principal */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Vídeo/Imagem */}
              <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 aspect-video lg:aspect-auto flex items-center justify-center">
                {currentTestimonial.videoUrl ? (
                  <div className="w-full h-full relative group cursor-pointer">
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <button
                        onClick={() => setSelectedTestimonial(currentTestimonial.id)}
                        className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full transition-all transform group-hover:scale-110"
                      >
                        <Play className="w-8 h-8 fill-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-8 lg:p-10 flex flex-col justify-between">
                {/* Avaliação */}
                <div className="flex gap-1 mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Depoimento */}
                <p className="text-lg text-foreground mb-6 leading-relaxed italic">"{currentTestimonial.text}"</p>

                {/* Autor */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-foreground">{currentTestimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
                  <p className="text-sm text-primary font-semibold">{currentTestimonial.company}</p>
                </div>

                {/* ROI */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <p className="text-xs uppercase font-bold text-muted-foreground mb-2">{labels.metric}</p>
                  <p className="text-sm text-foreground mb-3">{currentTestimonial.roi.metric}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{labels.before}</p>
                      <p className="font-bold text-foreground">{currentTestimonial.roi.before}</p>
                    </div>
                    <div className="text-primary">→</div>
                    <div>
                      <p className="text-xs text-muted-foreground">{labels.after}</p>
                      <p className="font-bold text-foreground">{currentTestimonial.roi.after}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded px-3 py-2 text-center">
                    <p className="text-sm font-bold text-green-700">
                      +{currentTestimonial.roi.percentage}% {labels.increase}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full w-12 h-12"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Indicadores */}
            <div className="flex gap-2">
              {filteredTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary w-8" : "bg-primary/30 w-2"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full w-12 h-12"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Contador */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {currentIndex + 1} / {filteredTestimonials.length}
          </p>
        </div>

        {/* Modal de Vídeo */}
        {selectedTestimonial && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTestimonial(null)}
          >
            <div className="w-full max-w-2xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                width="100%"
                height="100%"
                src={`${filteredTestimonials.find((t) => t.id === selectedTestimonial)?.videoUrl}?autoplay=1`}
                title="Testimonial Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
