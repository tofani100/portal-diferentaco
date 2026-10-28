import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PhoneCall,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminContatos() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: contactRequests = [], isLoading } = useQuery({
    queryKey: ["contactRequests"],
    queryFn: () => base44.entities.ContactRequest.list("-created_date"),
  });

  const updateContact = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContactRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactRequests"] });
    },
  });

  const deleteContact = useMutation({
    mutationFn: (id) => base44.entities.ContactRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactRequests"] });
    },
  });

  const handleStatusChange = (id, newStatus) => {
    updateContact.mutate({ id, data: { status: newStatus } });
  };

  const handleDelete = (id, name) => {
    if (confirm(`Tem certeza que deseja excluir a solicitação de contato de "${name}"?`)) {
      deleteContact.mutate(id);
    }
  };

  const cleanPhoneForWhatsApp = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = "55" + cleaned;
    }
    return cleaned;
  };

  const filteredRequests = contactRequests.filter((req) => {
    if (filter === "all") return true;
    if (filter === "pending") return !req.status || req.status === "pending";
    if (filter === "in_progress") return req.status === "in_progress";
    if (filter === "completed") return req.status === "completed";
    return true;
  });

  const pendingCount = contactRequests.filter(r => !r.status || r.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <PhoneCall className="w-10 h-10 text-[#F4231E]" />
              Gerenciar Contatos
            </h1>
            <p className="text-[#D4C5B9]">
              Solicitações de shows, contratações e mensagens enviadas pelo formulário do site
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#8B6F47]/30 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <span className="text-xs text-[#D4C5B9] font-medium uppercase tracking-wider">Pendentes:</span>
            <span className={`text-lg font-bold px-2.5 py-0.5 rounded-full ${
              pendingCount > 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-green-500/20 text-green-400"
            }`}>
              {pendingCount}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="bg-[#1A1A1A] border border-[#8B6F47]/30 p-1 flex flex-wrap max-w-xl">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#E9A55C] data-[state=active]:text-black text-xs font-semibold">
                Todos ({contactRequests.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-xs font-semibold">
                Novos / Pendentes ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-semibold">
                Em Atendimento
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs font-semibold">
                Concluídos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-16">
            <Clock className="w-12 h-12 animate-pulse mx-auto mb-4 text-[#E9A55C]" />
            Carregando solicitações...
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <PhoneCall className="w-16 h-16 text-[#8B6F47] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-[#D4C5B9]">
              {filter === "all" 
                ? "Nenhum contratante preencheu o formulário de contato ainda." 
                : "Não há contatos neste status no momento."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const status = req.status || "pending";
              const formattedDate = req.created_date
                ? format(new Date(req.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                : "Recente";
              const waNumber = cleanPhoneForWhatsApp(req.phone);

              return (
                <Card
                  key={req.id}
                  className="bg-[#1A1A1A] border-[#8B6F47]/30 hover:border-[#8B6F47] transition-all p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Contractor & Event Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-white">
                          {req.contractor_name || "Contratante sem nome"}
                        </h3>

                        {status === "pending" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Novo
                          </span>
                        )}
                        {status === "in_progress" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Em Atendimento
                          </span>
                        )}
                        {status === "completed" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Concluído
                          </span>
                        )}

                        <span className="text-xs text-[#D4C5B9]/60 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formattedDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-[#D4C5B9]">
                        {req.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-[#F4231E] flex-shrink-0" />
                            <a href={`tel:${req.phone}`} className="hover:text-white font-medium">
                              {req.phone}
                            </a>
                          </div>
                        )}

                        {req.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-4 h-4 text-[#E9A55C] flex-shrink-0" />
                            <a href={`mailto:${req.email}`} className="hover:text-white truncate">
                              {req.email}
                            </a>
                          </div>
                        )}

                        {(req.event_city || req.event_state) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#F4231E] flex-shrink-0" />
                            <span>{req.event_city || ""}{req.event_city && req.event_state ? " - " : ""}{req.event_state || ""}</span>
                          </div>
                        )}

                        {req.event_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#E9A55C] flex-shrink-0" />
                            <span>Data prevista: {req.event_date}</span>
                          </div>
                        )}
                      </div>

                      {req.message && (
                        <div className="mt-3 p-3.5 bg-black/40 rounded-lg border border-white/5 text-sm text-[#D4C5B9] leading-relaxed">
                          <div className="flex items-center gap-1.5 text-xs text-[#E9A55C] font-semibold mb-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Mensagem do Contratante:
                          </div>
                          "{req.message}"
                        </div>
                      )}
                    </div>

                    {/* Actions & Status Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[200px] border-t lg:border-t-0 lg:border-l border-[#8B6F47]/20 pt-4 lg:pt-0 lg:pl-6 justify-between">
                      <div className="space-y-2">
                        {waNumber && (
                          <Button
                            asChild
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
                          >
                            <a
                              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá ${req.contractor_name || ""}, somos da equipe Victor & Franco! Recebemos sua mensagem de contato.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Chamar no WhatsApp
                            </a>
                          </Button>
                        )}

                        {req.phone && (
                          <Button
                            asChild
                            variant="outline"
                            className="w-full border-[#8B6F47]/50 text-[#E9A55C] hover:bg-[#8B6F47]/20 text-xs flex items-center justify-center gap-1.5"
                          >
                            <a href={`tel:${req.phone}`}>
                              <PhoneCall className="w-3.5 h-3.5" />
                              Ligar para Contratante
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Status selectors */}
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <span className="text-[11px] text-[#D4C5B9] font-medium block">Alterar Status:</span>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(req.id, "pending")}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                              status === "pending"
                                ? "bg-amber-500 text-black font-bold"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            Novo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(req.id, "in_progress")}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                              status === "in_progress"
                                ? "bg-blue-600 text-white font-bold"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            Em Atend.
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(req.id, "completed")}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                              status === "completed"
                                ? "bg-green-600 text-white font-bold"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            Concluído
                          </button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(req.id, req.contractor_name)}
                          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs flex items-center justify-center gap-1 mt-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Excluir Registro
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
