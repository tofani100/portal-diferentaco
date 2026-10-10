import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NextShowBox({ event }) {
  if (!event) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-black to-[#0A0A0A]">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-[#F4231E] to-[#8B6F47] border-none overflow-hidden">
          <div className="p-8 md:p-12 text-center text-white">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              PRÓXIMO SHOW
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {event.venue}
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                <span>{event.city}, {event.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                <span>
                  {format(new Date(event.date), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {event.ticket_link && (
                <Button
                  size="lg"
                  className="bg-white text-[#F4231E] hover:bg-white/90 font-semibold"
                  onClick={() => window.open(event.ticket_link, "_blank")}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Comprar Ingressos
                </Button>
              )}
              <Link to={createPageUrl("Agenda")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#F4231E] font-semibold"
                >
                  Ver Agenda Completa
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}