import { useEffect, useState } from "react";

// Router sederhana berbasis hash (#/edukasi, #/kalkulator, ...).
// Tanpa library tambahan, dan aman di hosting statis (GitHub Pages / Vercel)
// karena tidak butuh pengaturan rewrite di server.
export const ROUTES = ["", "edukasi", "kalkulator", "faq", "baca"];

function readRoute() {
  const name = window.location.hash.replace(/^#\/?/, "");
  return ROUTES.includes(name) ? name : ""; // hash tidak dikenal → Beranda
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

// Buka halaman di tab baru (dipakai tombol E-Book)
export function openInNewTab(route) {
  const base = window.location.href.split("#")[0];
  window.open(`${base}#/${route}`, "_blank", "noopener");
}
