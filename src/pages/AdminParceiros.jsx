import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Handshake, Plus, Pencil, Trash2, ExternalLink, MessageCircle, Mail, Upload, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminParceiros() {
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

  const openDialog = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name || "",
        logo_url: partner.logo_url || "",
        website_url: partner.website_url || "",
        whatsapp: partner.whatsapp || "",
        email: partner.email || "",
        order: partner.order !== undefined ? partner.order : 0
      });
    } else {
      setEditingPartner(null);
      const nextOrder = partners.length > 0 
        ? Math.max(...partners.map(p => Number(p.order) || 0)) + 1 
        : 1;
      setFormData({
        name: "",
        logo_url: "",
        website_url: "",
        whatsapp: "",
        email: "",
        order: nextOrder
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPartner(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({
        file,
        options: { maxWidth: 600, quality: 0.85 }
      });
      setFormData(prev => ({ ...prev, logo_url: result.file_url }));
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      order: Number(formData.order) || 0
    };

    if (editingPartner) {
      updatePartner.mutate({ id: editingPartner.id, data });
    } else {
      createPartner.mutate(data);
    }
  };

  const handleDelete = (id, name) => {
    if (confirm(`Tem certeza que deseja excluir o parceiro "${name}"?`)) {
      deletePartner.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Handshake className="w-10 h-10 text-[#F4231E]" />
              Gerenciar Parceiros
            </h1>
            <p className="text-[#D4C5B9]">
              Cadastre marcas, patrocinadores e apoiadores oficiais da dupla
            </p>
          </div>

          <Button
            onClick={() => openDialog()}
            className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold flex items-center gap-2 self-start md:self-auto shadow-lg"
          >
            <Plus className="w-5 h-5" />
            + Novo Parceiro
          </Button>
        </div>

        {/* Partners Grid */}
        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-16">
            <Handshake className="w-12 h-12 animate-pulse mx-auto mb-4 text-[#E9A55C]" />
            Carregando parceiros...
          </div>
        ) : partners.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Handshake className="w-16 h-16 text-[#8B6F47] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum parceiro cadastrado</h3>
            <p className="text-[#D4C5B9] mb-6">Cadastre as marcas parceiras de Victor & Franco.</p>
            <Button
              onClick={() => openDialog()}
              className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Parceiro
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners
              .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
              .map((partner) => (
                <Card
                  key={partner.id}
                  className="bg-[#1A1A1A] border-[#8B6F47]/30 hover:border-[#8B6F47] transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Logo Box */}
                    <div className="bg-white/5 border border-[#8B6F47]/20 rounded-xl p-4 h-36 flex items-center justify-center mb-4 overflow-hidden">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain filter hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white truncate">{partner.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#8B6F47]/20 text-[#E9A55C] border border-[#8B6F47]/40 font-mono">
                        Ordem: {partner.order || 0}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#D4C5B9] mb-4">
                      {partner.website_url && (
                        <div className="flex items-center gap-1.5 truncate">
                          <ExternalLink className="w-3.5 h-3.5 text-[#E9A55C] flex-shrink-0" />
                          <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-[#E9A55C] truncate"
                          >
                            {partner.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}

                      {partner.whatsapp && (
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          <span>{partner.whatsapp}</span>
                        </div>
                      )}

                      {partner.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{partner.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-[#8B6F47]/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(partner)}
                      className="flex-1 border-[#8B6F47]/50 text-[#E9A55C] hover:bg-[#8B6F47]/20 flex items-center justify-center gap-1.5 text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(partner.id, partner.name)}
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
                {editingPartner ? "Editar Parceiro" : "Adicionar Novo Parceiro"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="name" className="text-white">Nome do Parceiro *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Embalasert"
                  required
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Logo do Parceiro</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="URL da logo ou faça upload"
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white flex-1"
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        className="border-[#8B6F47] text-[#E9A55C] hover:bg-[#8B6F47]/20 flex items-center gap-1.5"
                        onClick={() => document.getElementById('partner-logo-upload').click()}
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? "Enviando..." : "Enviar Foto"}
                      </Button>
                    </label>
                    <input
                      id="partner-logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {formData.logo_url && (
                    <div className="p-3 bg-white/5 border border-[#8B6F47]/30 rounded-lg flex items-center justify-center h-24">
                      <img
                        src={formData.logo_url}
                        alt="Prévia"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="website_url" className="text-white">Site / Link</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://exemplo.com.br"
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp" className="text-white">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(16) 99999-9999"
                    className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="order" className="text-white">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                    className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@empresa.com.br"
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
                  disabled={createPartner.isPending || updatePartner.isPending || uploading}
                  className="flex-1 bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
                >
                  {createPartner.isPending || updatePartner.isPending ? "Salvando..." : "Salvar Parceiro"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
