// Section "Kenapa Pembagian Waris Itu Penting?" — 6 kartu
export default function WhySection() {
  return (
    <section className="why-section" id="mengapa">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Mengapa Penting</div>
          <h2 className="section-title">Kenapa Pembagian Waris<br />Itu Penting?</h2>
          <p className="section-sub">Banyak keluarga hancur karena salah urus warisan. Kenali risiko dan solusinya.</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon" style={{ background: "var(--blue-pale)" }}>⚖</div>
            <h3>Mencegah Konflik Keluarga</h3>
            <p>Pembagian yang jelas dan legal mencegah perselisihan, perebutan aset, dan keretakan hubungan antar anggota keluarga yang bisa berlangsung bertahun-tahun.</p>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: "var(--gold-pale)" }}>📜</div>
            <h3>Menjaga Keadilan Hakiki</h3>
            <p>Setiap ahli waris memiliki porsi hak yang ditentukan hukum. Pembagian yang adil menjamin tidak ada pihak yang dirugikan atau terpinggirkan.</p>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: "var(--blue-pale)" }}>🛡</div>
            <h3>Melindungi Kelompok Rentan</h3>
            <p>Anak yatim, janda, dan duda berhak mendapat kepastian ekonomi. Hukum waris memastikan mereka tetap terlindungi setelah ditinggal pewaris.</p>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: "var(--gold-pale)" }}>⚡</div>
            <h3>Kepastian Hukum &amp; Hak</h3>
            <p>Dengan memahami hak waris secara legal, setiap ahli waris dapat mengklaim haknya dengan dasar hukum yang kuat di hadapan notaris maupun pengadilan.</p>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: "var(--blue-pale)" }}>🏠</div>
            <h3>Pengelolaan Aset yang Tepat</h3>
            <p>Harta peninggalan — dari properti, usaha, hingga aset digital — perlu dikelola dan dialihkan secara sistematis agar tidak terbengkalai atau disengketakan.</p>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ background: "var(--gold-pale)" }}>💼</div>
            <h3>Aset Digital &amp; Modern</h3>
            <p>Di era digital, kripto, e-wallet, hak cipta, dan akun media sosial monetisasi juga termasuk harta waris yang perlu dihitung dan dialihkan sesuai hukum.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
