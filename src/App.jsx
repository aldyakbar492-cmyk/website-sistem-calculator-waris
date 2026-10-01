import { useLayoutEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhySection from "./components/WhySection";
import Calculator from "./components/Calculator";
import Education from "./components/Education";
import PorsiTable from "./components/PorsiTable";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function App() {
  // Dark mode: disimpan di localStorage ("waris-theme") dan dipasang sebagai atribut data-theme di <html>
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("waris-theme") === "dark");

  // useLayoutEffect: tema dipasang sebelum browser menggambar halaman (tanpa kilatan tema terang)
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("waris-theme", next ? "dark" : "light");
  };

  return (
    <>
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <Hero />
      <WhySection />
      <Calculator />
      <Education />
      <PorsiTable />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
