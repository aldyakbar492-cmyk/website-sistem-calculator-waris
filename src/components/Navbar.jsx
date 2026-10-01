import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { route: "", href: "#/", label: "Beranda" },
  { route: "edukasi", href: "#/edukasi", label: "Edukasi" },
  { route: "kalkulator", href: "#/kalkulator", label: "Kalkulator" },
  { route: "faq", href: "#/faq", label: "FAQ" },
];

export default function Navbar({ route, darkMode, onToggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Halaman e-book (#/baca) termasuk bagian Edukasi
  const activeRoute = route === "baca" ? "edukasi" : route;

  // Navbar mengecil saat halaman di-scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const themeIcon = darkMode ? "☀️" : "🌙";

  return (
    <nav className={"navbar" + (scrolled ? " scrolled" : "")} id="navbar">
      <div className="nav-container">
        <a href="#/" className="nav-logo">
          <span className="logo-text">
            Waris<span className="logo-accent">Modern</span>
          </span>
        </a>

        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={"nav-link" + (activeRoute === item.route ? " active" : "")}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <button id="darkModeBtn" className="dark-mode-btn" aria-label="Toggle dark mode" title="Mode Gelap" onClick={onToggleDarkMode}>
            {themeIcon}
          </button>
          <a href="#/kalkulator" className="btn-nav-cta nav-cta-desktop">
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
        <a href="#/" className="mobile-link" onClick={closeMenu}>
          Beranda
        </a>
        <a href="#/edukasi" className="mobile-link" onClick={closeMenu}>
          Edukasi
        </a>
        <a href="#/kalkulator" className="mobile-link" onClick={closeMenu}>
          Kalkulator
        </a>
        <a href="#/faq" className="mobile-link" onClick={closeMenu}>
          FAQ
        </a>
        <a href="#/kalkulator" className="btn-nav-cta mobile-cta" onClick={closeMenu}>
          Mulai Hitung
        </a>
      </div>
    </nav>
  );
}
