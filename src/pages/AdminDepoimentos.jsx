import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, Check, X, Trash2, Award } from "lucide-react";

export default function AdminDepoimentos() {
  const queryClient = useQueryClient();

  const { data: pendingTestimonials = [] } = useQuery({
    queryKey: ["pendingTestimonials"],
    queryFn: () => base44.entities.Testimonial.filter({ approved: false }, "-created_date"),
  });

  const { data: approvedTestimonials = [] } = useQuery({
    queryKey: ["approvedTestimonials"],
    queryFn: () => base44.entities.Testimonial.filter({ approved: true }, "-created_date"),
  });

  const updateTestimonial = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingTestimonials"] });
      queryClient.invalidateQueries({ queryKey: ["approvedTestimonials"] });
    },
  });

  const deleteTestimonial = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingTestimonials"] });
      queryClient.invalidateQueries({ queryKey: ["approvedTestimonials"] });
    },
  });

  const handleApprove = (id) => {
    updateTestimonial.mutate({ id, data: { approved: true } });
  };

  const handleReject = (id) => {
    if (confirm("Tem certeza que deseja rejeitar este depoimento?")) {
      deleteTestimonial.mutate(id);
    }
  };

  const handleToggleFeatured = (id, currentValue) => {
    updateTestimonial.mutate({ id, data: { featured: !currentValue } });
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este depoimento?")) {
      deleteTestimonial.mutate(id);
    }
  };

  const roleLabels = {
    fan: "Fã",
    contractor: "Contratante",
    venue_owner: "Proprietário de Casa",
    partner: "Parceiro"
  };

  const TestimonialCard = ({ testimonial, isPending = false }) => (
    <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < testimonial.rating ? "fill-[#F4231E] text-[#F4231E]" : "text-gray-600"
              }`}
            />
          ))}
        </div>
        {!isPending && testimonial.featured && (
          <Award className="w-5 h-5 text-[#F4231E]" />
        )}
      </div>

      <p className="text-[#D4C5B9] mb-4 leading-relaxed">
        "{testimonial.content}"
      </p>

      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#8B6F47]/20">
        {testimonial.author_photo ? (
          <img
            src={testimonial.author_photo}
            alt={testimonial.author_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#8B6F47]/30 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {testimonial.author_name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="text-white font-semibold">{testimonial.author_name}</p>
          <p className="text-[#D4C5B9] text-sm">
            {roleLabels[testimonial.author_role]}
            {testimonial.author_city && ` - ${testimonial.author_city}`}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {isPending ? (
          <>
            <Button
              onClick={() => handleApprove(testimonial.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
            <Button
              onClick={() => handleReject(testimonial.id)}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
              variant="outline"
              className="flex-1"
            >
              <Award className="w-4 h-4 mr-2" />
              {testimonial.featured ? "Remover Destaque" : "Destacar"}
            </Button>
            <Button
              onClick={() => handleDelete(testimonial.id)}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Gerenciar Depoimentos
          </h1>
          <p className="text-[#D4C5B9] text-lg">
            Aprove, destaque ou remova depoimentos
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1A1A1A] border border-[#8B6F47]/30 mb-8">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#F4231E] data-[state=active]:text-white"
            >
              Pendentes ({pendingTestimonials.length})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-[#8B6F47] data-[state=active]:text-white"
            >
              Aprovados ({approvedTestimonials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingTestimonials.length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <Check className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
                <p className="text-[#D4C5B9] text-lg">
                  Nenhum depoimento pendente
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pendingTestimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    isPending={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedTestimonials.length === 0 ? (
              <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
                <p className="text-[#D4C5B9] text-lg">
                  Nenhum depoimento aprovado ainda
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {approvedTestimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    isPending={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}