import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin as MapPinIcon, Plus, Pencil, Trash2, Calendar, Building2, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function AdminMapa() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    city: "",
    state: "SP",
    venue: "",
    show_date: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: pins = [], isLoading } = useQuery({
    queryKey: ["mapPins"],
    queryFn: () => base44.entities.MapPin.list("-created_date"),
  });

  const createPin = useMutation({
    mutationFn: (data) => base44.entities.MapPin.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mapPins"] });
      closeDialog();
    },
  });

  const updatePin = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MapPin.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mapPins"] });
      closeDialog();
    },
  });

  const deletePin = useMutation({
    mutationFn: (id) => base44.entities.MapPin.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mapPins"] });
    },
  });

  const openDialog = (pin = null) => {
    if (pin) {
      setEditingPin(pin);
      setFormData({
        city: pin.city || "",
        state: pin.state || "SP",
        venue: pin.venue || "",
        show_date: pin.show_date ? pin.show_date.slice(0, 10) : "",
        notes: pin.notes || ""
      });
    } else {
      setEditingPin(null);
      setFormData({
        city: "",
        state: "SP",
        venue: "",
        show_date: new Date().toISOString().slice(0, 10),
        notes: ""
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPin(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPin) {
      updatePin.mutate({ id: editingPin.id, data: formData });
    } else {
      createPin.mutate(formData);
    }
  };

  const handleDelete = (id, city, state) => {
    if (confirm(`Tem certeza que deseja excluir "${city} - ${state}" de Por Onde Passamos?`)) {
      deletePin.mutate(id);
    }
  };

  const filteredPins = pins.filter(pin => {
    const term = searchTerm.toLowerCase();
    return (
      (pin.city || "").toLowerCase().includes(term) ||
      (pin.state || "").toLowerCase().includes(term) ||
      (pin.venue || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <MapPinIcon className="w-10 h-10 text-[#F4231E]" />
              Gerenciar Por Onde Passamos
            </h1>
            <p className="text-[#D4C5B9]">
              Cadastre as cidades e palcos onde Victor & Franco já levaram o show "Diferentaço"
            </p>
          </div>

          <Button
            onClick={() => openDialog()}
            className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold flex items-center gap-2 self-start md:self-auto shadow-lg"
          >
            <Plus className="w-5 h-5" />
            + Nova Cidade / Show
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Buscar por cidade, estado ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1A1A1A] border-[#8B6F47]/30 text-white max-w-md"
          />
        </div>

        {/* List of Pins */}
        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-16">
            <MapPinIcon className="w-12 h-12 animate-pulse mx-auto mb-4 text-[#E9A55C]" />
            Carregando cidades...
          </div>
        ) : filteredPins.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Heart className="w-16 h-16 text-[#8B6F47] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">
              {pins.length === 0 ? "Nenhuma cidade cadastrada ainda" : "Nenhum resultado para a busca"}
            </h3>
            <p className="text-[#D4C5B9] mb-6">Cadastre as cidades visitadas para marcar a trajetória da dupla.</p>
            <Button
              onClick={() => openDialog()}
              className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Cidade
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPins.map((pin) => (
              <Card
                key={pin.id}
                className="bg-[#1A1A1A] border-[#8B6F47]/30 hover:border-[#8B6F47] transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{pin.city}</h3>
                      <span className="text-sm font-semibold text-[#E9A55C]">{pin.state}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#8B6F47]/20 border border-[#8B6F47]/40 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[#F4231E]" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#D4C5B9] mb-4">
                    {pin.venue && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#E9A55C] flex-shrink-0" />
                        <span className="truncate">{pin.venue}</span>
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

                    {pin.notes && (
                      <p className="text-xs text-[#D4C5B9]/80 italic line-clamp-3 mt-2 bg-black/30 p-2.5 rounded border border-white/5">
                        "{pin.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-[#8B6F47]/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog(pin)}
                    className="flex-1 border-[#8B6F47]/50 text-[#E9A55C] hover:bg-[#8B6F47]/20 flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(pin.id, pin.city, pin.state)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog Form */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingPin ? "Editar Cidade / Show" : "Cadastrar Cidade Visitada"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="city" className="text-white">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ex: Sertãozinho"
                    required
                    className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-white">Estado (UF) *</Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1 w-full h-10 px-3 rounded-md bg-[#0A0A0A] border border-[#8B6F47]/30 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#E9A55C]"
                  >
                    {BRAZILIAN_STATES.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="venue" className="text-white">Local / Evento</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Ex: Villa's Espaço de Eventos / Feicap"
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="show_date" className="text-white">Data do Show</Label>
                <Input
                  id="show_date"
                  type="date"
                  value={formData.show_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_date: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-white">Mensagem / Recado sobre a Cidade</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Show inesquecível com ingressos esgotados! Obrigado pelo carinho de todos!"
                  rows={3}
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
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
                  disabled={createPin.isPending || updatePin.isPending}
                  className="flex-1 bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
                >
                  {createPin.isPending || updatePin.isPending ? "Salvando..." : "Salvar Cidade"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
