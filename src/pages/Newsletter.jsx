import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Mail, MessageCircle, Check, MapPin } from "lucide-react";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    city: "",
    state: "",
    notify_shows: true,
    notify_news: true
  });

  const subscribe = useMutation({
    mutationFn: (data) => base44.entities.NewsletterSubscriber.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        city: "",
        state: "",
        notify_shows: true,
        notify_news: true
      });
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email && !formData.whatsapp) {
      alert("Por favor, informe pelo menos um e-mail ou WhatsApp");
      return;
    }
    subscribe.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Bell className="w-16 h-16 text-[#F4231E] mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Fique Por Dentro
          </h1>
          <p className="text-[#D4C5B9] text-lg">
            Receba novidades e avisos de shows na sua região
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6 text-center">
            <MapPin className="w-12 h-12 text-[#F4231E] mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Shows na Sua Região</h3>
            <p className="text-[#D4C5B9] text-sm">
              Seja avisado quando Victor & Franco estiverem na sua cidade
            </p>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6 text-center">
            <Mail className="w-12 h-12 text-[#F4231E] mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Novidades em Primeira Mão</h3>
            <p className="text-[#D4C5B9] text-sm">
              Fique sabendo de novos clipes, músicas e lançamentos
            </p>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6 text-center">
            <MessageCircle className="w-12 h-12 text-[#F4231E] mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Via E-mail ou WhatsApp</h3>
            <p className="text-[#D4C5B9] text-sm">
              Escolha como prefere receber as novidades
            </p>
          </Card>
        </div>

        {/* Form */}
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-8">
          {submitted ? (
            <div className="bg-[#8B6F47]/20 border border-[#8B6F47] rounded-lg p-8 text-center">
              <Check className="w-16 h-16 text-[#F4231E] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Inscrição Realizada!
              </h3>
              <p className="text-[#D4C5B9]">
                Você está na lista! Em breve receberá nossas novidades.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Cadastre-se Agora
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white">
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-white">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="text-white">
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="(11) 98765-4321"
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="city" className="text-white">
                      Cidade *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-white">
                      Estado *
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      required
                      placeholder="SP"
                      maxLength={2}
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-[#8B6F47]/10 p-4 rounded-lg">
                  <p className="text-white font-semibold text-sm">
                    Quero receber:
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify_shows"
                      checked={formData.notify_shows}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notify_shows: checked }))}
                    />
                    <Label htmlFor="notify_shows" className="text-[#D4C5B9] cursor-pointer text-sm">
                      Avisos de shows na minha região
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify_news"
                      checked={formData.notify_news}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notify_news: checked }))}
                    />
                    <Label htmlFor="notify_news" className="text-[#D4C5B9] cursor-pointer text-sm">
                      Novidades gerais (novos clipes, músicas, etc)
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold text-lg py-6"
                  disabled={subscribe.isPending}
                >
                  {subscribe.isPending ? "Cadastrando..." : "Cadastrar Agora"}
                </Button>

                <p className="text-[#D4C5B9] text-xs text-center">
                  Ao se cadastrar você concorda em receber comunicações de Victor & Franco.
                  Você pode cancelar a qualquer momento.
                </p>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}