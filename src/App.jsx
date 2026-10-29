import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import AdminGuard from "./components/admin/AdminGuard";

// Public pages
import Home from "./pages/Home";
import Agenda from "./pages/Agenda";
import Musica from "./pages/Musica";
import Videos from "./pages/Videos";
import Galeria from "./pages/Galeria";
import Mapa from "./pages/Mapa";
import Parceiros from "./pages/Parceiros";
import Contato from "./pages/Contato";
import Depoimentos from "./pages/Depoimentos";
import Newsletter from "./pages/Newsletter";

// Admin pages
import AdminEventos from "./pages/AdminEventos";
import AdminMusica from "./pages/AdminMusica";
import AdminVideos from "./pages/AdminVideos";
import AdminFotos from "./pages/AdminFotos";
import AdminFotosFas from "./pages/AdminFotosFas";
import AdminMapa from "./pages/AdminMapa";
import AdminDepoimentos from "./pages/AdminDepoimentos";
import AdminParceiros from "./pages/AdminParceiros";
import AdminContatos from "./pages/AdminContatos";
import AdminEnquetes from "./pages/AdminEnquetes";
import AdminNewsletter from "./pages/AdminNewsletter";
import AdminUsuarios from "./pages/AdminUsuarios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 5, // 5 seconds
    },
  },
});

if (typeof window !== "undefined") {
  window.addEventListener("databaseHydrated", () => {
    queryClient.invalidateQueries();
  });
}

export default function App() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;

      if (isMobile && window.location.pathname !== "/" && window.location.pathname !== "") {
        const navEntries = window.performance?.getEntriesByType?.("navigation");
        const isReload =
          (navEntries && navEntries[0] && navEntries[0].type === "reload") ||
          window.performance?.navigation?.type === 1;

        if (isReload) {
          window.location.replace("/");
        }
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/Agenda" element={<Agenda />} />
            <Route path="/musica" element={<Musica />} />
            <Route path="/Musica" element={<Musica />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/Videos" element={<Videos />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/Galeria" element={<Galeria />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/Mapa" element={<Mapa />} />
            <Route path="/parceiros" element={<Parceiros />} />
            <Route path="/Parceiros" element={<Parceiros />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/Contato" element={<Contato />} />
            <Route path="/depoimentos" element={<Depoimentos />} />
            <Route path="/Depoimentos" element={<Depoimentos />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/Newsletter" element={<Newsletter />} />

            {/* Admin Routes (Protegidas por AdminGuard) */}
            <Route path="/admin/agenda" element={<AdminGuard><AdminEventos /></AdminGuard>} />
            <Route path="/AdminAgenda" element={<AdminGuard><AdminEventos /></AdminGuard>} />
            <Route path="/admin/eventos" element={<AdminGuard><AdminEventos /></AdminGuard>} />
            <Route path="/AdminEventos" element={<AdminGuard><AdminEventos /></AdminGuard>} />

            <Route path="/admin/musicas" element={<AdminGuard><AdminMusica /></AdminGuard>} />
            <Route path="/admin/musica" element={<AdminGuard><AdminMusica /></AdminGuard>} />
            <Route path="/AdminMusica" element={<AdminGuard><AdminMusica /></AdminGuard>} />

            <Route path="/admin/videos" element={<AdminGuard><AdminVideos /></AdminGuard>} />
            <Route path="/AdminVideos" element={<AdminGuard><AdminVideos /></AdminGuard>} />

            <Route path="/admin/fotos" element={<AdminGuard><AdminFotos /></AdminGuard>} />
            <Route path="/AdminFotos" element={<AdminGuard><AdminFotos /></AdminGuard>} />
            <Route path="/admin/fotos-fas" element={<AdminGuard><AdminFotosFas /></AdminGuard>} />
            <Route path="/AdminFotosFas" element={<AdminGuard><AdminFotosFas /></AdminGuard>} />

            <Route path="/admin/por-onde-passamos" element={<AdminGuard><AdminMapa /></AdminGuard>} />
            <Route path="/admin/mapa" element={<AdminGuard><AdminMapa /></AdminGuard>} />
            <Route path="/AdminMapa" element={<AdminGuard><AdminMapa /></AdminGuard>} />

            <Route path="/admin/depoimentos" element={<AdminGuard><AdminDepoimentos /></AdminGuard>} />
            <Route path="/AdminDepoimentos" element={<AdminGuard><AdminDepoimentos /></AdminGuard>} />

            <Route path="/admin/parceiros" element={<AdminGuard><AdminParceiros /></AdminGuard>} />
            <Route path="/AdminParceiros" element={<AdminGuard><AdminParceiros /></AdminGuard>} />

            <Route path="/admin/contatos" element={<AdminGuard><AdminContatos /></AdminGuard>} />
            <Route path="/AdminContatos" element={<AdminGuard><AdminContatos /></AdminGuard>} />

            <Route path="/admin/enquetes" element={<AdminGuard><AdminEnquetes /></AdminGuard>} />
            <Route path="/AdminEnquetes" element={<AdminGuard><AdminEnquetes /></AdminGuard>} />

            <Route path="/admin/newsletter" element={<AdminGuard><AdminNewsletter /></AdminGuard>} />
            <Route path="/AdminNewsletter" element={<AdminGuard><AdminNewsletter /></AdminGuard>} />

            <Route path="/admin/usuarios" element={<AdminGuard><AdminUsuarios /></AdminGuard>} />
            <Route path="/AdminUsuarios" element={<AdminGuard><AdminUsuarios /></AdminGuard>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
