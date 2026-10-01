import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "#beranda", label: "Beranda" },
  { href: "#edukasi", label: "Edukasi" },
  { href: "#kalkulator", label: "Kalkulator" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar({ darkMode, onToggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#beranda");

  // Navbar mengecil saat halaman di-scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Link aktif mengikuti section yang sedang terlihat (threshold 0.4, sama seperti versi lama)
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let lastId = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) lastId = entry.target.id;
        });
        if (lastId) setActiveHref(`#${lastId}`);
      },
      { threshold: 0.4 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const themeIcon = darkMode ? "☀️" : "🌙";

  return (
    <nav className={"navbar" + (scrolled ? " scrolled" : "")} id="navbar">
      <div className="nav-container">
        <a href="#beranda" className="nav-logo">
          <span className="logo-text">
            Waris<span className="logo-accent">Modern</span>
          </span>
        </a>

        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={"nav-link" + (activeHref === item.href ? " active" : "")}>
                {item.label}
              </a>
            </li>
          ))}
          <li>
           
          </li>
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <button id="darkModeBtn" className="dark-mode-btn" aria-label="Toggle dark mode" title="Mode Gelap" onClick={onToggleDarkMode}>
            {themeIcon}
          </button>
          <a href="#kalkulator" className="btn-nav-cta nav-cta-desktop">
            Mulai Hitung
          </a>
        </div>

        <div className="nav-mobile-controls">
          <button id="darkModeBtnHamburger" className="dark-mode-btn dark-mode-btn-mobile" aria-label="Toggle dark mode" title="Mode Gelap" onClick={onToggleDarkMode}>
            {themeIcon}
          </button>
          <button className={"hamburger" + (isMenuOpen ? " open" : "")} id="hamburger" aria-label="Menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu — menutup otomatis saat salah satu link diklik */}
      <div className={"mobile-menu" + (isMenuOpen ? " open" : "")} id="mobileMenu" role="navigation">
        <a href="#beranda" className="mobile-link" onClick={closeMenu}>
          Beranda
        </a>
        <a href="#edukasi" className="mobile-link" onClick={closeMenu}>
          Edukasi
        </a>
        <a href="#kalkulator" className="mobile-link" onClick={closeMenu}>
          Kalkulator
        </a>
        <a href="#faq" className="mobile-link" onClick={closeMenu}>
          FAQ
        </a>
        <a href="https://saran-kritik.vercel.app" className="mobile-link" target="_blank" rel="noopener" onClick={closeMenu}>
          Kritik &amp; Saran
        </a>
        <a href="#kalkulator" className="btn-nav-cta mobile-cta" onClick={closeMenu}>
          Mulai Hitung
        </a>
      </div>
    </nav>
  );
}
