
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, ExternalLink, Music } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Agenda() {
  const [filter, setFilter] = useState("upcoming");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", filter],
    queryFn: () => base44.entities.Event.filter({ status: filter }, filter === "upcoming" ? "date" : "-date"),
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Agenda de Shows
          </h1>
          <p className="text-[#D4C5B9] text-lg">
            Acompanhe onde estaremos e garanta seu ingresso
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs value={filter} onValueChange={setFilter} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2 bg-[#1A1A1A] border border-[#8B6F47]/30">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-[#F4231E] data-[state=active]:text-white"
              >
                Próximos Shows
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-[#8B6F47] data-[state=active]:text-white"
              >
                Shows Realizados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-12">
            <Music className="w-12 h-12 animate-pulse mx-auto mb-4" />
            Carregando agenda...
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Calendar className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
            <p className="text-[#D4C5B9] text-lg">
              {filter === "upcoming" ? "Em breve novos shows!" : "Nenhum show realizado ainda"}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="bg-[#1A1A1A] border-[#8B6F47]/30 hover:border-[#F4231E] transition-all overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Date Box */}
                  <div className="bg-gradient-to-br from-[#8B6F47] to-[#F4231E] p-8 md:w-40 flex flex-col items-center justify-center text-center">
                    <div className="text-5xl font-bold text-white">
                      {format(new Date(event.date), "dd")}
                    </div>
                    <div className="text-xl font-semibold text-white/90 uppercase">
                      {format(new Date(event.date), "MMM", { locale: ptBR })}
                    </div>
                    <div className="text-sm text-white/80">
                      {format(new Date(event.date), "yyyy")}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-white">
                          {event.venue}
                        </h3>
                        <div className="flex items-center gap-2 text-[#D4C5B9]">
                          <MapPin className="w-5 h-5 text-[#F4231E]" />
                          <span>{event.city}, {event.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#D4C5B9]">
                          <Calendar className="w-5 h-5 text-[#F4231E]" />
                          <span>
                            {format(new Date(event.date), "EEEE, HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>

                      {event.ticket_link && filter === "upcoming" && (
                        <div className="flex items-center">
                          <Button
                            className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
                            onClick={() => window.open(event.ticket_link, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ingressos
                          </Button>
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
    </div>
  );
}
