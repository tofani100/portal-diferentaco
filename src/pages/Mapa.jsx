
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { MapPin as MapPinIcon, Heart, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Mapa() {
  const [selectedPin, setSelectedPin] = useState(null);

  const { data: pins = [], isLoading } = useQuery({
    queryKey: ["mapPins"],
    queryFn: () => base44.entities.MapPin.list("-created_date"),
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Por Onde Passamos
          </h1>
          <p className="text-[#D4C5B9] text-lg">
            Uma homenagem a cada cidade que nos recebeu
          </p>
        </div>

        {/* Map Placeholder */}
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 overflow-hidden mb-12">
          <div className="h-[600px] relative bg-gradient-to-br from-[#8B6F47]/20 to-[#F4231E]/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="w-16 h-16 text-[#F4231E] mx-auto mb-4" />
                <p className="text-[#D4C5B9] text-lg">
                  Mapa interativo em desenvolvimento
                </p>
                <p className="text-[#D4C5B9] text-sm mt-2">
                  Confira abaixo as cidades que visitamos
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Cities List */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Cidades Visitadas
          </h2>
          
          {isLoading ? (
            <div className="text-center text-[#D4C5B9] py-12">
              <MapPinIcon className="w-12 h-12 animate-pulse mx-auto mb-4" />
              Carregando cidades...
            </div>
          ) : pins.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
              <Heart className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
              <p className="text-[#D4C5B9] text-lg">
                Em breve novas cidades!
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pins.map((pin) => (
                <Card
                  key={pin.id}
                  className="bg-[#1A1A1A] border-[#8B6F47]/30 hover:border-[#F4231E] transition-all cursor-pointer overflow-hidden group"
                  onClick={() => setSelectedPin(pin)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#8B6F47]/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-[#F4231E]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {pin.city}
                        </h3>
                        <p className="text-[#D4C5B9] text-sm mb-2">{pin.state}</p>
                        {pin.show_date && (
                          <div className="flex items-center gap-2 text-[#D4C5B9] text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(pin.show_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pin Detail Dialog */}
        <Dialog open={!!selectedPin} onOpenChange={() => setSelectedPin(null)}>
          <DialogContent className="max-w-3xl bg-[#1A1A1A] border-[#8B6F47]/30">
            {selectedPin && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-white">
                    Obrigado, {selectedPin.city}!
                  </DialogTitle>
                  <p className="text-[#D4C5B9]">{selectedPin.state}</p>
                </DialogHeader>
                <div className="space-y-6">
                  {selectedPin.show_date && (
                    <div className="flex items-center gap-2 text-[#D4C5B9]">
                      <Calendar className="w-5 h-5 text-[#F4231E]" />
                      <span>
                        Show realizado em{" "}
                        {format(new Date(selectedPin.show_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}

                  {selectedPin.message && (
                    <div className="bg-[#0A0A0A] p-6 rounded-lg border border-[#8B6F47]/30">
                      <p className="text-white text-lg leading-relaxed">
                        {selectedPin.message}
                      </p>
                    </div>
                  )}

                  {selectedPin.photos && selectedPin.photos.length > 0 && (
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-4">
                        Momentos Especiais
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPin.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="aspect-video overflow-hidden rounded-lg"
                          >
                            <img
                              src={photo}
                              alt={`${selectedPin.city} - ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
