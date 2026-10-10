import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Play, Upload, X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";

export default function HeroSection() {
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dvdVideoOpen, setDvdVideoOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["siteConfig", "hero_media"],
    queryFn: async () => {
      const configs = await base44.entities.SiteConfig.filter({ config_key: "hero_media" });
      return configs[0] || null;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const updateConfig = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) {
        return await base44.entities.SiteConfig.update(id, data);
      } else {
        return await base44.entities.SiteConfig.create({ ...data, config_key: "hero_media" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteConfig", "hero_media"] });
    }
  });

  useEffect(() => {
    const handleEditModeChange = (e) => {
      setEditMode(e.detail.editMode);
    };
    window.addEventListener('editModeChanged', handleEditModeChange);
    return () => window.removeEventListener('editModeChanged', handleEditModeChange);
  }, []);

  useEffect(() => {
    const mediaItems = config?.hero_media_items || [];
    if (mediaItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [config?.hero_media_items]);

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';

      const currentItems = config?.hero_media_items || [];
      const newItems = [...currentItems, { url: file_url, type: fileType }];

      await updateConfig.mutateAsync({
        id: config?.id,
        data: {
          hero_media_items: newItems
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar mídia:', error);
      alert('Erro ao fazer upload da mídia');
    }
    setUploading(false);
  };

  const handleDeleteMedia = async (index) => {
    if (!confirm("Tem certeza que deseja remover esta mídia?")) return;

    try {
      const currentItems = config?.hero_media_items || [];
      const newItems = currentItems.filter((_, i) => i !== index);

      await updateConfig.mutateAsync({
        id: config?.id,
        data: {
          hero_media_items: newItems
        }
      });

      if (currentIndex >= newItems.length && newItems.length > 0) {
        setCurrentIndex(newItems.length - 1);
      }
    } catch (error) {
      console.error('Erro ao deletar mídia:', error);
      alert('Erro ao deletar mídia');
    }
  };

  const mediaItems = (config?.hero_media_items || []).filter((item) => item.visible !== false);
  const currentMedia = mediaItems[currentIndex];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-[#8B6F47] to-[#0A0A0A]">
          {currentMedia ?
          <>
              {currentMedia.type === 'video' ?
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full"
              style={{ objectFit: 'cover', objectPosition: 'center' }} /> :


            <img
              key={currentMedia.url}
              src={currentMedia.url}
              alt="Victor e Franco"
              className="w-full h-full"
              loading="eager"
              fetchpriority="high"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
              }} />

            }
            </> :

          <div className="w-full h-full" />
          }
        </div>
      </div>

      {/* Admin Controls */}
      {editMode &&
      <div className="absolute top-4 right-4 z-30 flex gap-2">
          <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#F4231E] hover:bg-[#e41914] text-white px-4 py-2 rounded-full shadow-lg font-semibold">

            <Upload className="w-4 h-4 mr-2" />
            Gerenciar Mídias
          </Button>
        </div>
      }

      {/* Indicadores de Carrossel */}
      {mediaItems.length > 1 && !editMode &&
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {mediaItems.map((_, index) =>
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={`w-3 h-3 rounded-full transition-all ${
          index === currentIndex ? 'bg-[#F4231E] w-8' : 'bg-white/50'}`
          } />

        )}
        </div>
      }

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-end text-center px-4 pb-20">
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center gap-2">
            {/* Título da Música */}
            <div className="w-full max-w-4xl px-4 mt-64 md:mt-36">
              <img
              src="/assets/media/246e34ef6_Gemini_Generated_Image_3kpjwe3kpjwe3kpj-removebg-preview.png"
              alt="Por Te Amar" className="mb-0 w-full h-auto object-contain"

              style={{
                maxHeight: '360px',
                filter: 'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.8))'
              }} />

            </div>

            <Button
            size="lg" className="bg-[#F4231E] text-white -mt-36 md:-mt-8 max-w-[75%] md:max-w-none px-8 py-3 text-lg font-semibold rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 hover:bg-[#e41914] shadow-2xl hover:scale-105 transition-all duration-300"

            onClick={() => setDvdVideoOpen(true)}>

              <Play className="w-5 h-5 mr-2" />
              Assista o clip da música nova
            </Button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-[#F4231E] rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-[#F4231E] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* DVD Video Player Dialog */}
      <Dialog open={dvdVideoOpen} onOpenChange={setDvdVideoOpen}>
        <DialogContent className="max-w-7xl bg-[#0A0A0A] border-[#8B6F47]/30 p-0">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/IuMX7J1gJkA?autoplay=1"
              title="Por te Amar - Victor & Franco"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg" />

          </div>
        </DialogContent>
      </Dialog>

      {/* Media Management Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Gerenciar Mídias do Hero
            </DialogTitle>
            <p className="text-[#D4C5B9] text-sm mt-2">
              Adicione múltiplas imagens ou vídeos. Eles serão alternados automaticamente a cada 4 segundos.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors">
                <Upload className="w-12 h-12 text-[#8B6F47] mb-2" />
                <span className="text-[#D4C5B9] text-sm">
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
                    if (file) handleFileUpload(file);
                  }}
                  disabled={uploading} />

              </label>
            </div>

            {mediaItems.length === 0 ?
            <div className="text-center py-8">
                <p className="text-[#D4C5B9]">
                  Nenhuma mídia adicionada. Adicione sua primeira imagem ou vídeo acima.
                </p>
              </div> :

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.map((item, index) =>
              <div
                key={index}
                className={`relative aspect-video rounded-lg overflow-hidden group border-2 ${
                index === currentIndex ? 'border-[#F4231E]' : 'border-[#8B6F47]/30'}`
                }>

                    {item.type === 'video' ?
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted /> :


                <img
                  src={item.url}
                  alt={`Mídia ${index + 1}`}
                  className="w-full h-full object-cover" />

                }
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMedia(index)}
                    className="bg-red-500/80 hover:bg-red-600 text-white">

                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    {index === currentIndex &&
                <div className="absolute top-2 right-2 bg-[#F4231E] text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Atual
                      </div>
                }
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {item.type === 'video' ? 'Vídeo' : 'Imagem'}
                    </div>
                  </div>
              )}
              </div>
            }
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setDialogOpen(false)}
              className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold">

              Concluído
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>);

}