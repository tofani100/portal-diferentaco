import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload, Camera, Music, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Galeria() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [fanFormOpen, setFanFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fanData, setFanData] = useState({
    fan_name: "",
    fan_city: "",
    photo_url: ""
  });

  const queryClient = useQueryClient();

  const { data: pressPhotos = [], isLoading: loadingPress } = useQuery({
    queryKey: ["photos", "press"],
    queryFn: () => base44.entities.Photo.filter({ album: "press" }, "-created_date"),
  });

  const { data: roadPhotos = [], isLoading: loadingRoad } = useQuery({
    queryKey: ["photos", "on_the_road"],
    queryFn: () => base44.entities.Photo.filter({ album: "on_the_road" }, "-created_date"),
  });

  const { data: fanPhotos = [], isLoading: loadingFan } = useQuery({
    queryKey: ["fanPhotos"],
    queryFn: () => base44.entities.FanPhoto.filter({ approved: true }, "-created_date"),
  });

  const submitFanPhoto = useMutation({
    mutationFn: (data) => base44.entities.FanPhoto.create(data),
    onSuccess: () => {
      setFanFormOpen(false);
      setFanData({ fan_name: "", fan_city: "", photo_url: "" });
      alert("Foto enviada com sucesso! Aguarde a aprovação.");
      queryClient.invalidateQueries(["fanPhotos"]); // Invalidate cache to refetch fan photos
    },
    onError: (error) => {
      console.error("Error submitting fan photo:", error);
      alert("Erro ao enviar foto. Tente novamente.");
    }
  });

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFanData(prev => ({ ...prev, photo_url: file_url }));
    } catch (error) {
      alert("Erro ao fazer upload da foto");
    }
    setUploading(false);
  };

  const handleFanSubmit = (e) => {
    e.preventDefault();
    if (!fanData.photo_url) {
      alert("Por favor, envie uma foto");
      return;
    }
    if (!fanData.fan_name || !fanData.fan_city) {
      alert("Por favor, preencha seu nome e cidade.");
      return;
    }
    submitFanPhoto.mutate(fanData);
  };

  const PhotoGrid = ({ photos, loading }) => (
    loading ? (
      <div className="text-center text-[#D4C5B9] py-12">
        <Image className="w-12 h-12 animate-pulse mx-auto mb-4" />
        Carregando fotos...
      </div>
    ) : photos.length === 0 ? (
      <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
        <Camera className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
        <p className="text-[#D4C5B9]">Nenhuma foto disponível</p>
      </Card>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => setSelectedImage(photo.image_url || photo.photo_url)}
          >
            <img
              src={photo.image_url || photo.photo_url}
              alt={photo.caption || `${photo.fan_name} - ${photo.fan_city}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <div className="p-4 w-full">
                {photo.caption && (
                  <p className="text-white text-sm">{photo.caption}</p>
                )}
                {photo.fan_name && (
                  <p className="text-[#F4231E] text-sm font-semibold">
                    {photo.fan_name} - {photo.fan_city}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Galeria de Fotos
          </h1>
          <p className="text-[#D4C5B9] text-lg">
            Momentos especiais da nossa trajetória
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="press" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A] border border-[#8B6F47]/30 mb-8">
            <TabsTrigger
              value="press"
              className="data-[state=active]:bg-[#F4231E] data-[state=active]:text-white"
            >
              Imprensa
            </TabsTrigger>
            <TabsTrigger
              value="road"
              className="data-[state=active]:bg-[#F4231E] data-[state=active]:text-white"
            >
              Na Estrada
            </TabsTrigger>
            <TabsTrigger
              value="fans"
              className="data-[state=active]:bg-[#F4231E] data-[state=active]:text-white"
            >
              Mural de Fãs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="press">
            <PhotoGrid photos={pressPhotos} loading={loadingPress} />
          </TabsContent>

          <TabsContent value="road">
            <PhotoGrid photos={roadPhotos} loading={loadingRoad} />
          </TabsContent>

          <TabsContent value="fans">
            <div className="mb-6">
              <Button
                className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
                onClick={() => setFanFormOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Sua Foto
              </Button>
            </div>
            <PhotoGrid photos={fanPhotos} loading={loadingFan} />
          </TabsContent>
        </Tabs>

        {/* Image Viewer Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl bg-[#0A0A0A] border-[#8B6F47]/30 p-0">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Foto ampliada"
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Fan Photo Upload Dialog */}
        <Dialog open={fanFormOpen} onOpenChange={setFanFormOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Envie Sua Foto
              </DialogTitle>
              <p className="text-[#D4C5B9] text-sm">
                Compartilhe seus momentos com Victor & Franco
              </p>
            </DialogHeader>
            <form onSubmit={handleFanSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fan_name" className="text-white">Seu Nome</Label>
                <Input
                  id="fan_name"
                  value={fanData.fan_name}
                  onChange={(e) => setFanData(prev => ({ ...prev, fan_name: e.target.value }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="fan_city" className="text-white">Sua Cidade</Label>
                <Input
                  id="fan_city"
                  value={fanData.fan_city}
                  onChange={(e) => setFanData(prev => ({ ...prev, fan_city: e.target.value }))}
                  required
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="photo" className="text-white">Foto</Label>
                <div className="mt-2">
                  {fanData.photo_url ? (
                    <div className="relative">
                      <img
                        src={fanData.photo_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50"
                        onClick={() => setFanData(prev => ({ ...prev, photo_url: "" }))}
                      >
                        <X className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors">
                      <Upload className="w-12 h-12 text-[#8B6F47] mb-2" />
                      <span className="text-[#D4C5B9] text-sm">
                        {uploading ? "Enviando..." : "Clique para selecionar"}
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
                <p className="text-[#D4C5B9] text-xs mt-2">
                  Ao enviar, você concorda com o uso da imagem para divulgação
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
                disabled={submitFanPhoto.isPending || uploading}
              >
                {submitFanPhoto.isPending ? "Enviando..." : "Enviar Foto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}