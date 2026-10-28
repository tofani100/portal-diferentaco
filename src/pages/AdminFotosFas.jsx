import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Trash2, Image, Clock, CheckCircle, Eye, EyeOff } from "lucide-react";
import MediaSpecsBanner from "@/components/admin/MediaSpecsBanner";

export default function AdminFotosFas() {
  const queryClient = useQueryClient();
  const [filterPending, setFilterPending] = React.useState("all");
  const [filterApproved, setFilterApproved] = React.useState("all");

  const { data: pendingPhotos = [], isLoading: loadingPending } = useQuery({
    queryKey: ["fanPhotos", "pending"],
    queryFn: () => base44.entities.FanPhoto.filter({ approved: false }),
  });

  const { data: approvedPhotos = [], isLoading: loadingApproved } = useQuery({
    queryKey: ["fanPhotos", "approved"],
    queryFn: () => base44.entities.FanPhoto.filter({ approved: true }),
  });

  const updatePhoto = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FanPhoto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fanPhotos"] });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: (id) => base44.entities.FanPhoto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fanPhotos"] });
    },
  });

  const handleApprove = (id) => {
    updatePhoto.mutate({ id, data: { approved: true } });
  };

  const handleReject = (id) => {
    if (confirm("Tem certeza que deseja rejeitar e excluir esta foto?")) {
      deletePhoto.mutate(id);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      deletePhoto.mutate(id);
    }
  };

  const handleToggleVisibility = (id, currentVisible) => {
    const isCurrentlyVisible = currentVisible !== false;
    const newVisible = !isCurrentlyVisible;
    console.log('Toggling fan photo', id, 'isCurrentlyVisible:', isCurrentlyVisible, 'newVisible:', newVisible);
    updatePhoto.mutate({ id, data: { visible: newVisible } });
  };

  const getFilteredPhotos = (photos, filter) => {
    if (filter === "visible") return photos.filter(p => p.visible !== false);
    if (filter === "hidden") return photos.filter(p => p.visible === false);
    return photos;
  };

  const PhotoCard = ({ photo, isPending }) => (
    <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 overflow-hidden relative">
      {!isPending && photo.visible === false && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
          Oculta
        </div>
      )}
      <div className="aspect-square relative">
        <img
          src={photo.photo_url}
          alt={`Foto de ${photo.fan_name}`}
          className={`w-full h-full object-cover ${!isPending && photo.visible === false ? 'opacity-50' : ''}`}
        />
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold">{photo.fan_name}</h3>
        <p className="text-[#D4C5B9] text-sm">{photo.fan_city}</p>
        
        <div className="flex gap-2 mt-4">
          {isPending ? (
            <>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(photo.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => handleReject(photo.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleToggleVisibility(photo.id, photo.visible)}
              >
                {photo.visible === false ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                {photo.visible === false ? 'Exibir' : 'Ocultar'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(photo.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Gerenciar Fotos de Fãs
          </h1>
          <p className="text-[#D4C5B9]">
            Aprove ou rejeite as fotos enviadas pelos fãs
          </p>
        </div>

        <MediaSpecsBanner type="fan" />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-[#1A1A1A] border border-[#8B6F47]/30 mb-8">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#F4231E] data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pendentes ({pendingPhotos.length})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovadas ({approvedPhotos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loadingPending ? (
              <div className="text-center text-[#D4C5B9] py-12">
                Carregando fotos pendentes...
              </div>
            ) : pendingPhotos.length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <Image className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9] text-lg">
                  Nenhuma foto pendente de aprovação
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pendingPhotos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} isPending={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            <div className="flex gap-2 mb-4">
              <Button
                variant={filterApproved === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterApproved("all")}
                className={filterApproved === "all" ? "bg-green-600" : ""}
              >
                Todas ({approvedPhotos.length})
              </Button>
              <Button
                variant={filterApproved === "visible" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterApproved("visible")}
                className={filterApproved === "visible" ? "bg-green-600" : ""}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visíveis ({getFilteredPhotos(approvedPhotos, "visible").length})
              </Button>
              <Button
                variant={filterApproved === "hidden" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterApproved("hidden")}
                className={filterApproved === "hidden" ? "bg-yellow-600" : ""}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Ocultas ({getFilteredPhotos(approvedPhotos, "hidden").length})
              </Button>
            </div>

            {loadingApproved ? (
              <div className="text-center text-[#D4C5B9] py-12">
                Carregando fotos aprovadas...
              </div>
            ) : approvedPhotos.length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <Image className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9] text-lg">
                  Nenhuma foto aprovada ainda
                </p>
              </Card>
            ) : getFilteredPhotos(approvedPhotos, filterApproved).length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <Image className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9] text-lg">
                  Nenhuma foto {filterApproved === "visible" ? "visível" : "oculta"}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getFilteredPhotos(approvedPhotos, filterApproved).map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} isPending={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}