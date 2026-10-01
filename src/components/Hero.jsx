// Hero section — konten dipindahkan apa adanya dari index.html
export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="hero-bg-grid"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">Berdasarkan Kompilasi Hukum Islam (KHI) Indonesia</div>
          <h1 className="hero-title">
            Pahami Pembagian Waris<br />
            <span className="title-highlight">Lebih Mudah &</span><br />
            Transparan
          </h1>
          <p className="hero-subtitle">Pelajari edukasi waris modern dan hitung pembagian harta secara praktis, jelas, dan mudah dipahami — sesuai hukum Islam & perdata Indonesia.</p>
          <div className="hero-actions">
            <a href="#/edukasi" className="btn-primary">Belajar Dulu</a>
            <a href="#/kalkulator" className="btn-outline">Hitung Warisan →</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">3</span>
              <span className="stat-label">Sistem Hukum Waris</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">14</span>
              <span className="stat-label">Bab Materi Lengkap</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-label">Sesuai KHI & KUHPerdata</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card main-card">
            <div className="card-header-strip"></div>
            <div className="card-icon-row">
              <div className="card-icon-box gold">⚖</div>
              <div className="card-label">Surat Keterangan Waris</div>
            </div>
            <div className="card-divider"></div>
            <div className="card-row">
              <span className="card-key">Pewaris</span>
              <span className="card-val">Bpk. Arman</span>
            </div>
            <div className="card-row">
              <span className="card-key">Total Harta Bersih</span>
              <span className="card-val blue">Rp 540.000.000</span>
            </div>
            <div className="card-row">
              <span className="card-key">Ahli Waris</span>
              <span className="card-val">5 Orang</span>
            </div>
            <div className="card-divider"></div>
            <div className="mini-ahli-list">
              <div className="mini-ahli"><span className="mini-dot gold"></span>Istri — Rp 60 jt</div>
              <div className="mini-ahli"><span className="mini-dot blue"></span>Ayah — Rp 80 jt</div>
              <div className="mini-ahli"><span className="mini-dot" style={{ background: "var(--navy)" }}></span>Ibu — Rp 80 jt</div>
              <div className="mini-ahli"><span className="mini-dot" style={{ background: "var(--blue-light)" }}></span>2 Anak Pr. — Rp 320 jt</div>
            </div>
            <div className="card-badge">Sah Secara Hukum</div>
          </div>
          <div className="visual-card float-card float-1">
            <span className="float-icon">🏠</span>
            <div>
              <div className="float-title">Harta Tetap</div>
              <div className="float-val">Rumah + Tanah</div>
            </div>
          </div>
          <div className="visual-card float-card float-2">
            <span className="float-icon">📋</span>
            <div>
              <div className="float-title">Sistem Hukum</div>
              <div className="float-val">KHI / Faraidh</div>
            </div>
          </div>
          <div className="visual-card float-card float-3">
            <span className="float-icon">👨‍👩‍👧‍👦</span>
            <div>
              <div className="float-title">Ahli Waris</div>
              <div className="float-val">Keluarga Inti</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
