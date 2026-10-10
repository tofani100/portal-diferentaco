
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music2, Play, Pause, Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MusicPlayer() {
  const [editMode, setEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    media_url: "",
    media_type: "youtube",
    order: 1
  });

  const queryClient = useQueryClient();

  const { data: tracks = [] } = useQuery({
    queryKey: ["homeFeaturedTracks"],
    queryFn: () => base44.entities.FeaturedTrack.list("order", 5),
  });

  const createTrack = useMutation({
    mutationFn: (data) => base44.entities.FeaturedTrack.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeaturedTracks"] });
      queryClient.invalidateQueries({ queryKey: ["featuredTracks"] });
      closeDialog();
    },
  });

  const updateTrack = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeaturedTrack.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeaturedTracks"] });
      queryClient.invalidateQueries({ queryKey: ["featuredTracks"] });
      closeDialog();
    },
  });

  const deleteTrack = useMutation({
    mutationFn: (id) => base44.entities.FeaturedTrack.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeaturedTracks"] });
      queryClient.invalidateQueries({ queryKey: ["featuredTracks"] });
      if (currentTrack?.id === id) {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    },
  });

  useEffect(() => {
    const handleEditModeChange = (e) => {
      setEditMode(e.detail.editMode);
    };
    window.addEventListener('editModeChanged', handleEditModeChange);
    return () => window.removeEventListener('editModeChanged', handleEditModeChange);
  }, []);

  useEffect(() => {
    if (tracks.length > 0 && !currentTrack) {
      setCurrentTrack(tracks[0]);
    }
  }, [tracks, currentTrack]);

  const openDialog = (track = null) => {
    if (track) {
      setEditingTrack(track);
      setFormData({
        title: track.title,
        media_url: track.media_url,
        media_type: track.media_type,
        order: track.order
      });
    } else {
      setEditingTrack(null);
      const nextOrder = tracks.length > 0 
        ? Math.max(...tracks.map(t => t.order)) + 1 
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

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const fileType = file.type.startsWith('video/') ? 'video' : 'audio';
      setFormData(prev => ({ 
        ...prev, 
        media_url: file_url,
        media_type: fileType
      }));
    } catch (error) {
      alert("Erro ao fazer upload do arquivo");
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTrack) {
      updateTrack.mutate({ id: editingTrack.id, data: formData });
    } else {
      createTrack.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir esta música?")) {
      deleteTrack.mutate(id);
    }
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      if (audioElement) {
        audioElement.pause();
      }
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : url;
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ouça Agora
            </h2>
            {editMode && tracks.length < 5 && (
              <Button
                onClick={() => openDialog()}
                size="sm"
                className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>
          <p className="text-[#D4C5B9] text-lg">
            As melhores do DVD Diferentaço
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Player */}
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-8">
            <div className="aspect-square bg-gradient-to-br from-[#8B6F47] to-[#F4231E] rounded-lg mb-6 flex items-center justify-center overflow-hidden">
              {currentTrack && currentTrack.media_type === 'youtube' ? (
                <iframe
                  key={currentTrack.media_url}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(currentTrack.media_url)}?autoplay=${isPlaying ? 1 : 0}`}
                  title={currentTrack.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : currentTrack && currentTrack.media_type === 'video' ? (
                <video
                  key={currentTrack.media_url}
                  src={currentTrack.media_url}
                  controls
                  autoPlay={isPlaying}
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : currentTrack && currentTrack.media_type === 'audio' ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <Music2 className="w-32 h-32 text-black/20 mb-8" />
                  <audio
                    key={currentTrack.media_url}
                    ref={setAudioElement}
                    src={currentTrack.media_url}
                    controls
                    autoPlay={isPlaying}
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <Music2 className="w-24 h-24 text-black/20" />
              )}
            </div>
            {currentTrack && (
              <div className="text-center">
                <h3 className="text-white text-xl font-bold mb-1">{currentTrack.title}</h3>
                <p className="text-[#D4C5B9] text-sm">Victor & Franco</p>
              </div>
            )}
          </Card>

          {/* Track List */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#F4231E] mb-6">
              Faixas do Álbum
            </h3>
            {tracks.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-[#8B6F47]/20 rounded-lg p-8 text-center">
                <Music2 className="w-12 h-12 text-[#8B6F47] mx-auto mb-3" />
                <p className="text-[#D4C5B9] text-sm">
                  {editMode ? "Clique em 'Adicionar' para adicionar músicas" : "Em breve novas músicas"}
                </p>
              </div>
            ) : (
              tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#8B6F47]/20 rounded-lg hover:border-[#F4231E]/50 transition-all cursor-pointer relative group ${
                    currentTrack?.id === track.id ? 'ring-2 ring-[#F4231E]' : ''
                  }`}
                  onClick={() => !editMode && playTrack(track)}
                >
                  <div className="w-10 h-10 bg-[#8B6F47]/30 rounded-full flex items-center justify-center text-[#F4231E] font-bold flex-shrink-0">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{track.title}</p>
                    <p className="text-[#D4C5B9] text-sm">Victor & Franco</p>
                  </div>
                  {editMode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDialog(track);
                        }}
                      >
                        <Pencil className="w-3 h-3 text-[#D4C5B9]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(track.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Track Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingTrack ? "Editar Música" : "Adicionar Música"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Título da Música *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
              </div>

              <div>
                <Label htmlFor="media_type" className="text-white">Tipo de Mídia *</Label>
                <Select
                  value={formData.media_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, media_type: value, media_url: "" }))}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">Link do YouTube</SelectItem>
                    <SelectItem value="audio">Arquivo de Áudio (MP3)</SelectItem>
                    <SelectItem value="video">Arquivo de Vídeo (MP4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.media_type === 'youtube' ? (
                <div>
                  <Label htmlFor="media_url" className="text-white">Link do YouTube *</Label>
                  <Input
                    id="media_url"
                    value={formData.media_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                  <p className="text-[#D4C5B9] text-xs mt-1">
                    Cole a URL completa do vídeo do YouTube
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="file" className="text-white">
                    Arquivo {formData.media_type === 'audio' ? 'de Áudio' : 'de Vídeo'} *
                  </Label>
                  <div className="mt-2">
                    {formData.media_url ? (
                      <div className="relative">
                        <div className="bg-[#0A0A0A] border border-[#8B6F47]/30 rounded-lg p-4">
                          <p className="text-white text-sm mb-2">Arquivo carregado:</p>
                          {formData.media_type === 'video' ? (
                            <video
                              src={formData.media_url}
                              controls
                              className="w-full h-48 rounded-lg"
                            />
                          ) : (
                            <audio
                              src={formData.media_url}
                              controls
                              className="w-full"
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/50"
                          onClick={() => setFormData(prev => ({ ...prev, media_url: "" }))}
                        >
                          <X className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors">
                        <Upload className="w-12 h-12 text-[#8B6F47] mb-2" />
                        <span className="text-[#D4C5B9] text-sm">
                          {uploading ? "Enviando..." : `Clique para selecionar ${formData.media_type === 'audio' ? 'áudio' : 'vídeo'}`}
                        </span>
                        <input
                          type="file"
                          accept={formData.media_type === 'audio' ? 'audio/*' : 'video/*'}
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
              )}

              <div>
                <Label htmlFor="order" className="text-white">Posição na Lista (1-5) *</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
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
                  disabled={createTrack.isPending || updateTrack.isPending || uploading}
                >
                  {editingTrack ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
