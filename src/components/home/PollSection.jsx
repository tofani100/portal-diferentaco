import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Check } from "lucide-react";

export default function PollSection() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voterHash, setVoterHash] = useState("");
  const queryClient = useQueryClient();

  const { data: polls = [] } = useQuery({
    queryKey: ["polls"],
    queryFn: () => base44.entities.Poll.filter({ active: true, featured: true }, "-created_date"),
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ["userVotes", voterHash],
    queryFn: () => base44.entities.PollVote.filter({ voter_identifier: voterHash }),
    enabled: !!voterHash,
  });

  useEffect(() => {
    let hash = localStorage.getItem("voter_hash");
    if (!hash) {
      hash = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("voter_hash", hash);
    }
    setVoterHash(hash);
  }, []);

  useEffect(() => {
    if (activePoll && userVotes.length > 0) {
      const voted = userVotes.some(vote => vote.poll_id === activePoll.id);
      setHasVoted(voted);
    }
  }, [userVotes]);

  const submitVote = useMutation({
    mutationFn: async ({ pollId, optionId }) => {
      await base44.entities.PollVote.create({
        poll_id: pollId,
        option_id: optionId,
        voter_identifier: voterHash
      });

      const poll = await base44.entities.Poll.filter({ id: pollId });
      const currentPoll = poll[0];
      const updatedOptions = currentPoll.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );
      
      await base44.entities.Poll.update(pollId, {
        options: updatedOptions
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ["userVotes"] });
      setHasVoted(true);
    },
  });

  const handleVote = () => {
    if (!selectedOption || !activePoll) return;
    submitVote.mutate({ 
      pollId: activePoll.id, 
      optionId: selectedOption 
    });
  };

  const activePoll = polls[0];

  if (!activePoll) return null;

  const totalVotes = activePoll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-[#8B6F47]/10 to-[#F4231E]/10">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-[#F4231E]" />
            <h2 className="text-2xl font-bold text-white">Enquete</h2>
          </div>

          <h3 className="text-xl text-white mb-6">
            {activePoll.question}
          </h3>

          {!hasVoted ? (
            <div className="space-y-4">
              {activePoll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedOption === option.id
                      ? "border-[#F4231E] bg-[#F4231E]/10"
                      : "border-[#8B6F47]/30 hover:border-[#8B6F47] bg-[#0A0A0A]"
                  }`}
                >
                  <span className="text-white font-medium">{option.text}</span>
                </button>
              ))}

              <Button
                onClick={handleVote}
                disabled={!selectedOption || submitVote.isPending}
                className="w-full bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold py-6"
              >
                {submitVote.isPending ? "Votando..." : "Votar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#8B6F47]/20 border border-[#8B6F47] rounded-lg p-4 flex items-center gap-3 mb-6">
                <Check className="w-6 h-6 text-[#F4231E]" />
                <p className="text-white">Obrigado por votar!</p>
              </div>

              {activePoll.options.map((option) => {
                const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">{option.text}</span>
                      <span className="text-[#D4C5B9]">{percentage}%</span>
                    </div>
                    <div className="w-full bg-[#0A0A0A] rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#8B6F47] to-[#F4231E] h-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <p className="text-[#D4C5B9] text-sm text-center mt-6">
                Total de votos: {totalVotes}
              </p>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}