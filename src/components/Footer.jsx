// Footer — logo, deskripsi, sosial media, link, kontak, disclaimer
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#beranda" className="nav-logo footer-logo">
              <span className="logo-text">Waris<span className="logo-accent">Modern</span></span>
            </a>
            <p>Platform edukasi dan kalkulator waris digital Indonesia. Membantu keluarga memahami dan menyelesaikan pembagian harta peninggalan secara adil, transparan, dan sesuai hukum.</p>
            <div className="footer-socials">
              <a href="https://Facebook.com/Aldy Akbar" className="social-btn" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="https://instagram.com/aldyyy_akbar" className="social-btn" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-btn" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Navigasi</h4>
            <ul>
              <li><a href="#beranda">Beranda</a></li>
              <li><a href="#edukasi">Materi Edukasi</a></li>
              <li><a href="#kalkulator">Kalkulator Waris</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Topik Edukasi</h4>
            <ul>
              <li><a href="#">Hukum Waris Islam</a></li>
              <li><a href="#">Hukum Waris Perdata</a></li>
              <li><a href="#">Ahli Waris & Porsi</a></li>
              <li><a href="#">Wasiat & Hibah</a></li>
              <li><a href="#">Sengketa Waris</a></li>
              <li><a href="#">Aset Digital & Kripto</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kontak &amp; Info</h4>
            <ul>
              <li>aldy.akbar492@gmail.com.</li>
              <li>085211787041</li>
              <li>bandung, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-disclaimer">
            <strong>Disclaimer Hukum:</strong> Informasi dan hasil kalkulator pada platform ini bersifat edukatif dan tidak merupakan nasihat hukum resmi. Untuk kepastian hukum, konsultasikan dengan notaris, pengacara, atau hakim Pengadilan
            Agama yang berwenang.
          </div>
          <div className="footer-copy">© 2025 WarisModern. Seluruh konten disusun berdasarkan Kompilasi Hukum Islam (KHI) dan KUHPerdata Indonesia.</div>
        </div>
      </div>
    </footer>
  );
}
