import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Eye, EyeOff, Music, Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminVideos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    youtube_id: "",
    video_url: "",
    video_type: "youtube",
    thumbnail_url: "",
    views: "",
    description: "",
    featured: false,
    order: 0
  });

  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: () => base44.entities.Video.list("-order"),
  });

  const createVideo = useMutation({
    mutationFn: (data) => base44.entities.Video.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      closeDialog();
    },
  });

  const updateVideo = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Video.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      closeDialog();
    },
  });

  const deleteVideo = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  const toggleVideoVisibility = useMutation({
    mutationFn: ({ id, visible }) => base44.entities.Video.update(id, { visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  const openDialog = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        youtube_id: video.youtube_id || "",
        video_url: video.video_url || "",
        video_type: video.video_type || "youtube",
        thumbnail_url: video.thumbnail_url || "",
        views: video.views || "",
        description: video.description || "",
        featured: video.featured || false,
        order: video.order || 0
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: "",
        youtube_id: "",
        video_url: "",
        video_type: "youtube",
        thumbnail_url: "",
        views: "",
        description: "",
        featured: false,
        order: 0
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingVideo(null);
  };

  const handleFileUpload = async (file, type) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'video') {
        setFormData(prev => ({ ...prev, video_url: file_url, video_type: 'video_file' }));
      } else {
        setFormData(prev => ({ ...prev, thumbnail_url: file_url }));
      }
    } catch (error) {
      alert(`Erro ao fazer upload do ${type === 'video' ? 'vídeo' : 'thumbnail'}`);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação: vídeos de upload precisam de thumbnail
    if (formData.video_type === 'video_file' && !formData.thumbnail_url) {
      alert('Por favor, adicione uma capa para o vídeo enviado.');
      return;
    }
    
    if (editingVideo) {
      updateVideo.mutate({ id: editingVideo.id, data: formData });
    } else {
      createVideo.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este vídeo?")) {
      deleteVideo.mutate(id);
    }
  };

  const handleToggleVisibility = (id, currentVisible) => {
    const isCurrentlyVisible = currentVisible !== false;
    const newVisible = !isCurrentlyVisible;
    toggleVideoVisibility.mutate({ id, visible: newVisible });
  };

  const getFilteredVideos = (allVideos) => {
    if (filter === "visible") return allVideos.filter(v => v.visible !== false);
    if (filter === "hidden") return allVideos.filter(v => v.visible === false);
    return allVideos;
  };

  const extractYoutubeId = (url) => {
    if (!url) return '';
    // Se já é um ID (11 caracteres, sem http), retorna direto
    if (url.length === 11 && !url.includes('http')) return url;
    // Extrai de URLs do YouTube (incluindo Shorts)
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const getVideoSource = (video) => {
    if (video.video_type === 'youtube') {
      const id = video.youtube_id || extractYoutubeId(video.video_url || '');
      return extractYoutubeId(id);
    }
    return video.video_url;
  };

  const getThumbnail = (video) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    if (video.video_type === 'youtube') {
      const youtubeId = getVideoSource(video);
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    return null;
  };

  const displayVideos = getFilteredVideos(videos);

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Gerenciar Vídeos
            </h1>
            <p className="text-[#D4C5B9]">Adicione, edite ou remova vídeos da página</p>
          </div>
          <Button
            onClick={() => openDialog()}
            className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Vídeo
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-[#F4231E]" : ""}
          >
            Todos ({videos.length})
          </Button>
          <Button
            variant={filter === "visible" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("visible")}
            className={filter === "visible" ? "bg-green-600" : ""}
          >
            <Eye className="w-4 h-4 mr-1" />
            Visíveis ({videos.filter(v => v.visible !== false).length})
          </Button>
          <Button
            variant={filter === "hidden" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("hidden")}
            className={filter === "hidden" ? "bg-yellow-600" : ""}
          >
            <EyeOff className="w-4 h-4 mr-1" />
            Ocultos ({videos.filter(v => v.visible === false).length})
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center text-[#D4C5B9] py-12">
            <Music className="w-12 h-12 animate-pulse mx-auto mb-4" />
            Carregando vídeos...
          </div>
        ) : displayVideos.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Music className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
            <p className="text-[#D4C5B9] text-lg">
              {filter === "all" 
                ? "Clique em 'Adicionar Vídeo' para começar" 
                : `Nenhum vídeo ${filter === "visible" ? "visível" : "oculto"}`}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayVideos.map((video) => (
              <Card key={video.id} className="bg-[#1A1A1A] border-[#8B6F47]/30 overflow-hidden group relative">
                {video.visible === false && (
                  <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    Oculto
                  </div>
                )}
                {video.featured && (
                  <div className="absolute top-2 right-2 z-10 bg-[#F4231E] text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Destaque
                  </div>
                )}
                <div className="relative aspect-video">
                  {getThumbnail(video) && (
                    <img
                      src={getThumbnail(video)}
                      alt={video.title}
                      className={`w-full h-full object-cover ${video.visible === false ? 'opacity-50' : ''}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleVisibility(video.id, video.visible)}
                      className="text-white hover:text-blue-400"
                      title={video.visible === false ? "Exibir" : "Ocultar"}
                    >
                      {video.visible === false ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(video)}
                      className="text-white hover:text-blue-400"
                    >
                      <Pencil className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(video.id)}
                      className="text-white hover:text-red-500"
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold line-clamp-2 mb-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-[#D4C5B9] text-xs line-clamp-2 mb-2">{video.description}</p>
                  )}
                  {video.views && (
                    <div className="flex items-center gap-2 text-[#D4C5B9] text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{video.views} visualizações</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Video Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingVideo ? "Editar Vídeo" : "Adicionar Vídeo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <Label htmlFor="title" className="text-white">Título do Vídeo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
              </div>

              <div>
                <Label htmlFor="video_type" className="text-white">Tipo de Vídeo *</Label>
                <Select
                  value={formData.video_type}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    video_type: value,
                    youtube_id: "",
                    video_url: ""
                  }))}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">Link do YouTube</SelectItem>
                    <SelectItem value="video_file">Upload de Vídeo</SelectItem>
                    <SelectItem value="external_link">Link Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.video_type === 'youtube' ? (
                <div>
                  <Label htmlFor="youtube_id" className="text-white">Link do YouTube *</Label>
                  <Input
                    id="youtube_id"
                    value={formData.youtube_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_id: e.target.value }))}
                    required
                    placeholder="https://www.youtube.com/watch?v=... ou ID do vídeo"
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                  <p className="text-[#D4C5B9] text-xs mt-1">
                    Cole a URL completa ou apenas o ID do vídeo. O YouTube gera a capa automaticamente.
                  </p>
                </div>
              ) : formData.video_type === 'video_file' ? (
                <div>
                  <Label htmlFor="video_file" className="text-white">Upload de Vídeo *</Label>
                  <div className="mt-2">
                    {formData.video_url ? (
                      <div className="relative">
                        <video
                          src={formData.video_url}
                          controls
                          className="w-full h-48 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/50"
                          onClick={() => setFormData(prev => ({ ...prev, video_url: "" }))}
                        >
                          <X className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors">
                        <Upload className="w-12 h-12 text-[#8B6F47] mb-2" />
                        <span className="text-[#D4C5B9] text-sm">
                          {uploading ? "Enviando..." : "Clique para selecionar vídeo"}
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleFileUpload(file, 'video');
                          }}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="video_url" className="text-white">Link do Vídeo *</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                    required
                    placeholder="https://..."
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                  <p className="text-yellow-400 text-xs mt-2">
                    ⚠️ Links do Instagram serão abertos no app do Instagram (não podem ser reproduzidos aqui). Recomendamos fazer upload do vídeo.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="thumbnail" className="text-white">
                  Capa do Vídeo {formData.video_type === 'video_file' ? '(Obrigatória para vídeos enviados)' : '(Opcional)'}
                </Label>
                <div className="mt-2">
                  {formData.thumbnail_url ? (
                    <div className="relative">
                      <img
                        src={formData.thumbnail_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50"
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: "" }))}
                      >
                        <X className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  ) : (
                    <label className={`border-2 border-dashed ${formData.video_type === 'video_file' && !formData.thumbnail_url ? 'border-[#F4231E]' : 'border-[#8B6F47]/30'} rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors`}>
                      <Upload className={`w-12 h-12 ${formData.video_type === 'video_file' && !formData.thumbnail_url ? 'text-[#F4231E]' : 'text-[#8B6F47]'} mb-2`} />
                      <span className="text-[#D4C5B9] text-sm">
                        {uploading ? "Enviando..." : "Clique para selecionar a capa"}
                      </span>
                      {formData.video_type === 'video_file' && !formData.thumbnail_url && (
                        <span className="text-[#F4231E] text-xs mt-1 font-semibold">
                          ⚠️ Obrigatório para vídeos enviados
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleFileUpload(file, 'thumbnail');
                        }}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Adicione uma descrição..."
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="views" className="text-white">Visualizações</Label>
                  <Input
                    id="views"
                    value={formData.views}
                    onChange={(e) => setFormData(prev => ({ ...prev, views: e.target.value }))}
                    placeholder="Ex: 460K"
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="order" className="text-white">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured" className="text-white cursor-pointer">
                  Marcar como vídeo em destaque
                </Label>
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
                  disabled={createVideo.isPending || updateVideo.isPending || uploading}
                >
                  {editingVideo ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}