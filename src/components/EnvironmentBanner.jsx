import React, { useState } from "react";
import { getEnvironmentInfo, resetToProductionSnapshot, exportCurrentData } from "@/api/base44Client";
import { ExternalLink, RotateCcw, Download, Eye, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";

export default function EnvironmentBanner() {
  const envInfo = getEnvironmentInfo();
  const [collapsed, setCollapsed] = useState(false);

  // If running in production and badge is disabled, render nothing
  if (!envInfo.showBadge) {
    return null;
  }

  const handleResetData = () => {
    const confirmed = window.confirm(
      "Deseja resetar os dados de teste para a base original de Produção?\n\nIsso limpará quaisquer alterações feitas neste ambiente de testes e restaurará a versão original dos dados."
    );
    if (confirmed) {
      resetToProductionSnapshot();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = exportCurrentData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portal_diferentaco_dados_dev_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-3 left-3 z-[9999] bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1.5 rounded-full shadow-lg border border-amber-600 flex items-center gap-1.5 text-xs transition-all"
        title="Expandir barra do ambiente DEV"
      >
        <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
        <span>MODO DEV</span>
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <aside
      aria-label="Ambiente de Testes"
      className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black text-xs font-medium py-1.5 px-4 shadow-md sticky top-0 z-[9999] border-b border-amber-700 select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Badge & Info */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-black text-amber-400 px-2 py-0.5 rounded font-black tracking-wide text-[10px] uppercase shadow-sm">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            DEV / TESTES
          </span>
          <span className="hidden sm:inline text-black/90 font-semibold">
            Você está no ambiente de desenvolvimento. Alterações aqui não afetam a Produção.
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Ver Produção */}
          <a
            href={envInfo.prodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-black/10 hover:bg-black/20 text-black px-2.5 py-1 rounded transition-colors font-semibold"
            title="Abrir site oficial de Produção em nova aba para comparar"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden md:inline">Ver Produção</span>
          </a>

          {/* Exportar JSON */}
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1 bg-black/10 hover:bg-black/20 text-black px-2.5 py-1 rounded transition-colors font-semibold"
            title="Baixar backup dos dados atuais em formato JSON"
          >
            <Download className="w-3 h-3" />
            <span className="hidden md:inline">Exportar JSON</span>
          </button>

          {/* Resetar base */}
          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1 bg-black/15 hover:bg-red-600 hover:text-white text-black px-2.5 py-1 rounded transition-colors font-semibold"
            title="Resetar dados deste ambiente para a base original de Produção"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Resetar Dados</span>
          </button>

          {/* Minimizar */}
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-black/15 rounded text-black/80 transition-colors ml-1"
            title="Minimizar barra"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
