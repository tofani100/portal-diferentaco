import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageCircle, MapPin, Download, Search } from "lucide-react";

export default function AdminNewsletter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");

  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers"],
    queryFn: () => base44.entities.NewsletterSubscriber.filter({ active: true }, "-created_date"),
  });

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = searchTerm === "" || 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.email && sub.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesState = filterState === "" || sub.state === filterState;
    
    return matchesSearch && matchesState;
  });

  const states = [...new Set(subscribers.map(s => s.state))].sort();

  const exportToCSV = () => {
    const headers = ["Nome", "Email", "WhatsApp", "Cidade", "Estado", "Avisos de Shows", "Novidades"];
    const rows = filteredSubscribers.map(sub => [
      sub.name,
      sub.email || "",
      sub.whatsapp || "",
      sub.city,
      sub.state,
      sub.notify_shows ? "Sim" : "Não",
      sub.notify_news ? "Sim" : "Não"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_inscritos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const subscribersByState = states.map(state => ({
    state,
    count: subscribers.filter(s => s.state === state).length
  }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Inscritos Newsletter
            </h1>
            <p className="text-[#D4C5B9] text-lg">
              Total de {subscribers.length} inscritos
            </p>
          </div>
          <Button
            onClick={exportToCSV}
            className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
            <Mail className="w-8 h-8 text-[#F4231E] mb-2" />
            <p className="text-3xl font-bold text-white">
              {subscribers.filter(s => s.email).length}
            </p>
            <p className="text-[#D4C5B9] text-sm">Com E-mail</p>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
            <MessageCircle className="w-8 h-8 text-[#F4231E] mb-2" />
            <p className="text-3xl font-bold text-white">
              {subscribers.filter(s => s.whatsapp).length}
            </p>
            <p className="text-[#D4C5B9] text-sm">Com WhatsApp</p>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
            <MapPin className="w-8 h-8 text-[#F4231E] mb-2" />
            <p className="text-3xl font-bold text-white">{states.length}</p>
            <p className="text-[#D4C5B9] text-sm">Estados</p>
          </Card>
        </div>

        {/* Subscribers by State */}
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Inscritos por Estado</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subscribersByState.map(({ state, count }) => (
              <div
                key={state}
                className="bg-[#0A0A0A] rounded-lg p-4 text-center cursor-pointer hover:bg-[#8B6F47]/20 transition-colors"
                onClick={() => setFilterState(state === filterState ? "" : state)}
              >
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-[#D4C5B9] text-sm">{state}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Filters */}
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4C5B9]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, cidade ou email..."
                className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white pl-10"
              />
            </div>
            {filterState && (
              <Button
                variant="outline"
                onClick={() => setFilterState("")}
              >
                Limpar Filtro: {filterState}
              </Button>
            )}
          </div>
        </Card>

        {/* Subscribers List */}
        {filteredSubscribers.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <p className="text-[#D4C5B9] text-lg">
              Nenhum inscrito encontrado
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscribers.map((subscriber) => (
              <Card
                key={subscriber.id}
                className="bg-[#1A1A1A] border-[#8B6F47]/30 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{subscriber.name}</h4>
                    <p className="text-[#D4C5B9] text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {subscriber.city}, {subscriber.state}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  {subscriber.email && (
                    <p className="text-[#D4C5B9] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#F4231E]" />
                      {subscriber.email}
                    </p>
                  )}
                  {subscriber.whatsapp && (
                    <p className="text-[#D4C5B9] flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#F4231E]" />
                      {subscriber.whatsapp}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-[#8B6F47]/20">
                  {subscriber.notify_shows && (
                    <span className="text-xs bg-[#F4231E]/20 text-[#F4231E] px-2 py-1 rounded">
                      Shows
                    </span>
                  )}
                  {subscriber.notify_news && (
                    <span className="text-xs bg-[#8B6F47]/20 text-[#8B6F47] px-2 py-1 rounded">
                      Novidades
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}