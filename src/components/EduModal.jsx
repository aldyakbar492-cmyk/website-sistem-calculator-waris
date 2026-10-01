import { useEffect } from "react";
import { dataEdukasi } from "../data/educationData";
import ChapterSections from "./ChapterSections";

// Modal detail bab. Overlay selalu ada di DOM; class "active" yang mengatur tampil/sembunyi
// (CSS-nya memakai transisi opacity), sama seperti versi lama.
export default function EduModal({ chapterIdx, isOpen, onClose, onNavigate }) {
  // Kunci scroll halaman saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const bab = chapterIdx !== null ? dataEdukasi[chapterIdx] : null;

  return (
    <div
      className={"modal-overlay" + (isOpen ? " active" : "")}
      id="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        // Klik di area gelap (overlay) menutup modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <button className="modal-close" id="modalClose" aria-label="Tutup" onClick={onClose}>
          ✕
        </button>
        <div id="modalBody">
          {bab && (
            <>
              {/* Versi lama merender tombol tutup kedua di dalam modalBody; dipertahankan agar tata letak sama */}
              <button className="modal-close" aria-label="Tutup" onClick={onClose}>
                ✕
              </button>
              <span className="modal-bab-label">{bab.babLabel}</span>
              <h2 className="modal-title" id="modalTitle">
                {bab.icon} {bab.title}
              </h2>

              <ChapterSections bab={bab} />

              <div className="modal-nav">
                <button className="modal-nav-btn" id="modalPrev" disabled={chapterIdx === 0} onClick={() => onNavigate(chapterIdx - 1)}>
                  ← Bab Sebelumnya
                </button>
                <button className="modal-nav-btn" id="modalNext" disabled={chapterIdx === dataEdukasi.length - 1} onClick={() => onNavigate(chapterIdx + 1)}>
                  Bab Berikutnya →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
