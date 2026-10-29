
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send, Check } from "lucide-react";

export default function Contato() {
  const [formData, setFormData] = useState({
    contractor_name: "",
    email: "",
    phone: "",
    event_city: "",
    event_state: "",
    event_date: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const submitContact = useMutation({
    mutationFn: (data) => base44.entities.ContactRequest.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setFormData({
        contractor_name: "",
        email: "",
        phone: "",
        event_city: "",
        event_state: "",
        event_date: "",
        message: ""
      });
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitContact.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Contrate Victor & Franco
          </h1>
          <p className="text-[#D4C5B9] text-lg">
            Leve o show "Diferentaço" para sua cidade
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Informações de Contato
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#8B6F47]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#F4231E]" />
                  </div>
                  <div>
                    <p className="text-[#D4C5B9] text-sm mb-1">Contratações</p>
                    <a
                      href="https://wa.me/5516981294040?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20contrata%C3%A7%C3%A3o%20do%20show%20de%20Victor%20%26%20Franco."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-[#25D366] transition-colors"
                      title="Chamar no WhatsApp"
                    >
                      +55 16 98129-4040
                    </a>
                    <p className="text-[#D4C5B9] text-xs mt-1">
                      (falar com Luis Sicchieri)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#8B6F47]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#F4231E]" />
                  </div>
                  <div>
                    <p className="text-[#D4C5B9] text-sm mb-1">E-mail</p>
                    <a
                      href="mailto:comercial@victorefranco.com.br"
                      className="text-white font-semibold hover:text-[#F4231E] transition-colors"
                    >
                      comercial@victorefranco.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#8B6F47]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#F4231E]" />
                  </div>
                  <div>
                    <p className="text-[#D4C5B9] text-sm mb-1">Base</p>
                    <p className="text-white font-semibold">
                      São Simão - SP
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#8B6F47] to-[#F4231E] border-none p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Por que contratar?
              </h3>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Repertório autêntico e diferenciado</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Show completo do DVD "Diferentaço"</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Dupla jovem e conectada com o público</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Estrutura profissional e qualidade garantida</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Solicite um Orçamento
              </h2>

              {submitted ? (
                <div className="bg-[#8B6F47]/20 border border-[#8B6F47] rounded-lg p-6 text-center">
                  <Check className="w-16 h-16 text-[#F4231E] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-[#D4C5B9]">
                    Entraremos em contato em breve para conversar sobre seu evento.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contractor_name" className="text-white">
                        Nome do Contratante *
                      </Label>
                      <Input
                        id="contractor_name"
                        value={formData.contractor_name}
                        onChange={(e) => handleChange("contractor_name", e.target.value)}
                        required
                        className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-white">
                        Telefone/WhatsApp *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event_date" className="text-white">
                        Data Pretendida
                      </Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => handleChange("event_date", e.target.value)}
                        className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="event_city" className="text-white">
                        Cidade do Evento *
                      </Label>
                      <Input
                        id="event_city"
                        value={formData.event_city}
                        onChange={(e) => handleChange("event_city", e.target.value)}
                        required
                        className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event_state" className="text-white">
                        Estado *
                      </Label>
                      <Input
                        id="event_state"
                        value={formData.event_state}
                        onChange={(e) => handleChange("event_state", e.target.value)}
                        required
                        placeholder="Ex: SP"
                        className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white">
                      Mensagem Adicional
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      rows={4}
                      placeholder="Conte-nos mais sobre seu evento..."
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold text-lg py-6"
                    disabled={submitContact.isPending}
                  >
                    {submitContact.isPending ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Solicitação
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
