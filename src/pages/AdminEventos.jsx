import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MediaSpecsBanner from "@/components/admin/MediaSpecsBanner";

export default function AdminEventos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    city: "",
    state: "",
    venue: "",
    ticket_link: "",
    status: "upcoming"
  });

  const queryClient = useQueryClient();

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => base44.entities.Event.list(),
  });

  const events = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];

    rawEvents.forEach((ev) => {
      const evDate = new Date(ev.date);
      if (evDate >= now && ev.status !== "past") {
        upcoming.push(ev);
      } else {
        past.push(ev);
      }
    });

    // Próximos shows: data mais próxima no topo
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Shows já realizados: show mais recente no topo
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return [...upcoming, ...past];
  }, [rawEvents]);

  const createEvent = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      closeDialog();
    },
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      closeDialog();
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const openDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        date: event.date,
        city: event.city,
        state: event.state,
        venue: event.venue,
        ticket_link: event.ticket_link || "",
        status: event.status
      });
    } else {
      setEditingEvent(null);
      setFormData({
        date: "",
        city: "",
        state: "",
        venue: "",
        ticket_link: "",
        status: "upcoming"
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, data: formData });
    } else {
      createEvent.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      deleteEvent.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Gerenciar Eventos
            </h1>
            <p className="text-[#D4C5B9]">Adicione e gerencie a agenda de shows</p>
          </div>
          <Button
            onClick={() => openDialog()}
            className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        <MediaSpecsBanner type="event" />

        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-12">
            <Calendar className="w-12 h-12 animate-pulse mx-auto mb-4" />
            Carregando eventos...
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Calendar className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
            <p className="text-[#D4C5B9] text-lg">Nenhum evento cadastrado</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id} className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {(() => {
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        const isUpcoming = new Date(event.date) >= now && event.status !== 'past';
                        return (
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isUpcoming 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {isUpcoming ? 'Próximo Show' : 'Show Realizado'}
                          </div>
                        );
                      })()}
                      <span className="text-[#E9A55C] font-semibold">
                        {format(new Date(event.date), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.venue}</h3>
                    <p className="text-[#D4C5B9]">{event.city}, {event.state}</p>
                    {event.ticket_link && (
                      <a 
                        href={event.ticket_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#E9A55C] text-sm hover:underline mt-2 inline-block"
                      >
                        Link de ingressos →
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(event)}
                      className="text-[#D4C5B9] hover:text-[#E9A55C]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
                      className="text-[#D4C5B9] hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Event Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingEvent ? "Editar Evento" : "Novo Evento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-white">Data e Hora *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-white">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-white">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    required
                    placeholder="Ex: SP"
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue" className="text-white">Local *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
              </div>

              <div>
                <Label htmlFor="ticket_link" className="text-white">Link de Ingressos</Label>
                <Input
                  id="ticket_link"
                  type="url"
                  value={formData.ticket_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticket_link: e.target.value }))}
                  placeholder="https://..."
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-white">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Próximo</SelectItem>
                    <SelectItem value="past">Realizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
                  disabled={createEvent.isPending || updateEvent.isPending}
                >
                  {editingEvent ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}