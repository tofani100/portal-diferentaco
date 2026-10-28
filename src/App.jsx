import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";

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
import AdminFotos from "./pages/AdminFotos";
import AdminFotosFas from "./pages/AdminFotosFas";
import AdminVideos from "./pages/AdminVideos";
import AdminDepoimentos from "./pages/AdminDepoimentos";
import AdminEnquetes from "./pages/AdminEnquetes";
import AdminNewsletter from "./pages/AdminNewsletter";

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

            {/* Admin Routes */}
            <Route path="/admin/agenda" element={<AdminEventos />} />
            <Route path="/AdminAgenda" element={<AdminEventos />} />
            <Route path="/admin/eventos" element={<AdminEventos />} />
            <Route path="/AdminEventos" element={<AdminEventos />} />
            <Route path="/admin/fotos" element={<AdminFotos />} />
            <Route path="/AdminFotos" element={<AdminFotos />} />
            <Route path="/admin/fotos-fas" element={<AdminFotosFas />} />
            <Route path="/AdminFotosFas" element={<AdminFotosFas />} />
            <Route path="/admin/videos" element={<AdminVideos />} />
            <Route path="/AdminVideos" element={<AdminVideos />} />
            <Route path="/admin/depoimentos" element={<AdminDepoimentos />} />
            <Route path="/AdminDepoimentos" element={<AdminDepoimentos />} />
            <Route path="/admin/enquetes" element={<AdminEnquetes />} />
            <Route path="/AdminEnquetes" element={<AdminEnquetes />} />
            <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            <Route path="/AdminNewsletter" element={<AdminNewsletter />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
