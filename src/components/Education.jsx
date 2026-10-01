import { useCallback, useState } from "react";
import { dataEdukasi } from "../data/educationData";
import { openInNewTab } from "../hooks/useHashRoute";
import EduModal from "./EduModal";

export default function Education() {
  const [selectedChapter, setSelectedChapter] = useState(null); // index bab yang tampil di modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // E-Book dibuka di tab baru (halaman #/baca)
  const openEbook = () => openInNewTab("baca");

  const openModal = (idx) => {
    setSelectedChapter(idx);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <section className="edu-section" id="edukasi">
        <div className="container">
          <div id="viewGrid">
            <div className="section-header">
              <div className="section-tag">Materi Edukasi</div>
              <h2 className="section-title">
                Pelajari Dasar-Dasar
                <br />
                Hukum Waris Indonesia
              </h2>
              <p className="section-sub">14 bab materi lengkap, disusun dari dasar hingga perhitungan kompleks. Bahasa kasual, akurat secara hukum.</p>
            </div>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <button className="btn-ebook-cta" id="btnEbookMode" onClick={openEbook}>
                📖 Baca Seluruh Bab Secara Runtut (E-Book Mode)
              </button>
            </div>
            <div className="edu-grid" id="eduGrid">
              {dataEdukasi.map((bab, idx) => {
                const isFeatured = bab.featured;
                return (
                  <div key={bab.id} className={"edu-card" + (isFeatured ? " edu-card-featured" : "")}>
                    <div className="edu-card-top">
                      <div className="edu-icon">{bab.icon}</div>
                      <span className="edu-bab">{bab.babLabel}</span>
                    </div>
                    <h3>{bab.title}</h3>
                    <p>{bab.singkat}</p>
                    <div className={"edu-insight" + (isFeatured ? " edu-insight-dark" : "")}>
                      <span className="edu-insight-icon">{bab.insight.type === "warning" ? "⚠️" : "💡"}</span>
                      <span dangerouslySetInnerHTML={{ __html: bab.insight.teks }} />
                    </div>
                    <div className="edu-tags">
                      {bab.tags.map((t) => (
                        <span key={t} className={"edu-tag" + (isFeatured ? " gold" : "")}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      className="edu-link btn-pelajari"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                      onClick={() => openModal(idx)}
                    >
                      Pelajari Lebih Lanjut →
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="edu-footer-cta" style={{ marginTop: "40px" }}>
              <button className="btn-ebook-cta" id="btnEbookMode2" onClick={openEbook}>
                📖 Baca Seluruh Bab Secara Runtut (E-Book Mode)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DETAIL BAB */}
      <EduModal chapterIdx={selectedChapter} isOpen={isModalOpen} onClose={closeModal} onNavigate={openModal} />
    </>
  );
}
