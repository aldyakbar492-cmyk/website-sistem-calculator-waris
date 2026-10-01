import { useRef, useState } from "react";
import { faqData } from "../data/faqData";

// Satu item accordion. Gaya inline (max-height, opacity, rotasi ikon) sama
// dengan yang dulu dipasang script.js lewat manipulasi DOM.
function FaqItem({ item, isOpen, onToggle }) {
  const answerRef = useRef(null);
  const [answerHeight, setAnswerHeight] = useState(0);

  const handleClick = () => {
    // Ukur tinggi konten saat akan dibuka (sama seperti answer.scrollHeight di versi lama)
    if (!isOpen && answerRef.current) setAnswerHeight(answerRef.current.scrollHeight);
    onToggle();
  };

  return (
    <div className={"faq-card" + (isOpen ? " faq-open" : "")}>
      <div className="faq-q" onClick={handleClick} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
        <span className="faq-icon">{item.icon}</span>
        {item.question}
        <span
          className="faq-toggle-icon"
          style={{
            marginLeft: "auto",
            fontSize: "1.4rem",
            fontWeight: 300,
            transition: "transform 0.3s ease",
            flexShrink: 0,
            transform: isOpen ? "rotate(45deg)" : undefined,
          }}
        >
          +
        </span>
      </div>
      <p
        ref={answerRef}
        className="faq-a"
        style={{
          maxHeight: isOpen ? answerHeight + "px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s ease, opacity 0.35s ease",
          opacity: isOpen ? 1 : 0,
        }}
        dangerouslySetInnerHTML={{ __html: item.answer }}
      />
    </div>
  );
}

export default function FAQ() {
  // Hanya satu FAQ yang terbuka dalam satu waktu (null = semua tertutup)
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">
            Pertanyaan yang Sering
            <br />
            Ditanyakan
          </h2>
          <p className="section-sub">Jawaban atas kebingungan paling umum seputar hukum waris di Indonesia.</p>
        </div>

        <div className="faq-grid">
          {faqData.map((item, i) => (
            <FaqItem key={i} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
