import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Quote, Upload, Check, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Depoimentos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_role: "fan",
    author_city: "",
    author_photo: "",
    content: "",
    rating: 5,
    event_date: ""
  });

  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => base44.entities.Testimonial.filter({ approved: true }, "-created_date"),
  });

  const createTestimonial = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setFormData({
        author_name: "",
        author_role: "fan",
        author_city: "",
        author_photo: "",
        content: "",
        rating: 5,
        event_date: ""
      });
      setTimeout(() => {
        setSubmitted(false);
        setDialogOpen(false);
      }, 3000);
    },
  });

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, author_photo: file_url }));
    } catch (error) {
      alert("Erro ao fazer upload da foto");
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTestimonial.mutate(formData);
  };

  const roleLabels = {
    fan: "Fã",
    contractor: "Contratante",
    venue_owner: "Proprietário de Casa de Shows",
    partner: "Parceiro"
  };

  const featuredTestimonials = testimonials.filter(t => t.featured).slice(0, 3);
  const otherTestimonials = testimonials.filter(t => !t.featured);

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Depoimentos
          </h1>
          <p className="text-[#D4C5B9] text-lg mb-8">
            O que fãs e contratantes falam sobre Victor & Franco
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Deixar Meu Depoimento
          </Button>
        </div>

        {/* Featured Testimonials */}
        {featuredTestimonials.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Destaques
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="bg-gradient-to-br from-[#8B6F47] to-[#F4231E] border-none p-8 text-white"
                >
                  <Quote className="w-8 h-8 mb-4 opacity-50" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? "fill-white text-white" : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.author_photo ? (
                      <img
                        src={testimonial.author_photo}
                        alt={testimonial.author_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {testimonial.author_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.author_name}</p>
                      <p className="text-sm text-white/80">
                        {roleLabels[testimonial.author_role]}
                        {testimonial.author_city && ` - ${testimonial.author_city}`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Testimonials */}
        {otherTestimonials.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Todos os Depoimentos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {otherTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "fill-[#F4231E] text-[#F4231E]"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#8B6F47] opacity-30" />
                  </div>
                  <p className="text-[#D4C5B9] mb-4 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#8B6F47]/20">
                    {testimonial.author_photo ? (
                      <img
                        src={testimonial.author_photo}
                        alt={testimonial.author_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#8B6F47]/30 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {testimonial.author_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {testimonial.author_name}
                      </p>
                      <p className="text-[#D4C5B9] text-xs">
                        {roleLabels[testimonial.author_role]}
                        {testimonial.author_city && ` - ${testimonial.author_city}`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {testimonials.length === 0 && !isLoading && (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <Quote className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
            <p className="text-[#D4C5B9] text-lg">
              Seja o primeiro a deixar um depoimento!
            </p>
          </Card>
        )}

        {/* Testimonial Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Deixe Seu Depoimento
              </DialogTitle>
              <p className="text-[#D4C5B9] text-sm">
                Sua opinião é muito importante para nós!
              </p>
            </DialogHeader>

            {submitted ? (
              <div className="bg-[#8B6F47]/20 border border-[#8B6F47] rounded-lg p-8 text-center">
                <Check className="w-16 h-16 text-[#F4231E] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Depoimento Enviado!
                </h3>
                <p className="text-[#D4C5B9]">
                  Obrigado! Seu depoimento será analisado e publicado em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author_name" className="text-white">
                      Seu Nome *
                    </Label>
                    <Input
                      id="author_name"
                      value={formData.author_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                      required
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="author_city" className="text-white">
                      Sua Cidade
                    </Label>
                    <Input
                      id="author_city"
                      value={formData.author_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_city: e.target.value }))}
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="author_role" className="text-white">
                    Você é... *
                  </Label>
                  <Select
                    value={formData.author_role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, author_role: value }))}
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fan">Fã</SelectItem>
                      <SelectItem value="contractor">Contratante</SelectItem>
                      <SelectItem value="venue_owner">Proprietário de Casa de Shows</SelectItem>
                      <SelectItem value="partner">Parceiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating" className="text-white mb-2 block">
                    Avaliação *
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= formData.rating
                              ? "fill-[#F4231E] text-[#F4231E]"
                              : "text-gray-600 hover:text-[#F4231E]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="content" className="text-white">
                    Seu Depoimento *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                    rows={5}
                    placeholder="Conte sua experiência..."
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="author_photo" className="text-white">
                    Sua Foto (Opcional)
                  </Label>
                  <div className="mt-2">
                    {formData.author_photo ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={formData.author_photo}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, author_photo: "" }))}
                        >
                          Remover Foto
                        </Button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#8B6F47]/30 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-[#F4231E] transition-colors">
                        <Upload className="w-6 h-6 text-[#8B6F47] mr-2" />
                        <span className="text-[#D4C5B9] text-sm">
                          {uploading ? "Enviando..." : "Clique para adicionar foto"}
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

                <Button
                  type="submit"
                  className="w-full bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold py-6"
                  disabled={createTestimonial.isPending || uploading}
                >
                  {createTestimonial.isPending ? "Enviando..." : "Enviar Depoimento"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}