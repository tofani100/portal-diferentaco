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
  AdminEventos: "/admin/eventos",
  AdminVideos: "/admin/videos",
  AdminFotos: "/admin/fotos",
  AdminFotosFas: "/admin/fotos-fas",
  AdminDepoimentos: "/admin/depoimentos",
  AdminEnquetes: "/admin/enquetes",
  AdminNewsletter: "/admin/newsletter",
};

export function createPageUrl(pageName) {
  if (PAGE_ROUTE_MAP[pageName]) {
    return PAGE_ROUTE_MAP[pageName];
  }
  return `/${pageName}`;
}
