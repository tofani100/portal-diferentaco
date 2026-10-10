import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B6F47] via-[#F4231E] to-[#8B6F47] p-1">
          <div className="bg-[#0A0A0A] rounded-3xl p-12 md:p-16 text-center">
            <Sparkles className="w-16 h-16 text-[#F4231E] mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Leve o Show "Diferentaço" <br />para sua Cidade
            </h2>
            <p className="text-[#D4C5B9] text-lg mb-8 max-w-2xl mx-auto">
              Entre em contato e faça parte da nossa história. 
              Vamos juntos levar a melhor música sertaneja para seu evento!
            </p>
            <Link to={createPageUrl("Contato")}>
              <Button
                size="lg"
                className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold text-lg px-10 py-6 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Contratar Agora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}