import { Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Lock,
  UserPlus,
  ShieldCheck,
  Trash2,
  Mail,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info
} from "lucide-react";

const DEFAULT_SUPERADMINS = [
  "tofani100@gmail.com",
  "wtofani@hotmail.com"
];

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setCurrentUser(me);
      const allUsers = await base44.entities.User.list();
      setUsers(allUsers || []);
    } catch (err) {
      console.error("Erro ao carregar administradores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const cleanEmail = (newEmail || "").trim().toLowerCase();
    const cleanName = (newName || "").trim();

    if (!cleanEmail) {
      setFeedback({ type: "error", message: "Informe um e-mail válido." });
      return;
    }

    const alreadyExists = users.some(
      (u) => (u.email || "").trim().toLowerCase() === cleanEmail
    );
    if (alreadyExists || DEFAULT_SUPERADMINS.includes(cleanEmail)) {
      setFeedback({
        type: "error",
        message: "Este e-mail já está autorizado como administrador."
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const created = await base44.entities.User.create({
        email: cleanEmail,
        full_name: cleanName || cleanEmail.split("@")[0],
        role: "admin",
        _app_role: "admin",
        is_verified: true,
        disabled: false
      });

      // Auto provision in Firebase Auth so password recovery works immediately
      await base44.auth.createAdminAccount(cleanEmail);

      setUsers([created, ...users]);
      setNewEmail("");
      setNewName("");
      setFeedback({
        type: "success",
        message: `Administrador "${cleanEmail}" autorizado com sucesso! Ele já pode usar a recuperação de senha no site para definir seu primeiro acesso.`
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Erro ao salvar novo administrador."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAdmin = async (user) => {
    const cleanEmail = (user.email || "").trim().toLowerCase();
    if (DEFAULT_SUPERADMINS.includes(cleanEmail)) {
      alert("Este administrador principal não pode ser removido.");
      return;
    }

    if (!window.confirm(`Tem certeza que deseja revogar o acesso do administrador ${user.email}?`)) {
      return;
    }

    try {
      await base44.entities.User.delete(user.id);
      setUsers(users.filter((u) => u.id !== user.id));
      setFeedback({
        type: "success",
        message: `Acesso do administrador ${user.email} revogado.`
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Erro ao revogar administrador."
      });
    }
  };

  const isSuper = base44.auth.isSuperAdmin(currentUser);

  if (!loading && !isSuper) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#8B6F47]/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-[#E9A55C]" />
              Gerenciar Administradores
            </h1>
            <p className="text-sm text-[#D4C5B9] mt-1">
              Controle quem possui acesso à área administrativa do Portal Victor & Franco com segurança.
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#1A1A1A] border border-[#8B6F47]/30 rounded-xl p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#E9A55C] flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#D4C5B9] space-y-1 leading-relaxed">
            <p className="font-semibold text-white">Como funciona o acesso autônomo dos usuários:</p>
            <p>
              1. Você autoriza o e-mail do seu colaborador nesta página.
            </p>
            <p>
              2. Quando ele entrar no portal pela primeira vez, ele clica em <strong>"Área Administrativa"</strong> &rarr; <strong>"Esqueceu a senha?"</strong>.
            </p>
            <p>
              3. O Google envia um link seguro diretamente para a caixa de entrada dele, onde ele cria a própria senha sem você precisar fazer nada manualmente.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 border ${
              feedback.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-[#F4231E]/15 border-[#F4231E]/40 text-[#ff8b88]"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{feedback.message}</span>
          </div>
        )}

        {/* Add Admin Form */}
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/30 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#E9A55C]" />
            Autorizar Novo Administrador
          </h2>
          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="admin-name" className="text-xs text-[#D4C5B9]">
                Nome do Colaborador
              </Label>
              <Input
                id="admin-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Carlos Produção"
                disabled={saving}
                className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
              />
            </div>
            <div>
              <Label htmlFor="new-admin-email" className="text-xs text-[#D4C5B9]">
                E-mail do Google / Gmail *
              </Label>
              <Input
                id="new-admin-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="colaborador@gmail.com"
                required
                disabled={saving}
                className="mt-1 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#E9A55C] hover:bg-[#d8954d] text-black font-semibold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Autorizando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Autorizar Acesso
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* List of Admins */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E9A55C]" />
            Administradores Autorizados
          </h2>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 border-2 border-[#E9A55C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {/* Combine users and default superadmins without duplicates */}
              {(() => {
                const map = new Map();
                DEFAULT_SUPERADMINS.forEach((email) => {
                  map.set(email.toLowerCase(), {
                    id: `super-${email}`,
                    email,
                    full_name: email === "tofani100@gmail.com" ? "Marcos Tofani" : email.split("@")[0],
                    isSuper: true
                  });
                });
                users.forEach((u) => {
                  const emailKey = (u.email || "").trim().toLowerCase();
                  if (emailKey) {
                    map.set(emailKey, {
                      ...u,
                      isSuper: DEFAULT_SUPERADMINS.includes(emailKey)
                    });
                  }
                });

                return Array.from(map.values()).map((adm) => (
                  <Card
                    key={adm.id || adm.email}
                    className="bg-[#141414] border-[#8B6F47]/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#8B6F47]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E9A55C]/10 border border-[#E9A55C]/30 flex items-center justify-center text-[#E9A55C] font-bold uppercase">
                        {(adm.full_name || adm.email || "A").charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {adm.full_name || adm.email.split("@")[0]}
                          </span>
                          {adm.isSuper ? (
                            <Badge className="bg-[#E9A55C]/20 border border-[#E9A55C]/40 text-[#E9A55C] text-[10px] uppercase font-bold">
                              Super Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-[#2A2A2A] border border-[#8B6F47]/30 text-[#D4C5B9] text-[10px] uppercase">
                              Administrador
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-[#D4C5B9] flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-[#8B6F47]" />
                          <span>{adm.email}</span>
                        </div>
                      </div>
                    </div>

                    {!adm.isSuper && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdmin(adm)}
                        className="text-[#ff8b88] hover:text-[#ff5c58] hover:bg-[#F4231E]/10 flex items-center gap-1 text-xs self-end sm:self-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revogar Acesso
                      </Button>
                    )}
                  </Card>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
