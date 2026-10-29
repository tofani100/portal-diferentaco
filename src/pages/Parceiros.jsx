
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Handshake, Plus, Pencil, Trash2, Upload, X, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Parceiros() {
  const [editMode, setEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    whatsapp: "",
    email: "",
    order: 0
  });

  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: () => base44.entities.Partner.list("order"),
  });

  const createPartner = useMutation({
    mutationFn: (data) => base44.entities.Partner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      closeDialog();
    },
  });

  const updatePartner = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Partner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      closeDialog();
    },
  });

  const deletePartner = useMutation({
    mutationFn: (id) => base44.entities.Partner.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });

  useEffect(() => {
    const handleEditModeChange = (e) => {
      setEditMode(e.detail.editMode);
    };
    window.addEventListener('editModeChanged', handleEditModeChange);
    return () => window.removeEventListener('editModeChanged', handleEditModeChange);
  }, []);

  const openDialog = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        logo_url: partner.logo_url,
        website_url: partner.website_url || "",
        whatsapp: partner.whatsapp || "",
        email: partner.email || "",
        order: partner.order || 0
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: "",
        logo_url: "",
        website_url: "",
        whatsapp: "",
        email: "",
        order: 0
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPartner(null);
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo_url: file_url }));
    } catch (error) {
      alert("Erro ao fazer upload do logo");
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.logo_url) {
      alert("Por favor, faça upload do logo");
      return;
    }
    if (editingPartner) {
      updatePartner.mutate({ id: editingPartner.id, data: formData });
    } else {
      createPartner.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este parceiro?")) {
      deletePartner.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <h1 className="text-5xl md:text-6xl font-bold text-white flex-1">
              Nossos Parceiros
            </h1>
            <div className="flex-1 flex justify-end">
              {editMode && (
                <Button
                  onClick={() => openDialog()}
                  className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Parceiro
                </Button>
              )}
            </div>
          </div>
          <p className="text-[#D4C5B9] text-lg">
            Agradecemos a todos que fazem parte dessa jornada
          </p>
        </div>

        {/* Partners Grid */}
        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-12">
            <Handshake className="w-12 h-12 animate-pulse mx-auto mb-4" />
            Carregando parceiros...
          </div>
        ) : partners.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Handshake className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
            <p className="text-[#D4C5B9] text-lg">
              {editMode ? "Clique em 'Adicionar Parceiro' para começar" : "Em breve novos parceiros!"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <Card
                key={partner.id}
                className="bg-[#1A1A1A] border-[#8B6F47]/30 hover:border-[#F4231E] transition-all overflow-hidden group relative"
              >
                {editMode && (
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70"
                      onClick={() => openDialog(partner)}
                    >
                      <Pencil className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70"
                      onClick={() => handleDelete(partner.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                )}
                
                <div className="aspect-square p-6 flex items-center justify-center relative">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  {partner.website_url && !editMode && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 w-8 h-8 bg-[#F4231E] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
                <div className="px-6 pb-6 text-center">
                  <p className="text-white font-semibold">{partner.name}</p>
                  {(partner.whatsapp || partner.email) && (
                    <div className="flex justify-center gap-2 mt-2">
                      {partner.whatsapp && (
                        <a
                          href={`https://wa.me/${partner.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D4C5B9] hover:text-[#F4231E] transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {partner.email && (
                        <a
                          href={`mailto:${partner.email}`}
                          className="text-[#D4C5B9] hover:text-[#F4231E] transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16">
          <Card className="bg-gradient-to-br from-[#8B6F47] to-[#F4231E] border-none p-8 md:p-12 text-center">
            <Handshake className="w-16 h-16 text-black/20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Seja Nosso Parceiro
            </h2>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Junte-se a nós e faça parte da história de Victor & Franco. 
              Entre em contato para conhecer as oportunidades de parceria.
            </p>
            <div className="mb-6">
              <p className="text-white/80 text-xs uppercase tracking-wider font-semibold mb-1">Contratações e Parcerias</p>
              <a
                href="https://wa.me/5516981294040?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20contrata%C3%A7%C3%A3o%20e%20parcerias%20com%20Victor%20%26%20Franco."
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl md:text-3xl font-extrabold text-white hover:underline hover:text-[#25D366] transition-colors block"
                title="Chamar no WhatsApp"
              >
                +55 16 98129-4040
              </a>
              <p className="text-white/80 text-xs mt-1">(falar com Luis Sicchieri)</p>
            </div>
            <a
              href="https://wa.me/5516981294040?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20contrata%C3%A7%C3%A3o%20e%20parcerias%20com%20Victor%20%26%20Franco."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold px-8 py-3 rounded-full transition-all shadow-lg"
            >
              Conversar no WhatsApp
            </a>
          </Card>
        </div>

        {/* Partner Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingPartner ? "Editar Parceiro" : "Adicionar Parceiro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Nome do Parceiro *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
              </div>

              <div>
                <Label htmlFor="logo" className="text-white">Logo *</Label>
                <div className="mt-2">
                  {formData.logo_url ? (
                    <div className="relative">
                      <img
                        src={formData.logo_url}
                        alt="Preview"
                        className="w-full h-48 object-contain bg-white/5 rounded-lg p-4"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50"
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: "" }))}
                      >
                        <X className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors">
                      <Upload className="w-12 h-12 text-[#8B6F47] mb-2" />
                      <span className="text-[#D4C5B9] text-sm">
                        {uploading ? "Enviando..." : "Clique para selecionar o logo"}
                      </span>
                      <span className="text-amber-300/80 text-xs mt-1">
                        Recomendado: PNG com fundo transparente (aprox. 600 × 300 px)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleFileUpload(file);
                        }}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website_url" className="text-white">Site</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://..."
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-white">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(11) 98765-4321"
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@parceiro.com.br"
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="order" className="text-white">Ordem de Exibição</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>
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
                  className="flex-1 bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
                  disabled={createPartner.isPending || updatePartner.isPending || uploading}
                >
                  {editingPartner ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
