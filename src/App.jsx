import { useLayoutEffect, useState } from "react";
import { useHashRoute } from "./hooks/useHashRoute";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhySection from "./components/WhySection";
import Calculator from "./components/Calculator";
import Education from "./components/Education";
import EbookView from "./components/EbookView";
import PorsiTable from "./components/PorsiTable";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

// Setiap menu navbar adalah halaman sendiri:
//   #/            Beranda     → Hero, Kenapa Penting, CTA
//   #/edukasi     Edukasi     → 9 kartu materi + Tabel Porsi
//   #/kalkulator  Kalkulator  → Kalkulator Waris
//   #/faq         FAQ         → FAQ + CTA
//   #/baca        E-Book      → dibuka di tab baru dari halaman Edukasi
function Page({ route }) {
  switch (route) {
    case "edukasi":
      return (
        <>
          <Education />
          <PorsiTable />
        </>
      );
    case "kalkulator":
      return <Calculator />;
    case "faq":
      return (
        <>
          <FAQ />
          <CTA />
        </>
      );
    case "baca":
      return (
        <section className="edu-section" id="ebook">
          <div className="container">
            <EbookView />
          </div>
        </section>
      );
    default:
      return (
        <>
          <Hero />
          <WhySection />
          <CTA />
        </>
      );
  }
}

export default function App() {
  const route = useHashRoute();

  // Dark mode: disimpan di localStorage ("waris-theme") dan dipasang sebagai atribut data-theme di <html>
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("waris-theme") === "dark");

  // useLayoutEffect: tema dipasang sebelum browser menggambar halaman (tanpa kilatan tema terang)
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Pindah halaman → mulai dari atas
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("waris-theme", next ? "dark" : "light");
  };

  return (
    <>
      <Navbar route={route} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <Page route={route} />
      <Footer />
    </>
  );
}
