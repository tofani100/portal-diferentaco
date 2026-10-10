import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TestimonialSection() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["featuredTestimonials"],
    queryFn: () => base44.entities.Testimonial.filter({ approved: true, featured: true }, "-created_date"),
  });

  if (testimonials.length === 0) return null;

  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <section className="py-16 px-4 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            O Que Falam Sobre Nós
          </h2>
          <p className="text-[#D4C5B9] text-lg">
            Depoimentos de fãs e contratantes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {displayTestimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border-[#8B6F47]/30 p-6 hover:border-[#F4231E] transition-all"
            >
              <Quote className="w-8 h-8 text-[#8B6F47] mb-4 opacity-50" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? "fill-[#F4231E] text-[#F4231E]"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>

              <p className="text-[#D4C5B9] mb-6 leading-relaxed line-clamp-4">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[#8B6F47]/20">
                {testimonial.author_photo ? (
                  <img
                    src={testimonial.author_photo}
                    alt={testimonial.author_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#8B6F47]/30 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {testimonial.author_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold">
                    {testimonial.author_name}
                  </p>
                  <p className="text-[#D4C5B9] text-sm">
                    {testimonial.author_city || "Fã"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("Depoimentos")}>
            <Button className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold">
              Ver Todos os Depoimentos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}