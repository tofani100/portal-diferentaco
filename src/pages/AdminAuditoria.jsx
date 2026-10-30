import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  Activity,
  Trash2,
  Edit3,
  PlusCircle,
  Clock,
  Monitor,
  MapPin,
  User as UserIcon,
  Search,
  Download,
  RefreshCw,
  FileText,
  Lock,
  Globe,
  Database
} from "lucide-react";

export default function AdminAuditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL"); // ALL | DELETE | UPDATE | CREATE
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (base44.auth.isSuperAdmin(user)) {
        const auditRecords = await base44.entities.AuditLog.list("-timestamp", 300);
        setLogs(auditRecords || []);
      }
    } catch (err) {
      console.error("Erro ao carregar auditoria:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to real-time database hydration updates
    const handleSync = () => {
      loadData();
    };
    window.addEventListener("databaseHydrated", handleSync);
    return () => window.removeEventListener("databaseHydrated", handleSync);
  }, []);

  const isSuper = base44.auth.isSuperAdmin(currentUser);

  if (!loading && !isSuper) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/40 p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#F4231E]/10 border border-[#F4231E]/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#F4231E]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Exclusivo Super Admin</h2>
          <p className="text-[#D4C5B9] text-sm mb-6 leading-relaxed">
            A Gestão de Auditoria é restrita exclusivamente aos administradores principais
            (<strong>Marcos Tofani</strong> e <strong>Walter Tofani</strong>).
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-[#E9A55C] hover:bg-[#d8954d] text-black font-semibold w-full"
          >
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Action filter
    if (actionFilter !== "ALL" && log.action !== actionFilter) return false;

    // Entity filter
    if (entityFilter !== "ALL" && log.entity_name !== entityFilter) return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchText = (log.action_text || "").toLowerCase();
      const matchUser = (log.user_email || "").toLowerCase() + " " + (log.user_name || "").toLowerCase();
      const matchLocation = (log.location || "").toLowerCase();
      const matchDevice = (log.device || "").toLowerCase();
      const matchIp = (log.ip || "").toLowerCase();
      return (
        matchText.includes(q) ||
        matchUser.includes(q) ||
        matchLocation.includes(q) ||
        matchDevice.includes(q) ||
        matchIp.includes(q)
      );
    }

    return true;
  });

  // Calculate Metrics
  const totalLogs = logs.length;
  const totalDeletes = logs.filter((l) => l.action === "DELETE").length;
  const totalUpdates = logs.filter((l) => l.action === "UPDATE").length;
  const totalCreates = logs.filter((l) => l.action === "CREATE").length;

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Data/Hora",
      "Ação",
      "Entidade",
      "Descrição da Ação",
      "Usuário",
      "E-mail",
      "Dispositivo/Navegador",
      "Cidade/Região",
      "IP"
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id || ""}"`,
      `"${l.formatted_date || l.timestamp || ""}"`,
      `"${l.action_label || l.action || ""}"`,
      `"${l.entity_friendly || l.entity_name || ""}"`,
      `"${(l.action_text || "").replace(/"/g, '""')}"`,
      `"${l.user_name || ""}"`,
      `"${l.user_email || ""}"`,
      `"${l.device || ""}"`,
      `"${l.location || ""}"`,
      `"${l.ip || ""}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `auditoria_victorefranco_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-10 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#8B6F47]/20 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E9A55C]/10 border border-[#E9A55C]/30 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#E9A55C]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Gestão de Auditoria</h1>
            </div>
            <p className="text-sm text-[#D4C5B9] mt-1">
              Rastreamento em tempo real de quem fez cada alteração, exclusão e cadastro no portal com horário, dispositivo e cidade.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="border-[#8B6F47]/40 text-[#D4C5B9] hover:text-white hover:bg-[#2A2A2A] flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button
              onClick={handleExportCSV}
              size="sm"
              className="bg-[#E9A55C] hover:bg-[#d8954d] text-black font-semibold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#141414] border-[#8B6F47]/20 p-4">
            <div className="flex items-center justify-between text-xs text-[#D4C5B9]">
              <span>Total de Ações</span>
              <Activity className="w-4 h-4 text-[#E9A55C]" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{totalLogs}</div>
          </Card>

          <Card className="bg-[#141414] border-red-500/20 p-4">
            <div className="flex items-center justify-between text-xs text-red-300">
              <span>Exclusões</span>
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400 mt-2">{totalDeletes}</div>
          </Card>

          <Card className="bg-[#141414] border-amber-500/20 p-4">
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span>Edições</span>
              <Edit3 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2">{totalUpdates}</div>
          </Card>

          <Card className="bg-[#141414] border-emerald-500/20 p-4">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span>Criações</span>
              <PlusCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{totalCreates}</div>
          </Card>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#141414] border border-[#8B6F47]/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47]" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuário, ação, cidade..."
              className="pl-9 bg-[#0A0A0A] border-[#8B6F47]/30 text-white text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#0A0A0A] border border-[#8B6F47]/30 rounded-lg p-1 text-xs">
              <button
                type="button"
                onClick={() => setActionFilter("ALL")}
                className={`px-3 py-1 rounded transition-colors ${
                  actionFilter === "ALL" ? "bg-[#E9A55C] text-black font-semibold" : "text-[#D4C5B9] hover:text-white"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setActionFilter("DELETE")}
                className={`px-3 py-1 rounded transition-colors ${
                  actionFilter === "DELETE" ? "bg-[#F4231E] text-white font-semibold" : "text-[#D4C5B9] hover:text-white"
                }`}
              >
                Exclusões
              </button>
              <button
                type="button"
                onClick={() => setActionFilter("UPDATE")}
                className={`px-3 py-1 rounded transition-colors ${
                  actionFilter === "UPDATE" ? "bg-amber-600 text-white font-semibold" : "text-[#D4C5B9] hover:text-white"
                }`}
              >
                Edições
              </button>
              <button
                type="button"
                onClick={() => setActionFilter("CREATE")}
                className={`px-3 py-1 rounded transition-colors ${
                  actionFilter === "CREATE" ? "bg-emerald-600 text-white font-semibold" : "text-[#D4C5B9] hover:text-white"
                }`}
              >
                Criações
              </button>
            </div>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-[#E9A55C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="bg-[#141414] border-[#8B6F47]/20 p-12 text-center">
            <Database className="w-12 h-12 text-[#8B6F47] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-semibold text-white">Nenhum evento registrado</h3>
            <p className="text-xs text-[#D4C5B9] mt-1 max-w-md mx-auto">
              {logs.length === 0
                ? "Nenhuma ação de criação, edição ou exclusão foi realizada ainda no portal."
                : "Nenhum registro coincide com os filtros aplicados."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const isDelete = log.action === "DELETE";
              const isUpdate = log.action === "UPDATE";
              const isCreate = log.action === "CREATE";

              return (
                <Card
                  key={log.id}
                  className="bg-[#141414] border-[#8B6F47]/20 hover:border-[#8B6F47]/50 p-4 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Main Action Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                          isDelete
                            ? "bg-red-500/15 border-red-500/30 text-red-400"
                            : isUpdate
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        {isDelete ? (
                          <Trash2 className="w-4 h-4" />
                        ) : isUpdate ? (
                          <Edit3 className="w-4 h-4" />
                        ) : (
                          <PlusCircle className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm sm:text-base text-white">
                            {log.action_text || "Ação registrada"}
                          </span>
                          <Badge
                            className={`text-[10px] uppercase font-bold border ${
                              isDelete
                                ? "bg-red-500/20 text-red-300 border-red-500/40"
                                : isUpdate
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {log.action_label || log.action}
                          </Badge>
                        </div>

                        {/* Actor & Time */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#D4C5B9]">
                          <span className="flex items-center gap-1 font-medium text-white">
                            <UserIcon className="w-3.5 h-3.5 text-[#E9A55C]" />
                            {log.user_name} ({log.user_email})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#8B6F47]" />
                            {log.formatted_date || log.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Badges (Device, City, IP) */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#8B6F47]/20 px-2.5 py-1 rounded-md text-[11px] text-[#D4C5B9]">
                        <Monitor className="w-3 h-3 text-[#E9A55C]" />
                        <span>{log.device || "Navegador Web"}</span>
                      </div>

                      <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#8B6F47]/20 px-2.5 py-1 rounded-md text-[11px] text-[#D4C5B9]">
                        <MapPin className="w-3 h-3 text-[#E9A55C]" />
                        <span>{log.location || "Brasil"}</span>
                      </div>

                      {log.ip && log.ip !== "..." && (
                        <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#8B6F47]/20 px-2.5 py-1 rounded-md text-[11px] text-[#D4C5B9]">
                          <Globe className="w-3 h-3 text-[#8B6F47]" />
                          <span>IP: {log.ip}</span>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-[#E9A55C] hover:text-[#f0b876] hover:bg-[#E9A55C]/10 h-7 px-2.5 ml-1"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detailed Modal */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="bg-[#141414] border-[#8B6F47]/30 text-white max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-[#E9A55C]" />
                Registro Completo de Auditoria
              </DialogTitle>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4 pt-2 text-xs sm:text-sm">
                <div className="bg-[#0A0A0A] border border-[#8B6F47]/20 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[#8B6F47] text-xs">Ação Realizada:</span>
                      <p className="font-semibold text-white">{selectedLog.action_text}</p>
                    </div>
                    <div>
                      <span className="text-[#8B6F47] text-xs">Tipo:</span>
                      <p className="font-semibold text-white">{selectedLog.action_label} ({selectedLog.entity_friendly})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#8B6F47]/15">
                    <div>
                      <span className="text-[#8B6F47] text-xs">Usuário Responsável:</span>
                      <p className="font-semibold text-white">{selectedLog.user_name}</p>
                      <p className="text-xs text-[#D4C5B9]">{selectedLog.user_email}</p>
                    </div>
                    <div>
                      <span className="text-[#8B6F47] text-xs">Horário (Brasília):</span>
                      <p className="font-semibold text-white">{selectedLog.formatted_date || selectedLog.timestamp}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#8B6F47]/15">
                    <div>
                      <span className="text-[#8B6F47] text-xs">Dispositivo e Navegador:</span>
                      <p className="text-white">{selectedLog.device}</p>
                      {selectedLog.screen && <p className="text-xs text-[#D4C5B9]">Resolução: {selectedLog.screen}</p>}
                    </div>
                    <div>
                      <span className="text-[#8B6F47] text-xs">Localização Estimada / IP:</span>
                      <p className="text-white">{selectedLog.location}</p>
                      <p className="text-xs text-[#D4C5B9]">IP: {selectedLog.ip}</p>
                    </div>
                  </div>
                </div>

                {/* Snapshots */}
                {selectedLog.previous_snapshot && (
                  <div>
                    <span className="text-xs font-semibold text-red-400 block mb-1">
                      Dados Anteriores à Alteração/Exclusão:
                    </span>
                    <pre className="bg-[#0A0A0A] border border-red-500/20 rounded-lg p-3 text-[11px] font-mono text-[#D4C5B9] overflow-x-auto max-h-48">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedLog.previous_snapshot), null, 2);
                        } catch (e) {
                          return selectedLog.previous_snapshot;
                        }
                      })()}
                    </pre>
                  </div>
                )}

                {selectedLog.new_snapshot && (
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 block mb-1">
                      Dados Finais Gravados:
                    </span>
                    <pre className="bg-[#0A0A0A] border border-emerald-500/20 rounded-lg p-3 text-[11px] font-mono text-[#D4C5B9] overflow-x-auto max-h-48">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedLog.new_snapshot), null, 2);
                        } catch (e) {
                          return selectedLog.new_snapshot;
                        }
                      })()}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setSelectedLog(null)}
                    className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
