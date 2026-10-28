import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin as MapPinIcon,
  Heart,
  Calendar,
  Building2,
  Sparkles,
  Quote,
  Music,
  Compass,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Coordenadas das capitais e principais cidades no mapa SVG do Brasil (viewBox 0 0 800 750)
const CITY_COORDINATES = {
  "são paulo": { x: 575, y: 585 },
  "sao paulo": { x: 575, y: 585 },
  "são saulo": { x: 575, y: 585 }, // Tolera o cadastro com typo
  "sertãozinho": { x: 555, y: 535 },
  "sertaozinho": { x: 555, y: 535 },
  "ribeirão preto": { x: 560, y: 535 },
  "ribeirao preto": { x: 560, y: 535 },
  "são simão": { x: 565, y: 540 },
  "sao simao": { x: 565, y: 540 },
  "campinas": { x: 565, y: 565 },
  "santos": { x: 585, y: 605 },
  "sorocaba": { x: 555, y: 585 },
  "são josé do rio preto": { x: 530, y: 520 },
  "rio de janeiro": { x: 670, y: 565 },
  "belo horizonte": { x: 630, y: 480 },
  "uberlândia": { x: 540, y: 460 },
  "curitiba": { x: 520, y: 640 },
  "londrina": { x: 490, y: 600 },
  "florianópolis": { x: 530, y: 700 },
  "porto alegre": { x: 485, y: 760 },
  "goiânia": { x: 505, y: 440 },
  "brasília": { x: 535, y: 420 },
  "campo grande": { x: 430, y: 520 },
  "cuiabá": { x: 385, y: 410 },
  "salvador": { x: 715, y: 350 },
  "recife": { x: 805, y: 260 },
  "fortaleza": { x: 735, y: 195 },
  "natal": { x: 810, y: 215 },
  "aracaju": { x: 785, y: 320 },
  "maceió": { x: 795, y: 295 },
  "joão pessoa": { x: 815, y: 240 },
  "teresina": { x: 655, y: 250 },
  "são luís": { x: 625, y: 190 },
  "belém": { x: 540, y: 180 },
  "manaus": { x: 280, y: 210 },
  "palmas": { x: 545, y: 320 },
  "vitória": { x: 710, y: 500 },
  "porto velho": { x: 260, y: 335 },
  "rio branco": { x: 130, y: 310 },
  "macapá": { x: 495, y: 105 },
  "boa vista": { x: 300, y: 80 }
};

const STATE_COORDINATES = {
  SP: { x: 575, y: 585 },
  RJ: { x: 670, y: 565 },
  MG: { x: 630, y: 480 },
  ES: { x: 710, y: 500 },
  PR: { x: 520, y: 640 },
  SC: { x: 530, y: 700 },
  RS: { x: 485, y: 760 },
  MS: { x: 430, y: 520 },
  MT: { x: 385, y: 410 },
  GO: { x: 505, y: 440 },
  DF: { x: 535, y: 420 },
  BA: { x: 715, y: 350 },
  SE: { x: 785, y: 320 },
  AL: { x: 795, y: 295 },
  PE: { x: 805, y: 260 },
  PB: { x: 815, y: 240 },
  RN: { x: 810, y: 215 },
  CE: { x: 735, y: 195 },
  PI: { x: 655, y: 250 },
  MA: { x: 625, y: 190 },
  TO: { x: 545, y: 320 },
  PA: { x: 460, y: 220 },
  AP: { x: 495, y: 105 },
  RR: { x: 300, y: 80 },
  AM: { x: 250, y: 210 },
  AC: { x: 130, y: 310 },
  RO: { x: 260, y: 335 }
};

function getPinCoordinates(pin) {
  const cityName = (pin.city || "").toLowerCase().trim();
  if (CITY_COORDINATES[cityName]) {
    return CITY_COORDINATES[cityName];
  }
  const stateUf = (pin.state || "SP").toUpperCase().trim();
  if (STATE_COORDINATES[stateUf]) {
    // Adiciona uma leve variação determinística baseada no nome da cidade
    const hash = cityName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetX = ((hash % 15) - 7);
    const offsetY = (((hash >> 2) % 15) - 7);
    return {
      x: STATE_COORDINATES[stateUf].x + offsetX,
      y: STATE_COORDINATES[stateUf].y + offsetY
    };
  }
  return { x: 575, y: 585 }; // Default SP
}

export default function Mapa() {
  const [selectedPin, setSelectedPin] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: pins = [], isLoading } = useQuery({
    queryKey: ["mapPins"],
    queryFn: () => base44.entities.MapPin.list("-created_date"),
  });

  // Pin ativo no mapa: ou o selecionado, ou o primeiro da lista
  const activePin = selectedPin || (pins.length > 0 ? pins[0] : null);

  const uniqueStates = new Set(pins.map(p => (p.state || "").toUpperCase())).size;

  const handleCardClick = (pin) => {
    setSelectedPin(pin);
    setDialogOpen(true);
  };

  const scrollToMap = (pin) => {
    setSelectedPin(pin);
    const el = document.getElementById("interactive-map-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#8B6F47]/20 border border-[#8B6F47]/40 px-3 py-1 rounded-full text-xs font-semibold text-[#E9A55C] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Turnê Diferentaço
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Por Onde Passamos
          </h1>
          <p className="text-[#D4C5B9] text-lg max-w-2xl mx-auto">
            Uma homenagem a cada cidade, palco e fã que compartilhou momentos inesquecíveis com Victor & Franco
          </p>
        </div>

        {/* Interactive Map Showcase */}
        <div id="interactive-map-section" className="mb-14">
          <Card className="bg-[#141414] border-[#8B6F47]/40 overflow-hidden shadow-2xl relative">
            {/* Top Bar with Singers Info & Stats */}
            <div className="bg-gradient-to-r from-black/90 via-[#1A1A1A]/95 to-black/90 p-4 md:p-6 border-b border-[#8B6F47]/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#E9A55C] shadow-lg flex-shrink-0">
                    <img
                      src="/assets/media/096929cfe_FOTOSPROMOCIONAISVeF-5.jpg"
                      alt="Victor & Franco"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full" title="Na Estrada"></span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    Victor & Franco na Estrada
                  </h3>
                  <p className="text-xs md:text-sm text-[#D4C5B9]">
                    Show Diferentaço levando a energia sertaneja por todo o Brasil
                  </p>
                </div>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-4 sm:gap-6 text-center">
                <div className="bg-black/50 border border-[#8B6F47]/30 px-3.5 py-1.5 rounded-xl">
                  <span className="text-2xl font-black text-[#E9A55C] block">
                    {pins.length}
                  </span>
                  <span className="text-[11px] text-[#D4C5B9] uppercase font-semibold">
                    Cidades
                  </span>
                </div>
                <div className="bg-black/50 border border-[#8B6F47]/30 px-3.5 py-1.5 rounded-xl">
                  <span className="text-2xl font-black text-[#F4231E] block">
                    {uniqueStates}
                  </span>
                  <span className="text-[11px] text-[#D4C5B9] uppercase font-semibold">
                    Estados
                  </span>
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="relative min-h-[480px] md:min-h-[620px] bg-[#0D0D0D] flex flex-col lg:flex-row items-center justify-between p-4 md:p-8 overflow-hidden">
              {/* Background ambient lighting */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8B6F47]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F4231E]/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* SVG Brazil Map */}
              <div className="w-full lg:w-3/5 h-[380px] md:h-[520px] flex items-center justify-center relative">
                <svg
                  viewBox="0 0 850 800"
                  className="w-full h-full max-h-[520px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                >
                  <defs>
                    <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E1E1E" />
                      <stop offset="50%" stopColor="#181818" />
                      <stop offset="100%" stopColor="#121212" />
                    </linearGradient>
                    <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F4231E" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#F4231E" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Silhueta Estilizada do Brasil */}
                  <g id="brazil-outline" stroke="#8B6F47" strokeWidth="1.5" strokeOpacity="0.5">
                    {/* Região Norte */}
                    <path
                      d="M 100 280 C 130 180 200 120 300 80 C 370 60 480 70 510 110 C 530 140 560 170 520 220 C 470 250 430 260 380 280 C 320 290 220 310 150 330 Z"
                      fill="url(#mapGradient)"
                      className="transition-colors hover:fill-[#8B6F47]/15"
                    />
                    {/* Região Nordeste */}
                    <path
                      d="M 520 220 C 580 180 650 170 720 180 C 780 190 840 230 830 270 C 810 320 760 380 710 400 C 650 390 600 350 560 310 Z"
                      fill="url(#mapGradient)"
                      className="transition-colors hover:fill-[#8B6F47]/15"
                    />
                    {/* Região Centro-Oeste */}
                    <path
                      d="M 380 280 C 430 260 480 300 550 320 C 560 380 540 450 510 490 C 450 520 390 490 370 430 C 350 370 340 320 380 280 Z"
                      fill="url(#mapGradient)"
                      className="transition-colors hover:fill-[#8B6F47]/15"
                    />
                    {/* Região Sudeste (SP, RJ, MG, ES) */}
                    <path
                      d="M 550 450 C 620 440 680 470 730 490 C 720 540 680 580 640 590 C 590 610 550 590 530 550 C 520 500 530 470 550 450 Z"
                      fill="#221C16"
                      stroke="#E9A55C"
                      strokeWidth="2"
                      className="transition-colors hover:fill-[#E9A55C]/20 cursor-pointer"
                    />
                    {/* Região Sul */}
                    <path
                      d="M 530 590 C 580 600 570 650 550 710 C 520 770 460 780 450 730 C 460 670 490 620 530 590 Z"
                      fill="url(#mapGradient)"
                      className="transition-colors hover:fill-[#8B6F47]/15"
                    />
                  </g>

                  {/* Legenda de Região */}
                  <text x="590" y="540" fill="#E9A55C" fontSize="12" fontWeight="bold" opacity="0.7" letterSpacing="2">
                    SUDESTE
                  </text>
                  <text x="410" y="400" fill="#D4C5B9" fontSize="10" opacity="0.4" letterSpacing="2">
                    CENTRO-OESTE
                  </text>
                  <text x="660" y="270" fill="#D4C5B9" fontSize="10" opacity="0.4" letterSpacing="2">
                    NORDESTE
                  </text>
                  <text x="270" y="200" fill="#D4C5B9" fontSize="10" opacity="0.4" letterSpacing="2">
                    NORTE
                  </text>
                  <text x="480" y="690" fill="#D4C5B9" fontSize="10" opacity="0.4" letterSpacing="2">
                    SUL
                  </text>

                  {/* Pins Interativos de Cidades */}
                  {pins.map((pin) => {
                    const coords = getPinCoordinates(pin);
                    const isSelected = activePin?.id === pin.id;

                    return (
                      <g
                        key={pin.id}
                        transform={`translate(${coords.x}, ${coords.y})`}
                        className="cursor-pointer transition-transform duration-300"
                        onClick={() => setSelectedPin(pin)}
                      >
                        {/* Efeito Radar / Pulso */}
                        <circle
                          r={isSelected ? "22" : "14"}
                          fill="url(#pulseGlow)"
                          className={isSelected ? "animate-ping opacity-75" : "opacity-40"}
                        />

                        {/* Anel Externo Dourado */}
                        <circle
                          r={isSelected ? "11" : "8"}
                          fill="#F4231E"
                          stroke="#E9A55C"
                          strokeWidth={isSelected ? "3" : "2"}
                          className="drop-shadow-lg"
                        />

                        {/* Ponto Central Branco */}
                        <circle
                          r={isSelected ? "4" : "3"}
                          fill="#FFFFFF"
                        />

                        {/* Rótulo da Cidade */}
                        <text
                          y={isSelected ? "-18" : "-13"}
                          textAnchor="middle"
                          fill={isSelected ? "#FFFFFF" : "#E9A55C"}
                          fontSize={isSelected ? "13" : "11"}
                          fontWeight="bold"
                          className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                        >
                          {pin.city}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Dica no canto do mapa */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-[#D4C5B9] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#E9A55C]" />
                  Clique nos pontos do mapa para ver o recado dos cantores
                </div>
              </div>

              {/* Spotlight Card: Detalhe dos Cantores na Cidade Selecionada */}
              <div className="w-full lg:w-2/5 mt-6 lg:mt-0">
                {activePin ? (
                  <div className="bg-gradient-to-b from-[#1C1C1C] to-[#121212] border-2 border-[#8B6F47]/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    {/* Faixa decorativa dourada */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B6F47] via-[#E9A55C] to-[#F4231E]"></div>

                    {/* Foto da Dupla e Cidade */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#E9A55C] flex-shrink-0 shadow-lg">
                        <img
                          src="/assets/media/246e34ef6_Gemini_Generated_Image_3kpjwe3kpjwe3kpj-removebg-preview.png"
                          alt="Victor & Franco"
                          className="w-full h-full object-contain bg-black/50 p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-[#E9A55C] uppercase tracking-wider font-bold block mb-0.5">
                          Cidade no Mapa
                        </span>
                        <h4 className="text-2xl font-black text-white truncate">
                          {activePin.city}
                        </h4>
                        <span className="text-sm font-semibold text-[#D4C5B9]">
                          Estado: <strong className="text-white">{activePin.state}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Info do Show */}
                    <div className="space-y-2.5 text-sm text-[#D4C5B9] mb-5 bg-black/40 p-3.5 rounded-xl border border-white/5">
                      {activePin.venue && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#E9A55C] flex-shrink-0" />
                          <span className="text-white font-medium">{activePin.venue}</span>
                        </div>
                      )}

                      {activePin.show_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#F4231E] flex-shrink-0" />
                          <span>
                            {format(new Date(activePin.show_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* O Comentário / Recado dos Cantores (DESTAQUE MÁXIMO) */}
                    {(activePin.notes || activePin.message) ? (
                      <div className="p-4 bg-gradient-to-br from-[#8B6F47]/20 via-[#F4231E]/15 to-transparent rounded-xl border border-[#8B6F47]/40 relative">
                        <div className="flex items-center gap-1.5 text-xs text-[#E9A55C] font-bold mb-1.5 uppercase tracking-wide">
                          <Quote className="w-4 h-4 text-[#E9A55C]" />
                          Recado de Victor & Franco:
                        </div>
                        <p className="text-white text-base md:text-lg italic font-semibold leading-relaxed">
                          "{activePin.notes || activePin.message}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-xs text-[#D4C5B9] italic">
                        Show realizado com sucesso nesta cidade.
                      </div>
                    )}

                    {/* Botão Ver Galeria / Detalhes */}
                    <Button
                      onClick={() => setDialogOpen(true)}
                      className="w-full mt-5 bg-[#E9A55C] hover:bg-[#d9954c] text-black font-bold text-sm shadow-md"
                    >
                      <Heart className="w-4 h-4 mr-2 text-[#F4231E] fill-[#F4231E]" />
                      Ver Detalhes do Show
                    </Button>
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] border border-[#8B6F47]/30 rounded-2xl p-8 text-center text-[#D4C5B9]">
                    <MapPinIcon className="w-12 h-12 text-[#8B6F47] mx-auto mb-3 opacity-60" />
                    <p className="font-semibold text-white">Nenhuma cidade selecionada</p>
                    <p className="text-xs mt-1">Clique em uma cidade no mapa ou na lista abaixo.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Cities List (Cidades Visitadas) */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                Cidades Visitadas
              </h2>
              <p className="text-[#D4C5B9] text-sm">
                Lista de todos os palcos por onde a dupla já passou
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center text-[#D4C5B9] py-16">
              <MapPinIcon className="w-12 h-12 animate-pulse mx-auto mb-4 text-[#E9A55C]" />
              Carregando cidades...
            </div>
          ) : pins.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
              <Heart className="w-16 h-16 text-[#8B6F47] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma cidade cadastrada ainda</h3>
              <p className="text-[#D4C5B9]">
                Novas cidades da turnê serão adicionadas em breve.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pins.map((pin) => {
                const isSelected = activePin?.id === pin.id;
                const comment = pin.notes || pin.message;

                return (
                  <Card
                    key={pin.id}
                    className={`bg-[#1A1A1A] border transition-all cursor-pointer overflow-hidden p-6 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#E9A55C] ring-1 ring-[#E9A55C]/40 shadow-xl"
                        : "border-[#8B6F47]/30 hover:border-[#8B6F47]"
                    }`}
                    onClick={() => handleCardClick(pin)}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="text-2xl font-bold text-white truncate">{pin.city}</h3>
                          <span className="text-sm font-semibold text-[#E9A55C]">{pin.state}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#8B6F47]/20 border border-[#8B6F47]/40 flex items-center justify-center flex-shrink-0">
                          <Heart className="w-5 h-5 text-[#F4231E]" />
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2 text-sm text-[#D4C5B9] mb-4">
                        {pin.venue && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#E9A55C] flex-shrink-0" />
                            <span className="truncate text-white/90 font-medium">{pin.venue}</span>
                          </div>
                        )}

                        {pin.show_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#F4231E] flex-shrink-0" />
                            <span>
                              {format(new Date(pin.show_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* O Comentário Feito (VISÍVEL NO CARD) */}
                      {comment && (
                        <div className="p-3.5 bg-black/50 rounded-xl border border-[#8B6F47]/30 relative mb-4">
                          <div className="flex items-center gap-1.5 text-xs text-[#E9A55C] font-semibold mb-1">
                            <Quote className="w-3.5 h-3.5" />
                            Recado de Victor & Franco:
                          </div>
                          <p className="text-white text-sm italic font-medium leading-relaxed">
                            "{comment}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#8B6F47]/20">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToMap(pin);
                        }}
                        className="flex-1 border-[#8B6F47]/50 text-[#E9A55C] hover:bg-[#8B6F47]/20 text-xs flex items-center justify-center gap-1.5"
                      >
                        <MapPinIcon className="w-3.5 h-3.5" />
                        Ver no Mapa
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCardClick(pin)}
                        className="bg-[#F4231E] hover:bg-[#e41914] text-white text-xs px-3"
                      >
                        Detalhes
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Pin Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl bg-[#1A1A1A] border-[#8B6F47]/30 text-white">
            {selectedPin && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E9A55C]">
                      <img
                        src="/assets/media/096929cfe_FOTOSPROMOCIONAISVeF-5.jpg"
                        alt="Victor & Franco"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-bold text-white">
                        Obrigado, {selectedPin.city}!
                      </DialogTitle>
                      <p className="text-sm font-semibold text-[#E9A55C]">{selectedPin.state}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#D4C5B9] bg-black/40 p-3.5 rounded-xl border border-white/5">
                    {selectedPin.venue && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#E9A55C]" />
                        <span className="text-white font-medium">{selectedPin.venue}</span>
                      </div>
                    )}
                    {selectedPin.show_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#F4231E]" />
                        <span>
                          {format(new Date(selectedPin.show_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Recado em Destaque */}
                  {(selectedPin.notes || selectedPin.message) && (
                    <div className="bg-gradient-to-br from-[#8B6F47]/20 to-[#F4231E]/20 p-5 rounded-xl border border-[#8B6F47]/40 relative">
                      <div className="flex items-center gap-1.5 text-xs text-[#E9A55C] font-bold uppercase mb-2">
                        <Quote className="w-4 h-4" />
                        Mensagem dos Artistas:
                      </div>
                      <p className="text-white text-lg italic font-semibold leading-relaxed">
                        "{selectedPin.notes || selectedPin.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => setDialogOpen(false)}
                      className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
