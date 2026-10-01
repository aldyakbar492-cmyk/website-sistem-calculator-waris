import { useEffect, useRef, useState } from "react";
import { dataEdukasi } from "../data/educationData";
import ChapterSections from "./ChapterSections";

// Halaman E-Book (#/baca, dibuka di tab baru): daftar isi di kiri, seluruh bab berurutan di kanan.
export default function EbookView() {
  const [activeChapter, setActiveChapter] = useState(null);
  const chapterRefs = useRef([]);

  // TOC aktif mengikuti bab yang sedang terlihat (threshold 0.25, sama seperti versi lama)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let lastIdx = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) lastIdx = Number(entry.target.dataset.chapter);
        });
        if (lastIdx !== null) setActiveChapter(lastIdx);
      },
      { threshold: 0.25 },
    );
    chapterRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToChapter = (idx) => {
    chapterRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div id="viewEbook">
      <div className="ebook-header">
        <button className="btn-back-grid" id="btnBackGrid" onClick={() => (window.location.hash = "#/edukasi")}>
          ← Kembali ke Menu Bab
        </button>
        <div>
          <h2 className="ebook-title">📖 Modul Edukasi Waris Modern</h2>
          <p className="ebook-subtitle">Baca dari Bab 1 hingga Bab 14 secara runtut</p>
        </div>
      </div>
      <div className="ebook-layout">
        {/* Sidebar TOC */}
        <nav className="ebook-toc" id="ebookToc">
          <div className="ebook-toc-header">Daftar Isi</div>
          {dataEdukasi.map((bab, idx) => (
            <div key={bab.id} className={"ebook-toc-link" + (activeChapter === idx ? " active" : "")} data-chapter={idx} onClick={() => scrollToChapter(idx)}>
              <span className="toc-num">{idx + 1}</span>
              <span>
                {bab.babLabel}: {bab.title.split("&")[0].trim()}
              </span>
            </div>
          ))}
        </nav>

        {/* Konten */}
        <div className="ebook-content" id="ebookContent">
          {dataEdukasi.map((bab, idx) => (
            <article key={bab.id} className="ebook-chapter" id={`chapter-${idx}`} data-chapter={idx} ref={(el) => (chapterRefs.current[idx] = el)}>
              <div className="chapter-header">
                <span className="chapter-icon-big">{bab.icon}</span>
                <div>
                  <span className="chapter-bab-label">{bab.babLabel}</span>
                  <h2 className="chapter-title">{bab.title}</h2>
                </div>
              </div>
              <div className="chapter-body">
                <ChapterSections bab={bab} />
              </div>
              {idx < dataEdukasi.length - 1 && <hr className="chapter-divider" />}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
