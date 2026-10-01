// Tiga blok isi bab (konsep, dalil, problematika) — dipakai oleh modal DAN e-book mode.
// Data edukasi berisi HTML inline (<strong>, <cite>, dll), jadi dirender dengan
// dangerouslySetInnerHTML. Sumbernya data statis milik sendiri, bukan input pengguna.
export default function ChapterSections({ bab }) {
  // Sama seperti versi lama: pecah per baris, bungkus tiap baris dengan <p>
  const konsepHtml = bab.narasiLengkap.konsep
    .split("\n")
    .map((p) => (p.trim() ? `<p>${p.trim()}</p>` : ""))
    .join("");

  return (
    <>
      <div className="modal-section">
        <div className="modal-section-title">📘 Konsep untuk Orang Awam</div>
        <div className="modal-narasi" dangerouslySetInnerHTML={{ __html: konsepHtml }} />
      </div>

      <div className="modal-section">
        <div className="modal-section-title">📖 Dalil &amp; Landasan Hukum</div>
        <blockquote className="modal-dalil" dangerouslySetInnerHTML={{ __html: bab.narasiLengkap.dalil }} />
      </div>

      <div className="modal-section">
        <div className="modal-section-title">🔬 Problematika &amp; Analisis Hukum</div>
        <div className="modal-problematika" dangerouslySetInnerHTML={{ __html: bab.narasiLengkap.problematika }} />
      </div>
    </>
  );
}
