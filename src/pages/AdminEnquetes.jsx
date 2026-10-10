import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3, Plus, Trash2, X, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminEnquetes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    options: [
      { id: "opt1", text: "", votes: 0 },
      { id: "opt2", text: "", votes: 0 }
    ],
    category: "general",
    active: true,
    featured: false,
    end_date: ""
  });

  const queryClient = useQueryClient();

  const { data: polls = [] } = useQuery({
    queryKey: ["allPolls"],
    queryFn: () => base44.entities.Poll.list("-created_date"),
  });

  const createPoll = useMutation({
    mutationFn: (data) => base44.entities.Poll.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPolls"] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      closeDialog();
    },
  });

  const updatePoll = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Poll.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPolls"] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });

  const deletePoll = useMutation({
    mutationFn: (id) => base44.entities.Poll.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPolls"] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setFormData({
      question: "",
      options: [
        { id: "opt1", text: "", votes: 0 },
        { id: "opt2", text: "", votes: 0 }
      ],
      category: "general",
      active: true,
      featured: false,
      end_date: ""
    });
  };

  const addOption = () => {
    const newId = `opt${formData.options.length + 1}`;
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "", votes: 0 }]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      alert("A enquete precisa ter pelo menos 2 opções");
      return;
    }
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, text) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? { ...opt, text } : opt)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.options.some(opt => !opt.text.trim())) {
      alert("Preencha todas as opções");
      return;
    }
    createPoll.mutate(formData);
  };

  const handleToggleActive = (id, currentValue) => {
    updatePoll.mutate({ id, data: { active: !currentValue } });
  };

  const handleToggleFeatured = (id, currentValue) => {
    updatePoll.mutate({ id, data: { featured: !currentValue } });
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir esta enquete?")) {
      deletePoll.mutate(id);
    }
  };

  const categoryLabels = {
    music: "Música",
    shows: "Shows",
    general: "Geral"
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Gerenciar Enquetes
            </h1>
            <p className="text-[#D4C5B9] text-lg">
              Crie e gerencie enquetes de engajamento
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Enquete
          </Button>
        </div>

        {polls.length === 0 ? (
          <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-[#8B6F47] mx-auto mb-4" />
            <p className="text-[#D4C5B9] text-lg mb-4">
              Nenhuma enquete criada ainda
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#F4231E] hover:bg-[#e41914] text-white"
            >
              Criar Primeira Enquete
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
              return (
                <Card key={poll.id} className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-[#F4231E]" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{poll.question}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-[#8B6F47]/30 text-[#D4C5B9] px-2 py-1 rounded">
                            {categoryLabels[poll.category]}
                          </span>
                          {poll.active && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              Ativa
                            </span>
                          )}
                          {poll.featured && (
                            <span className="text-xs bg-[#F4231E]/20 text-[#F4231E] px-2 py-1 rounded flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(poll.id, poll.active)}
                      >
                        {poll.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFeatured(poll.id, poll.featured)}
                      >
                        <Award className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDelete(poll.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                      return (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#D4C5B9]">{option.text}</span>
                            <span className="text-white font-semibold">
                              {option.votes || 0} votos ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-[#0A0A0A] rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#8B6F47] to-[#F4231E] h-full rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[#D4C5B9] text-sm mt-4">
                    Total: {totalVotes} votos
                  </p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Poll Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Criar Nova Enquete
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="question" className="text-white">
                  Pergunta da Enquete *
                </Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  required
                  placeholder="Ex: Qual música você quer ouvir no próximo show?"
                  className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Opções *</Label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={option.id} className="flex gap-2">
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Opção
                </Button>
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Categoria *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">Música</SelectItem>
                    <SelectItem value="shows">Shows</SelectItem>
                    <SelectItem value="general">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 bg-[#8B6F47]/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active" className="text-white cursor-pointer">
                    Enquete ativa (pode ser votada)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured" className="text-white cursor-pointer">
                    Exibir na home (destaque)
                  </Label>
                </div>
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
                  disabled={createPoll.isPending}
                >
                  Criar Enquete
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}