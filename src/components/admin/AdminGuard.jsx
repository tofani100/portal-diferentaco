import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      setIsAdmin(user?.role === "admin");
    } catch (e) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    const handleAuth = (e) => {
      setIsAdmin(e.detail?.user?.role === "admin");
    };
    window.addEventListener("authChanged", handleAuth);
    return () => window.removeEventListener("authChanged", handleAuth);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F4231E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <Card className="bg-[#1A1A1A] border-[#8B6F47]/40 p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#F4231E]/10 border border-[#F4231E]/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#F4231E]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Área Restrita</h2>
          <p className="text-[#D4C5B9] text-sm mb-6 leading-relaxed">
            Esta seção é restrita aos administradores da dupla Victor & Franco.
            Por favor, faça login com sua conta autorizada para gerenciar o portal.
          </p>
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent("openLoginModal"))}
            className="bg-[#F4231E] hover:bg-[#e41914] text-white font-semibold w-full shadow-lg"
          >
            Fazer Login como Administrador
          </Button>
        </Card>
      </div>
    );
  }

  return children;
}
