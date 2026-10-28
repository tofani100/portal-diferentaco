import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Upload, Trash2, Image as ImageIcon, Link as LinkIcon, Home, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
import MediaSpecsBanner from "@/components/admin/MediaSpecsBanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BUILD_TIMESTAMP = '2025-12-14T17:30:00Z';
console.log('🚀 VERSÃO NOVA CARREGADA:', BUILD_TIMESTAMP);

export default function AdminFotos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file"); // "file" or "url"
  const [filterPress, setFilterPress] = useState("all"); // "all", "visible", "hidden"
  const [filterRoad, setFilterRoad] = useState("all");
  const [filterHero, setFilterHero] = useState("all");
  const [formData, setFormData] = useState({
    image_url: "",
    album: "press",
    caption: ""
  });

  const queryClient = useQueryClient();

  const { data: pressPhotos = [] } = useQuery({
    queryKey: ["admin-photos", "press"],
    queryFn: () => base44.entities.Photo.filter({ album: "press" }, "-created_date"),
  });

  const { data: roadPhotos = [] } = useQuery({
    queryKey: ["admin-photos", "on_the_road"],
    queryFn: () => base44.entities.Photo.filter({ album: "on_the_road" }, "-created_date"),
  });

  const { data: heroConfig } = useQuery({
    queryKey: ["siteConfig", "hero_media"],
    queryFn: async () => {
      const configs = await base44.entities.SiteConfig.filter({ config_key: "hero_media" });
      return configs[0] || null;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const updateHeroConfig = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) {
        return await base44.entities.SiteConfig.update(id, data);
      } else {
        return await base44.entities.SiteConfig.create({ ...data, config_key: "hero_media" });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["siteConfig", "hero_media"] });
      await queryClient.refetchQueries({ queryKey: ["siteConfig", "hero_media"] });
    },
  });

  const createPhoto = useMutation({
    mutationFn: (data) => base44.entities.Photo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      closeDialog();
    },
  });

  const deletePhoto = useMutation({
    mutationFn: (id) => base44.entities.Photo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  const togglePhotoVisibility = useMutation({
    mutationFn: ({ id, visible }) => base44.entities.Photo.update(id, { visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      alert("Erro ao fazer upload da foto");
    }
    setUploading(false);
  };

  const handleMultipleFileUpload = async (files) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return {
          image_url: file_url,
          album: formData.album,
          caption: ""
        };
      });
      
      const photoData = await Promise.all(uploadPromises);
      
      for (const photo of photoData) {
        await createPhoto.mutateAsync(photo);
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      
      alert(`${photoData.length} foto(s) adicionada(s) com sucesso!`);
      closeDialog();
    } catch (error) {
      alert("Erro ao fazer upload das fotos");
    }
    setUploading(false);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormData({ image_url: "", album: "press", caption: "" });
    setUploadMethod("file");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image_url) {
      alert("Por favor, faça upload de uma foto ou insira uma URL");
      return;
    }
    createPhoto.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      deletePhoto.mutate(id);
    }
  };

  const handleHeroFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      
      const currentItems = heroConfig?.hero_media_items || [];
      const newItems = [...currentItems, { url: file_url, type: fileType, visible: true }];
      
      await updateHeroConfig.mutateAsync({
        id: heroConfig?.id,
        data: {
          hero_media_items: newItems
        }
      });
      
      // Force refetch to ensure UI updates
      await queryClient.refetchQueries({ queryKey: ["siteConfig", "hero_media"] });
      
      alert('Mídia adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da mídia: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteHeroMedia = async (index) => {
    if (!confirm("Tem certeza que deseja remover esta mídia da capa?")) return;
    
    try {
      const currentItems = heroConfig?.hero_media_items || [];
      const newItems = currentItems.filter((_, i) => i !== index);
      
      await updateHeroConfig.mutateAsync({
        id: heroConfig?.id,
        data: {
          hero_media_items: newItems
        }
      });
    } catch (error) {
      alert('Erro ao deletar mídia');
    }
  };

  const handleHeroMobileFileUpload = async (file, index) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const currentItems = heroConfig?.hero_media_items || [];
      const newItems = currentItems.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            mobile_url: file_url
          };
        }
        return item;
      });

      await updateHeroConfig.mutateAsync({
        id: heroConfig?.id,
        data: {
          hero_media_items: newItems
        }
      });
      await queryClient.refetchQueries({ queryKey: ["siteConfig", "hero_media"] });
      alert("Versão específica para Celular (9:16) adicionada com sucesso!");
    } catch (error) {
      console.error('Erro ao fazer upload mobile:', error);
      alert('Erro ao fazer upload da versão mobile: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveHeroMobile = async (index) => {
    if (!confirm("Deseja remover a versão mobile desta mídia? Ela voltará a usar o enquadramento padrão.")) return;
    try {
      const currentItems = heroConfig?.hero_media_items || [];
      const newItems = currentItems.map((item, i) => {
        if (i === index) {
          const { mobile_url, ...rest } = item;
          return rest;
        }
        return item;
      });

      await updateHeroConfig.mutateAsync({
        id: heroConfig?.id,
        data: {
          hero_media_items: newItems
        }
      });
      await queryClient.refetchQueries({ queryKey: ["siteConfig", "hero_media"] });
    } catch (error) {
      alert('Erro ao remover versão mobile');
    }
  };

  const handleToggleHeroVisibility = async (index) => {
    try {
      const currentItems = heroConfig?.hero_media_items || [];
      const newItems = currentItems.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            visible: item.visible === false ? true : false
          };
        }
        return item;
      });
      
      await updateHeroConfig.mutateAsync({
        id: heroConfig?.id,
        data: {
          hero_media_items: newItems
        }
      });
    } catch (error) {
      alert('Erro ao atualizar visibilidade');
    }
  };

  const getFilteredPhotos = (photos, filter) => {
    if (filter === "visible") return photos.filter(p => p.visible !== false);
    if (filter === "hidden") return photos.filter(p => p.visible === false);
    return photos;
  };

  const getFilteredHeroMedia = (items, filter) => {
    if (!items) return [];
    if (filter === "visible") return items.filter(i => i.visible !== false);
    if (filter === "hidden") return items.filter(i => i.visible === false);
    return items;
  };

  const PhotoGrid = ({ photos, album }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="bg-[#1A1A1A] border-[#8B6F47]/30 overflow-hidden group relative">
          {photo.visible === false && (
            <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
              Oculta
            </div>
          )}
          <div className="relative aspect-square">
            <img
              src={photo.image_url}
              alt={photo.caption || "Foto"}
              className={`w-full h-full object-cover ${photo.visible === false ? 'opacity-50' : ''}`}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const currentVisible = photo.visible !== false;
                  const newVisible = !currentVisible;
                  console.log('Toggling photo', photo.id, 'currentVisible:', currentVisible, 'newVisible:', newVisible);
                  togglePhotoVisibility.mutate({ id: photo.id, visible: newVisible });
                }}
                className="text-white hover:text-blue-400"
                title={photo.visible === false ? "Exibir" : "Ocultar"}
              >
                {photo.visible === false ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(photo.id)}
                className="text-white hover:text-red-500"
                title="Deletar permanentemente"
              >
                <Trash2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
          {photo.caption && (
            <div className="p-3">
              <p className="text-[#D4C5B9] text-sm line-clamp-2">{photo.caption}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Gerenciar Fotos
            </h1>
            <p className="text-[#D4C5B9]">Adicione fotos aos álbuns Imprensa e Na Estrada</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Foto
          </Button>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A] border border-[#8B6F47]/30 mb-8">
            <TabsTrigger
              value="hero"
              className="data-[state=active]:bg-[#F4231E] data-[state=active]:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Capa ({heroConfig?.hero_media_items?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="press"
              className="data-[state=active]:bg-[#E9A55C] data-[state=active]:text-black"
            >
              Imprensa ({pressPhotos.length})
            </TabsTrigger>
            <TabsTrigger
              value="road"
              className="data-[state=active]:bg-[#E9A55C] data-[state=active]:text-black"
            >
              Na Estrada ({roadPhotos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <MediaSpecsBanner type="hero" />

            <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Fotos/Vídeos da Capa Inicial</h3>
              <p className="text-[#D4C5B9] text-sm mb-4">
                Adicione múltiplas imagens ou vídeos. Eles serão alternados automaticamente a cada 4 segundos na página inicial.
              </p>
              
              <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors">
                <Upload className="w-10 h-10 text-[#F4231E] mb-2" />
                <span className="text-white font-semibold">
                  {uploading ? "Enviando..." : "Clique para adicionar nova mídia"}
                </span>
                <span className="text-[#D4C5B9] text-xs mt-1">
                  Aceita imagens e vídeos
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleHeroFileUpload(file);
                  }}
                  disabled={uploading}
                />
              </label>
            </Card>

            <div className="flex gap-2 mb-4">
              <Button
                variant={filterHero === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterHero("all")}
                className={filterHero === "all" ? "bg-[#F4231E]" : ""}
              >
                Todas ({heroConfig?.hero_media_items?.length || 0})
              </Button>
              <Button
                variant={filterHero === "visible" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterHero("visible")}
                className={filterHero === "visible" ? "bg-green-600" : ""}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visíveis ({getFilteredHeroMedia(heroConfig?.hero_media_items, "visible").length})
              </Button>
              <Button
                variant={filterHero === "hidden" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterHero("hidden")}
                className={filterHero === "hidden" ? "bg-yellow-600" : ""}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Ocultas ({getFilteredHeroMedia(heroConfig?.hero_media_items, "hidden").length})
              </Button>
            </div>

            {heroConfig?.hero_media_items?.length === 0 || !heroConfig?.hero_media_items ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9]">Nenhuma mídia adicionada na capa. Adicione sua primeira imagem ou vídeo acima.</p>
              </Card>
            ) : getFilteredHeroMedia(heroConfig.hero_media_items, filterHero).length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9]">Nenhuma mídia {filterHero === "visible" ? "visível" : "oculta"}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getFilteredHeroMedia(heroConfig.hero_media_items, filterHero).map((item, originalIndex) => {
                  const index = heroConfig.hero_media_items.indexOf(item);
                  return (
                    <Card key={index} className="bg-[#1A1A1A] border-[#8B6F47]/30 overflow-hidden group relative">
                      {item.visible === false && (
                        <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                          Oculta
                        </div>
                      )}
                      <div className="relative aspect-video">
                        {item.type === 'video' ? (
                          <video
                            src={item.url}
                            className={`w-full h-full object-cover ${item.visible === false ? 'opacity-50' : ''}`}
                            muted
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={`Mídia ${index + 1}`}
                            className={`w-full h-full object-cover ${item.visible === false ? 'opacity-50' : ''}`}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleHeroVisibility(index)}
                            className="text-white hover:text-blue-400"
                            title={item.visible === false ? "Exibir" : "Ocultar"}
                          >
                            {item.visible === false ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteHeroMedia(index)}
                            className="text-white hover:text-red-500"
                            title="Deletar permanentemente"
                          >
                            <Trash2 className="w-6 h-6" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {item.type === 'video' ? 'Vídeo' : 'Imagem'}
                        </div>
                      </div>

                      {/* Desktop / Mobile info & actions */}
                      <div className="p-3 border-t border-[#8B6F47]/20 flex flex-col gap-2 bg-[#141414]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium flex items-center gap-1">
                            <Monitor className="w-3.5 h-3.5 text-amber-400" />
                            Desktop (16:9)
                          </span>
                          {item.mobile_url ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                              <Smartphone className="w-3 h-3" /> Mobile Ativo
                            </span>
                          ) : (
                            <span className="text-[#D4C5B9] text-[11px] flex items-center gap-1" title="Sem versão vertical dedicada: usando recorte central">
                              <Smartphone className="w-3 h-3 text-[#F4231E]" /> Padrão
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                          <label className="text-[11px] bg-[#1A1A1A] hover:bg-[#8B6F47]/20 text-amber-200 border border-[#8B6F47]/40 px-2 py-1 rounded cursor-pointer transition-colors inline-flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{item.mobile_url ? "Alterar Mobile" : "+ Mobile (9:16)"}</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleHeroMobileFileUpload(file, index);
                              }}
                              disabled={uploading}
                            />
                          </label>

                          {item.mobile_url && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHeroMobile(index)}
                              className="text-red-400 hover:text-red-300 text-[11px] px-1 py-0.5"
                              title="Remover versão vertical dedicada"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="press">
            <MediaSpecsBanner type="press" />

            <div className="flex gap-2 mb-4">
              <Button
                variant={filterPress === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPress("all")}
                className={filterPress === "all" ? "bg-[#E9A55C] text-black" : ""}
              >
                Todas ({pressPhotos.length})
              </Button>
              <Button
                variant={filterPress === "visible" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPress("visible")}
                className={filterPress === "visible" ? "bg-green-600" : ""}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visíveis ({getFilteredPhotos(pressPhotos, "visible").length})
              </Button>
              <Button
                variant={filterPress === "hidden" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPress("hidden")}
                className={filterPress === "hidden" ? "bg-yellow-600" : ""}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Ocultas ({getFilteredPhotos(pressPhotos, "hidden").length})
              </Button>
            </div>

            {pressPhotos.length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9]">Nenhuma foto no álbum Imprensa</p>
              </Card>
            ) : getFilteredPhotos(pressPhotos, filterPress).length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9]">Nenhuma foto {filterPress === "visible" ? "visível" : "oculta"}</p>
              </Card>
            ) : (
              <PhotoGrid photos={getFilteredPhotos(pressPhotos, filterPress)} album="press" />
            )}
          </TabsContent>

          <TabsContent value="road">
            <MediaSpecsBanner type="road" />

            <div className="flex gap-2 mb-4">
              <Button
                variant={filterRoad === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRoad("all")}
                className={filterRoad === "all" ? "bg-[#E9A55C] text-black" : ""}
              >
                Todas ({roadPhotos.length})
              </Button>
              <Button
                variant={filterRoad === "visible" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRoad("visible")}
                className={filterRoad === "visible" ? "bg-green-600" : ""}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visíveis ({getFilteredPhotos(roadPhotos, "visible").length})
              </Button>
              <Button
                variant={filterRoad === "hidden" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRoad("hidden")}
                className={filterRoad === "hidden" ? "bg-yellow-600" : ""}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Ocultas ({getFilteredPhotos(roadPhotos, "hidden").length})
              </Button>
            </div>

            {roadPhotos.length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9]">Nenhuma foto no álbum Na Estrada</p>
              </Card>
            ) : getFilteredPhotos(roadPhotos, filterRoad).length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9]">Nenhuma foto {filterRoad === "visible" ? "visível" : "oculta"}</p>
              </Card>
            ) : (
              <PhotoGrid photos={getFilteredPhotos(roadPhotos, filterRoad)} album="on_the_road" />
            )}
          </TabsContent>
        </Tabs>

        {/* Upload Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Adicionar Foto
              </DialogTitle>
              <p className="text-[#D4C5B9] text-sm mt-2">
                Faça upload de um arquivo ou cole o link de uma imagem
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="album" className="text-white">Álbum *</Label>
                <Select
                  value={formData.album}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, album: value }))}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="press">Imprensa</SelectItem>
                    <SelectItem value="on_the_road">Na Estrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Method Selection */}
              <div>
                <Label className="text-white mb-3 block">Método de Adição *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={uploadMethod === "file" ? "default" : "outline"}
                    className={uploadMethod === "file" ? "bg-[#E9A55C] text-black hover:bg-[#d9954c]" : ""}
                    onClick={() => {
                      setUploadMethod("file");
                      setFormData(prev => ({ ...prev, image_url: "" }));
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMethod === "url" ? "default" : "outline"}
                    className={uploadMethod === "url" ? "bg-[#E9A55C] text-black hover:bg-[#d9954c]" : ""}
                    onClick={() => {
                      setUploadMethod("url");
                      setFormData(prev => ({ ...prev, image_url: "" }));
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Usar Link
                  </Button>
                </div>
              </div>

              {/* Upload or URL Input */}
              <div>
                {uploadMethod === "file" ? (
                  <>
                    <Label htmlFor="photo" className="text-white">Arquivo de Imagem *</Label>
                    <div className="mt-2">
                      {formData.image_url ? (
                        <div className="relative">
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-black/50"
                            onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                          >
                            Remover
                          </Button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#E9A55C] transition-colors">
                          <Upload className="w-12 h-12 text-[#8B6F47] mb-2" />
                          <span className="text-[#D4C5B9] text-sm">
                            {uploading ? "Enviando..." : "Clique para selecionar (múltiplos arquivos)"}
                          </span>
                          <span className="text-[#D4C5B9] text-xs mt-1">
                            JPG, PNG, GIF, WEBP - Selecione uma ou várias fotos de uma vez
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                if (files.length === 1) {
                                  handleFileUpload(files[0]);
                                } else {
                                  handleMultipleFileUpload(files);
                                }
                              }
                            }}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Label htmlFor="image_url" className="text-white">URL da Imagem *</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                      required
                    />
                    <p className="text-[#D4C5B9] text-xs mt-2">
                      Cole o link direto da imagem de qualquer fonte: Instagram, Facebook, Google Drive, etc.
                    </p>
                    
                    {formData.image_url && (
                      <div className="mt-4">
                        <p className="text-white text-sm mb-2">Preview:</p>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            alert("Não foi possível carregar a imagem. Verifique se a URL está correta.");
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <Label htmlFor="caption" className="text-white">Legenda (opcional)</Label>
                <Textarea
                  id="caption"
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Adicione uma legenda..."
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  rows={3}
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
                  className="flex-1 bg-[#E9A55C] hover:bg-[#d9954c] text-black font-semibold"
                  disabled={createPhoto.isPending || uploading}
                >
                  Adicionar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}