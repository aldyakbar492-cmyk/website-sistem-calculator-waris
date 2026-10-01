import { Fragment } from "react";
import { formatRupiah } from "../utils/helpers";
import HeirResultCard from "./HeirResultCard";
import ExplanationPanel from "./ExplanationPanel";

// Ringkasan hasil: alur pengurangan harta → daftar ahli waris → catatan hukum.
// Elemen dirender langsung sebagai anak #resultSummaryBox (CSS memakai "#resultSummaryBox > *").
function ResultSummary({ hasil }) {
  const { bersih, pengurangan, hasil: ahliWaris, catatan } = hasil;

  const flowItems = [{ icon: "1", label: "Harta Kotor", amount: `Rp ${formatRupiah(pengurangan.harta)}` }];
  if (pengurangan.hutang > 0) flowItems.push({ icon: "2", label: "Dikurangi Hutang", amount: `− Rp ${formatRupiah(pengurangan.hutang)}`, neg: true });
  if (pengurangan.wasiat > 0) flowItems.push({ icon: "3", label: "Dikurangi Wasiat", amount: `− Rp ${formatRupiah(pengurangan.wasiat)}`, neg: true });
  if (pengurangan.pemakaman > 0) flowItems.push({ icon: "4", label: "Dikurangi Biaya Pemakaman", amount: `− Rp ${formatRupiah(pengurangan.pemakaman)}`, neg: true });
  flowItems.push({ icon: "✓", label: "Harta Bersih Siap Waris", amount: `Rp ${formatRupiah(bersih)}`, highlight: true });

  return (
    <>
      <div className="result-flow">
        {flowItems.map((f, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="flow-connector"></div>}
            <div className={"flow-item" + (f.highlight ? " flow-highlight" : "")}>
              <div className="flow-step-icon">{f.icon}</div>
              <div className="flow-content">
                <div className="flow-label">{f.label}</div>
                <div className={"flow-amount" + (f.neg ? " neg" : "")}>{f.amount}</div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      {ahliWaris.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px", marginTop: "16px" }}>
          <p style={{ color: "var(--gold)", fontWeight: 600 }}>⚠️ Tidak ada ahli waris yang diisi. Silakan centang/pilih setidaknya satu ahli waris.</p>
        </div>
      ) : (
        <>
          <div className="aw-section-label">Pembagian per Ahli Waris</div>
          <div className="aw-cards-grid">
            {ahliWaris.map((item) => (
              <HeirResultCard key={item.nama} item={item} />
            ))}
          </div>
        </>
      )}

      {catatan.length > 0 && (
        <div className="result-catatan">
          <div className="catatan-title">📌 Catatan Hukum</div>
          <ul className="catatan-list">
            {catatan.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default function ResultPanel({ result, showError, calcCount, onDownloadPdf, pdfBusy, panelRef }) {
  return (
    <div className="calc-result-panel" id="resultPanel" ref={panelRef}>
      <div className="result-header">
        <div className="result-title-row">
          <h3>Hasil Simulasi Pembagian</h3>
        </div>
        <div className="result-disclaimer">Estimasi berdasarkan KHI (Kompilasi Hukum Islam)</div>
      </div>

      {/* Ringkasan Harta */}
      <div className="result-summary-box" id="resultSummaryBox">
        {showError ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
            <p style={{ color: "var(--color-error, #ef4444)", fontWeight: 600, fontSize: "1rem" }}>Mohon masukkan nilai Harta Kotor terlebih dahulu.</p>
          </div>
        ) : result ? (
          <ResultSummary hasil={result.hasil} />
        ) : (
          <div className="placeholder-state">
            <div className="placeholder-icon" style={{ fontSize: "2.4rem", opacity: 0.3, marginBottom: "12px" }}>
              ⚖
            </div>
            <p>
              Isi data di sebelah kiri, lalu klik <strong>Hitung Warisan</strong> untuk melihat hasil pembagian yang sesuai hukum Islam.
            </p>
          </div>
        )}
      </div>

      {/* Panel Penjelasan Hasil — di-reset (key) setiap kali hitung ulang */}
      <div id="hasilPenjelasanPanel" style={{ display: result ? "block" : "none" }}>
        {result && <ExplanationPanel key={calcCount} hasil={result.hasil} />}
      </div>

      {/* Download PDF — muncul setelah ada hasil valid */}
      <div id="downloadPdfWrap" style={{ display: result ? "block" : "none", marginTop: "4px" }}>
        <button className="btn-download-pdf" id="btnDownloadPdf" onClick={onDownloadPdf} disabled={pdfBusy}>
          {pdfBusy ? (
            "⏳ Menyiapkan PDF..."
          ) : (
            <>
              <span>⬇</span>
              <span>Download Laporan Waris (PDF)</span>
            </>
          )}
        </button>
      </div>

      {/* Urutan Pembagian Info */}
      <div className="result-info-box">
        <div className="info-box-title">Urutan Pembersihan Harta</div>
        <div className="info-steps">
          <div className="info-step">
            <span className="step-num">1</span>
            <span>Biaya Pemakaman</span>
          </div>
          <div className="step-arrow">↓</div>
          <div className="info-step">
            <span className="step-num">2</span>
            <span>Pelunasan Hutang</span>
          </div>
          <div className="step-arrow">↓</div>
          <div className="info-step">
            <span className="step-num">3</span>
            <span>Wasiat (maks 1/3)</span>
          </div>
          <div className="step-arrow">↓</div>
          <div className="info-step active">
            <span className="step-num">4</span>
            <span>Harta Bersih Siap Waris</span>
          </div>
        </div>
      </div>
    </div>
  );
}
