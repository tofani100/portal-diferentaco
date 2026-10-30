import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Instagram, Youtube, Lock, Unlock, LogIn, X, AlertCircle, CheckCircle, KeyRound, Loader2, Users, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { APP_VERSION } from "@/version";

export default function Layout({ children }) {
  const location = useLocation();
  const envInfo = base44.env;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    const handleAuthChange = (e) => {
      setUser(e.detail?.user || null);
    };

    const handleOpenLogin = () => {
      setLoginError("");
      setForgotMode(false);
      setResetSent(false);
      setResetError("");
      setShowPassword(false);
      setLoginDialogOpen(true);
    };

    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('openLoginModal', handleOpenLogin);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('openLoginModal', handleOpenLogin);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigation = [
    { name: "Início", href: createPageUrl("Home") },
    { name: "Agenda", href: createPageUrl("Agenda") },
    { name: "Música", href: createPageUrl("Musica") },
    { name: "Vídeos", href: createPageUrl("Videos") },
    { name: "Galeria", href: createPageUrl("Galeria") },
    { name: "Por Onde Passamos", href: createPageUrl("Mapa") },
    { name: "Depoimentos", href: createPageUrl("Depoimentos") },
    { name: "Parceiros", href: createPageUrl("Parceiros") },
    { name: "Contato", href: createPageUrl("Contato") },
  ];

  const isSuper = base44.auth.isSuperAdmin(user);
  const isAdmin = user?.role === 'admin';

  const adminPages = [
    { name: "Gerenciar Agenda", href: createPageUrl("AdminAgenda") },
    { name: "Gerenciar Músicas", href: createPageUrl("AdminMusica") },
    { name: "Gerenciar Vídeos", href: createPageUrl("AdminVideos") },
    { name: "Gerenciar Fotos", href: createPageUrl("AdminFotos") },
    { name: "Gerenciar Fotos de Fãs", href: createPageUrl("AdminFotosFas") },
    { name: "Gerenciar Por Onde Passamos", href: createPageUrl("AdminMapa") },
    { name: "Gerenciar Depoimentos", href: createPageUrl("AdminDepoimentos") },
    { name: "Gerenciar Parceiros", href: createPageUrl("AdminParceiros") },
    { name: "Gerenciar Contatos", href: createPageUrl("AdminContatos") },
    { name: "Gerenciar Enquetes", href: createPageUrl("AdminEnquetes") },
    { name: "Ver Inscritos Newsletter", href: createPageUrl("AdminNewsletter") },
    ...(isSuper ? [
      { name: "Gerenciar Administradores", href: createPageUrl("AdminUsuarios") },
      { name: "Gestão de Auditoria", href: createPageUrl("AdminAuditoria") }
    ] : [])
  ];

  const isActive = (href) => location.pathname === href;

  const toggleEditMode = () => {
    if (!isAdmin) {
      alert("Você precisa fazer login como administrador para ativar o modo de edição.");
      setLoginDialogOpen(true);
      return;
    }
    setEditMode(!editMode);
    window.dispatchEvent(new CustomEvent('editModeChanged', { detail: { editMode: !editMode } }));
  };

  const handleAdminPageClick = (href, e) => {
    if (!isAdmin) {
      e.preventDefault();
      alert("Você precisa fazer login como administrador para acessar esta página.");
      setLoginDialogOpen(true);
      return;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await base44.auth.login(loginEmail, loginPassword);
      setLoginDialogOpen(false);
      setLoginPassword("");
    } catch (err) {
      setLoginError(err?.message || "Erro ao realizar login. Verifique suas credenciais.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      await base44.auth.resetPassword(loginEmail);
      setResetSent(true);
    } catch (err) {
      setResetError(err?.message || "Erro ao enviar e-mail de recuperação.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-edit-mode={editMode}>
      <style>{`
        :root {
          --primary: #8B6F47;
          --secondary: #F4231E;
          --background: #0A0A0A;
          --surface: #1A1A1A;
          --text: #F5F5F5;
          --text-muted: #D4C5B9;
        }
        
        * {
          scroll-behavior: smooth;
        }
        
        body {
          background: var(--background);
          color: var(--text);
        }

        @media (max-width: 1023px) {
          .mobile-menu-btn {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            width: 28px;
            height: 28px;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
          }
        }

        @media (min-width: 1024px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }

        .mobile-menu-btn span {
          width: 28px;
          height: 3px;
          background: #F4231E;
          border-radius: 10px;
          transition: all 0.3s linear;
          position: relative;
          transform-origin: 1px;
        }

        .mobile-menu-btn.open span:first-child {
          transform: rotate(45deg);
        }

        .mobile-menu-btn.open span:nth-child(2) {
          opacity: 0;
          transform: translateX(20px);
        }

        .mobile-menu-btn.open span:nth-child(3) {
          transform: rotate(-45deg);
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-[#8B6F47]/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo + Dev Indicator */}
            <div className="flex items-center gap-3">
              {envInfo?.showBadge && (
                <div
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase shadow-md border border-amber-600 select-none cursor-default"
                  title={`Ambiente de Desenvolvimento - Versão ${APP_VERSION}`}
                >
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse inline-block"></span>
                  <span>MODO DEV {APP_VERSION}</span>
                </div>
              )}

              <Link to={createPageUrl("Home")} className="flex items-center gap-3">
                <img 
                  src="/assets/media/4e533a150_logo_Victor_e_Franco-removebg-preview.png"
                  alt="Victor & Franco"
                  className="h-12 md:h-14 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors relative group ${
                    isActive(item.href)
                      ? "text-[#F4231E]"
                      : "text-[#D4C5B9] hover:text-white"
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F4231E] transition-all group-hover:w-full ${isActive(item.href) ? 'w-full' : ''}`} />
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://www.instagram.com/victorefranco/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4231E] hover:text-[#e41914] transition-colors"
              >
                <Instagram className="w-10 h-10" />
              </a>
              <a
                href="https://www.youtube.com/@VictoreFrancooficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4231E] hover:text-[#e41914] transition-colors"
              >
                <Youtube className="w-10 h-10" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`hidden max-lg:flex mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-lg border-t border-[#8B6F47]/20">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-base font-medium py-2 ${
                    isActive(item.href)
                      ? "text-[#F4231E]"
                      : "text-[#D4C5B9]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center gap-6 pt-4 border-t border-[#8B6F47]/20">
                <a
                  href="https://www.instagram.com/victorefranco/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F4231E]"
                >
                  <Instagram className="w-10 h-10" />
                </a>
                <a
                  href="https://www.youtube.com/@VictoreFrancooficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F4231E]"
                >
                  <Youtube className="w-10 h-10" />
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-[#8B6F47]/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <h3 className="text-xl font-bold text-[#F4231E] mb-4">Victor & Franco</h3>
              <p className="text-[#D4C5B9] text-sm leading-relaxed mb-6">
                Dupla sertaneja autêntica, moderna e conectada. 
                Levando o show "Diferentaço" para todo o Brasil.
              </p>
              
              {/* Admin Menu - Exclusivo para Desktop */}
              <div className="mt-6 hidden md:block">
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className="text-[#8B6F47]/70 hover:text-[#E9A55C] transition-colors text-xs flex items-center gap-1.5 py-1 px-2.5 rounded border border-[#8B6F47]/20 hover:border-[#8B6F47]/50 hover:bg-[#8B6F47]/10 cursor-pointer"
                  title="Área Administrativa (Desktop)"
                >
                  <Lock className="w-3.5 h-3.5 text-[#E9A55C]" />
                  <span>Área Administrativa</span>
                </button>
                
                {adminMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 bg-[#1A1A1A] border border-[#8B6F47]/30 rounded-lg shadow-xl p-4 min-w-[240px] z-50">
                    <div className="flex items-center justify-between text-xs text-[#D4C5B9] mb-3 font-semibold pb-2 border-b border-[#8B6F47]/20">
                      <span>Painel Administrativo</span>
                      <button
                        onClick={() => setAdminMenuOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Fechar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {!user ? (
                      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                        ⚠️ Você não está logado
                      </div>
                    ) : !isAdmin ? (
                      <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                        ⚠️ Usuário sem permissão de admin
                      </div>
                    ) : (
                      <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                        ✓ Logado como {user.email} {isSuper ? '(Super Admin)' : '(Administrador)'}
                      </div>
                    )}
                    
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          setAdminMenuOpen(false);
                          setLoginDialogOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm bg-[#F4231E] hover:bg-[#e41914] text-white rounded transition-colors font-semibold cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        Fazer Login como Admin
                      </button>
                    )}
                    
                    {isAdmin && (
                      <>
                        <button
                          onClick={toggleEditMode}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#D4C5B9] hover:text-white hover:bg-[#8B6F47]/20 rounded transition-colors mb-2 cursor-pointer"
                        >
                          {editMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          {editMode ? 'Desativar Edição' : 'Ativar Modo Edição'}
                        </button>
                        
                        <div className="border-t border-[#8B6F47]/30 my-2"></div>
                        
                        {adminPages.map((page) => (
                          <Link
                            key={page.name}
                            to={page.href}
                            onClick={() => setAdminMenuOpen(false)}
                            className="block px-3 py-2 text-sm text-[#D4C5B9] hover:text-white hover:bg-[#8B6F47]/20 rounded transition-colors"
                          >
                            {page.name}
                          </Link>
                        ))}
                        
                        <div className="border-t border-[#8B6F47]/30 my-2"></div>
                        
                        <button
                          onClick={() => base44.auth.logout()}
                          className="w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors text-left cursor-pointer"
                        >
                          Sair
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Navegação</h4>
              <ul className="space-y-2">
                {navigation.slice(0, 5).map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-[#D4C5B9] hover:text-[#F4231E] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to={createPageUrl("Newsletter")}
                    className="text-sm text-[#F4231E] hover:text-[#e41914] transition-colors font-semibold"
                  >
                    📧 Receber Novidades
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contato</h4>
              <p className="text-[#D4C5B9] text-sm mb-2">
                Contratações:<br />
                <a
                  href="https://wa.me/5516981294040?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20contrata%C3%A7%C3%A3o%20do%20show%20de%20Victor%20%26%20Franco."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F4231E] hover:underline hover:text-[#25D366] transition-colors"
                  title="Chamar no WhatsApp"
                >
                  +55 16 98129-4040
                </a><br />
                <span className="text-xs">(falar com Luis Sicchieri)</span>
              </p>
              <p className="text-xs mb-4">
                <a href="mailto:comercial@victorefranco.com.br" className="text-[#E9A55C] hover:underline">
                  comercial@victorefranco.com.br
                </a>
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/victorefranco/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4C5B9] hover:text-[#F4231E] transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.youtube.com/@VictoreFrancooficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4C5B9] hover:text-[#F4231E] transition-colors"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#8B6F47]/20 text-center text-sm text-[#D4C5B9]">
            <p>
              &copy; {new Date().getFullYear()} Victor & Franco. Todos os direitos reservados.
              {" • "}
              Desenvolvido por{" "}
              <a
                href="https://playcomunique.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E9A55C] hover:text-[#f0b876] transition-colors font-semibold"
              >
                playcomunique.com.br
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Admin Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={(open) => {
        setLoginDialogOpen(open);
        if (!open) {
          setLoginError("");
          setResetError("");
          setForgotMode(false);
          setResetSent(false);
        }
      }}>
        <DialogContent className="bg-[#1A1A1A] border-[#8B6F47]/30 text-white max-w-md">
          {!forgotMode ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-6 h-6 text-[#F4231E]" />
                  Login do Administrador
                </DialogTitle>
                <p className="text-xs text-[#D4C5B9] mt-1">
                  Acesso exclusivo para administradores autorizados.
                </p>
              </DialogHeader>

              {loginError && (
                <div className="bg-[#F4231E]/15 border border-[#F4231E]/40 text-[#ff8b88] text-sm p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="admin-email">E-mail</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    disabled={loginLoading}
                    className="mt-2 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="admin-password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setLoginError("");
                        setResetError("");
                        setResetSent(false);
                      }}
                      className="text-xs text-[#E9A55C] hover:text-[#f0b876] transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                      disabled={loginLoading}
                      className="bg-[#0A0A0A] border-[#8B6F47]/30 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4C5B9] hover:text-[#E9A55C] transition-colors focus:outline-none p-1"
                      tabIndex={-1}
                      title={showPassword ? "Ocultar senha" : "Ver senha digitada"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#8B6F47]/40 text-[#D4C5B9] hover:bg-[#2A2A2A] hover:text-white"
                    onClick={() => setLoginDialogOpen(false)}
                    disabled={loginLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold flex items-center justify-center gap-2"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-6 h-6 text-[#E9A55C]" />
                  Recuperar Senha
                </DialogTitle>
                <p className="text-xs text-[#D4C5B9] mt-1">
                  Digite seu e-mail cadastrado. O Google enviará um link direto para você definir sua nova senha.
                </p>
              </DialogHeader>

              {resetError && (
                <div className="bg-[#F4231E]/15 border border-[#F4231E]/40 text-[#ff8b88] text-sm p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSent ? (
                <div className="space-y-4 pt-2">
                  <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-semibold text-emerald-200">E-mail de recuperação enviado com sucesso!</p>
                      <p className="text-xs leading-relaxed text-emerald-300/90">
                        O Google enviou as instruções de redefinição para <strong>{loginEmail}</strong>.
                      </p>
                      <div className="p-2.5 bg-black/50 rounded-lg border border-emerald-500/20 text-xs text-[#D4C5B9] space-y-1">
                        <p className="font-semibold text-amber-300 flex items-center gap-1">
                          ⚠️ Atenção importante (Hotmail, Outlook e Gmail):
                        </p>
                        <p className="leading-relaxed">
                          • Em contas <strong>Hotmail / Outlook</strong>, verifique <strong>obrigatoriamente</strong> a pasta de <strong>Lixo Eletrônico</strong> ou a aba <strong>Outros</strong>.
                        </p>
                        <p className="leading-relaxed">
                          • O remetente oficial é <code>noreply@playcomunique-site.firebaseapp.com</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setForgotMode(false);
                      setResetSent(false);
                    }}
                    className="w-full bg-[#E9A55C] hover:bg-[#d8954d] text-black font-semibold"
                  >
                    Voltar para o Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="reset-email">E-mail cadastrado</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                      disabled={resetLoading}
                      className="mt-2 bg-[#0A0A0A] border-[#8B6F47]/30 text-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-[#8B6F47]/40 text-[#D4C5B9] hover:bg-[#2A2A2A] hover:text-white"
                      onClick={() => setForgotMode(false)}
                      disabled={resetLoading}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#E9A55C] hover:bg-[#d8954d] text-black font-semibold flex items-center justify-center gap-2"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Link"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
