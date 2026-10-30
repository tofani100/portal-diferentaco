import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PAGE_ROUTE_MAP = {
  Home: "/",
  Agenda: "/agenda",
  Musica: "/musica",
  Videos: "/videos",
  Galeria: "/galeria",
  Mapa: "/mapa",
  Parceiros: "/parceiros",
  Contato: "/contato",
  Depoimentos: "/depoimentos",
  Newsletter: "/newsletter",
  AdminAgenda: "/admin/agenda",
  AdminEventos: "/admin/agenda",
  AdminMusica: "/admin/musicas",
  AdminVideos: "/admin/videos",
  AdminFotos: "/admin/fotos",
  AdminFotosFas: "/admin/fotos-fas",
  AdminMapa: "/admin/por-onde-passamos",
  AdminDepoimentos: "/admin/depoimentos",
  AdminParceiros: "/admin/parceiros",
  AdminContatos: "/admin/contatos",
  AdminEnquetes: "/admin/enquetes",
  AdminNewsletter: "/admin/newsletter",
  AdminUsuarios: "/admin/usuarios",
  AdminAuditoria: "/admin/auditoria",
};

export function createPageUrl(pageName) {
  if (PAGE_ROUTE_MAP[pageName]) {
    return PAGE_ROUTE_MAP[pageName];
  }
  return `/${pageName}`;
}
