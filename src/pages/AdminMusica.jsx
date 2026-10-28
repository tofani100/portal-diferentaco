import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music2, Plus, Pencil, Trash2, ExternalLink, Play, ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminMusica() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    media_url: "",
    media_type: "youtube",
    order: 1
  });

  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["featuredTracks"],
    queryFn: () => base44.entities.FeaturedTrack.list("order"),
  });

  const createTrack = useMutation({
    mutationFn: (data) => base44.entities.FeaturedTrack.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featuredTracks"] });
      closeDialog();
    },
  });

  const updateTrack = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeaturedTrack.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featuredTracks"] });
      closeDialog();
    },
  });

  const deleteTrack = useMutation({
    mutationFn: (id) => base44.entities.FeaturedTrack.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featuredTracks"] });
    },
  });

  const openDialog = (track = null) => {
    if (track) {
      setEditingTrack(track);
      setFormData({
        title: track.title || "",
        media_url: track.media_url || "",
        media_type: track.media_type || "youtube",
        order: track.order || 1
      });
    } else {
      setEditingTrack(null);
      const nextOrder = tracks.length > 0 
        ? Math.max(...tracks.map(t => Number(t.order) || 0)) + 1 
        : 1;
      setFormData({
        title: "",
        media_url: "",
        media_type: "youtube",
        order: nextOrder
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTrack(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      order: Number(formData.order) || 1
    };

    if (editingTrack) {
      updateTrack.mutate({ id: editingTrack.id, data });
    } else {
      createTrack.mutate(data);
    }
  };

  const handleDelete = (id, title) => {
    if (confirm(`Tem certeza que deseja excluir a música "${title}"?`)) {
      deleteTrack.mutate(id);
    }
  };

  // Helper para extrair YouTube ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Music2 className="w-10 h-10 text-[#F4231E]" />
              Gerenciar Músicas
            </h1>
            <p className="text-[#D4C5B9]">
              Gerencie a lista de faixas em destaque no player da página de Músicas
            </p>
          </div>

          <Button
            onClick={() => openDialog()}
            className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold flex items-center gap-2 self-start md:self-auto shadow-lg"
          >
            <Plus className="w-5 h-5" />
            + Nova Música
          </Button>
        </div>

        {/* Tracks List */}
        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-16">
            <Music2 className="w-12 h-12 animate-pulse mx-auto mb-4 text-[#E9A55C]" />
            Carregando músicas...
          </div>
        ) : tracks.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Music2 className="w-16 h-16 text-[#8B6F47] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma música cadastrada</h3>
            <p className="text-[#D4C5B9] mb-6">Cadastre as músicas que serão exibidas para reprodução no site.</p>
            <Button
              onClick={() => openDialog()}
              className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Música
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tracks
              .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
              .map((track, idx) => {
                const ytId = getYouTubeId(track.media_url);
                return (
                  <Card
                    key={track.id}
                    className="bg-[#1A1A1A] border-[#8B6F47]/30 hover:border-[#8B6F47] transition-all p-5"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[#8B6F47]/20 border border-[#8B6F47]/40 flex items-center justify-center font-bold text-[#E9A55C] flex-shrink-0">
                          {track.order || idx + 1}
                        </div>

                        {ytId ? (
                          <div className="w-20 h-14 rounded overflow-hidden bg-black flex-shrink-0 relative">
                            <img
                              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded bg-[#8B6F47]/10 flex items-center justify-center flex-shrink-0">
                            <Music2 className="w-6 h-6 text-[#E9A55C]" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">{track.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-[#D4C5B9] mt-1">
                            <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/10">
                              {track.media_type === "youtube" ? "YouTube" : "Áudio"}
                            </span>
                            {track.media_url && (
                              <a
                                href={track.media_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#E9A55C] hover:underline flex items-center gap-1 truncate max-w-xs"
                              >
                                Link <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(track)}
                          className="border-[#8B6F47]/50 text-[#E9A55C] hover:bg-[#8B6F47]/20 flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(track.id, track.title)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}

        {/* Dialog Form */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingTrack ? "Editar Música" : "Adicionar Nova Música"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="title" className="text-white">Título da Música *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: QUER TERMINAR, TERMINA"
                  required
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>

              <div>
                <Label htmlFor="media_type" className="text-white">Tipo de Mídia</Label>
                <Select
                  value={formData.media_type}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, media_type: val }))}
                >
                  <SelectTrigger className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#8B6F47]/30 text-white">
                    <SelectItem value="youtube">Vídeo / Faixa do YouTube</SelectItem>
                    <SelectItem value="audio">Arquivo de Áudio / Link Direto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="media_url" className="text-white">URL / Link da Mídia *</Label>
                <Input
                  id="media_url"
                  value={formData.media_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
                <p className="text-xs text-[#D4C5B9] mt-1">
                  Cole o link do YouTube da música ou vídeo oficial
                </p>
              </div>

              <div>
                <Label htmlFor="order" className="text-white">Ordem de Exibição</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
                <p className="text-xs text-[#D4C5B9] mt-1">
                  1 aparece primeiro, 2 em segundo, etc.
                </p>
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
                  disabled={createTrack.isPending || updateTrack.isPending}
                  className="flex-1 bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
                >
                  {createTrack.isPending || updateTrack.isPending ? "Salvando..." : "Salvar Música"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
