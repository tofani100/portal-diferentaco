import React, { useState } from "react";
import { Monitor, Smartphone, Info, Sparkles, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

export default function MediaSpecsBanner({ type = "hero" }) {
  const [expanded, setExpanded] = useState(true);

  const specs = {
    hero: {
      title: "Especificações Recomendadas para a Capa (Hero da Home)",
      subtitle: "A capa é o primeiro impacto visual do site no computador e no celular.",
      desktop: {
        dimensions: "1920 × 1080 px",
        ratio: "16:9 (Widescreen)",
        format: "WebP, JPG ou MP4 (vídeo sem áudio)",
        maxWeight: "Até 2.5 MB (foto) / Até 20 MB (vídeo)",
        tip: "Mantenha a dupla centralizada nos 60% centrais da imagem (zona segura).",
      },
      mobile: {
        dimensions: "1080 × 1920 px",
        ratio: "9:16 (Vertical)",
        format: "WebP ou JPG (ou MP4 vertical)",
        maxWeight: "Até 1.5 MB",
        tip: "Evita cortes nas laterais dos rostos no celular. Deixe livre 100px no topo (menu) e 250px na base (título/botão).",
      },
      warning:
        "⚠️ Importante: Fotos 16:9 comuns cortam até 65% das laterais quando abertas na vertical do celular. Se possível, envie uma versão horizontal para Computador e uma vertical para Celular.",
    },
    press: {
      title: "Especificações para Fotos de Imprensa & Divulgação",
      subtitle: "Fotos utilizadas por contratantes, prefeituras, produtores de eventos e mídia.",
      desktop: {
        dimensions: "2400 × 1600 px ou superior",
        ratio: "3:2 ou 16:9 (Horizontal) ou 2:3 (Vertical)",
        format: "JPG em alta qualidade ou PNG",
        maxWeight: "Até 8 MB",
        tip: "Fotos com iluminação de estúdio e fundos limpos facilitam o recorte para cartazes e matérias.",
      },
      mobile: null,
      warning: "Contratantes utilizam estas fotos em outdoors e telões de LED dos eventos. Priorize alta nitidez.",
    },
    road: {
      title: "Especificações para Fotos 'Na Estrada' (Bastidores & Palco)",
      subtitle: "Mostra a energia dos shows, camarim, viagens e conexão com os fãs.",
      desktop: {
        dimensions: "1200 × 1200 px ou 1080 × 1350 px",
        ratio: "1:1 (Quadrada) ou 4:5 (Vertical Instagram)",
        format: "WebP ou JPG otimizado",
        maxWeight: "Até 2 MB",
        tip: "Fotos dinâmicas, com luz de palco ou momentos descontraídos da dupla.",
      },
      mobile: null,
      warning: null,
    },
    video: {
      title: "Especificações para Vídeos & Clipes",
      subtitle: "Clipes oficiais, faixas do DVD 'Diferentaço' e vídeos promocionais.",
      desktop: {
        dimensions: "1920 × 1080 px (Full HD) ou 3840 × 2160 px (4K)",
        ratio: "16:9 (Horizontal)",
        format: "Link do YouTube ou MP4 (H.264 / AAC)",
        maxWeight: "Sem limite para links do YouTube / Até 30 MB para MP4 direto",
        tip: "Para o YouTube, você pode colar a URL completa (ex: https://www.youtube.com/watch?v=...) ou o código curto.",
      },
      mobile: null,
      warning: "Vídeos do YouTube carregam mais rápido e aumentam o número de visualizações do canal oficial da dupla.",
    },
    fan: {
      title: "Diretrizes de Moderação para Fotos dos Fãs",
      subtitle: "Espaço dedicado para os fãs que marcaram a dupla com a hashtag #Diferentaço.",
      desktop: {
        dimensions: "Mínimo 600 × 600 px",
        ratio: "Qualquer formato (1:1, 4:5 ou 9:16)",
        format: "JPG, PNG ou WebP",
        maxWeight: "Até 5 MB",
        tip: "Apenas fotos com os artistas ou em eventos da dupla devem ser aprovadas para exibição pública.",
      },
      mobile: null,
      warning: "Ao aprovar uma foto, ela fica visível imediatamente na galeria pública de fãs.",
    },
    event: {
      title: "Dicas para Cadastro de Eventos da Agenda",
      subtitle: "Mantenha a agenda sempre atualizada para fãs e contratantes.",
      desktop: {
        dimensions: "Campos obrigatórios: Data/Hora, Cidade, Estado e Nome do Local",
        ratio: "Status: Próximo ou Realizado",
        format: "Link de ingressos: URL completa (ex: https://bilheteria.com/show)",
        maxWeight: null,
        tip: "O próximo show mais próximo de acontecer é exibido em destaque automático na página inicial.",
      },
      mobile: null,
      warning: "Shows com datas que já passaram são arquivados automaticamente na aba 'Shows Realizados'.",
    },
  };

  const item = specs[type] || specs.hero;

  return (
    <div className="bg-[#141414] border border-[#8B6F47]/40 rounded-xl p-4 md:p-5 mb-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F4231E]/10 via-[#8B6F47]/10 to-transparent pointer-events-none rounded-tr-xl" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B6F47] to-[#F4231E] text-white shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base md:text-lg flex items-center gap-2">
              {item.title}
            </h3>
            <p className="text-[#D4C5B9] text-xs md:text-sm">{item.subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          className="text-[#D4C5B9] hover:text-white p-1 rounded-md transition-colors"
          title={expanded ? "Recolher especificações" : "Expandir especificações"}
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#8B6F47]/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Desktop Spec Card */}
            {item.desktop && (
              <div className="bg-[#1A1A1A] border border-[#8B6F47]/30 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Monitor className="w-4 h-4" />
                  <span>{item.mobile ? "Computador / Desktop (Horizontal)" : "Padrão de Exibição"}</span>
                </div>
                <div className="text-xs space-y-1 text-[#F5F5F5]">
                  <p>
                    <strong className="text-[#D4C5B9]">Dimensões:</strong> {item.desktop.dimensions}
                  </p>
                  <p>
                    <strong className="text-[#D4C5B9]">Proporção:</strong> {item.desktop.ratio}
                  </p>
                  <p>
                    <strong className="text-[#D4C5B9]">Formatos:</strong> {item.desktop.format}
                  </p>
                  {item.desktop.maxWeight && (
                    <p>
                      <strong className="text-[#D4C5B9]">Peso Máximo:</strong> {item.desktop.maxWeight}
                    </p>
                  )}
                  <p className="text-amber-200/90 italic pt-1 border-t border-white/5">
                    💡 {item.desktop.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Spec Card */}
            {item.mobile ? (
              <div className="bg-[#1A1A1A] border border-[#F4231E]/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-[#F4231E] font-bold text-xs uppercase tracking-wider">
                  <Smartphone className="w-4 h-4" />
                  <span>Celular / Mobile (Vertical Dedicada)</span>
                </div>
                <div className="text-xs space-y-1 text-[#F5F5F5]">
                  <p>
                    <strong className="text-[#D4C5B9]">Dimensões:</strong> {item.mobile.dimensions}
                  </p>
                  <p>
                    <strong className="text-[#D4C5B9]">Proporção:</strong> {item.mobile.ratio}
                  </p>
                  <p>
                    <strong className="text-[#D4C5B9]">Formatos:</strong> {item.mobile.format}
                  </p>
                  {item.mobile.maxWeight && (
                    <p>
                      <strong className="text-[#D4C5B9]">Peso Máximo:</strong> {item.mobile.maxWeight}
                    </p>
                  )}
                  <p className="text-red-200/90 italic pt-1 border-t border-white/5">
                    📱 {item.mobile.tip}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#8B6F47]/20 rounded-lg p-3.5 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enquadramento Automático</span>
                </div>
                <p className="text-[#D4C5B9] text-xs leading-relaxed">
                  Esta seção possui grid adaptativo. As fotos são organizadas automaticamente em cartões proporcionais tanto no computador quanto no celular.
                </p>
              </div>
            )}
          </div>

          {/* Warning / Tips Footer */}
          {item.warning && (
            <div className="bg-amber-950/30 border border-amber-600/30 rounded-lg p-2.5 text-xs text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{item.warning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
