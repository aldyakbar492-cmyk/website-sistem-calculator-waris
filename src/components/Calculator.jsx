import { useRef, useState } from "react";
import CalculatorForm from "./CalculatorForm";
import ResultPanel from "./ResultPanel";
import { hitungWarisan } from "../utils/calculator";

// State awal form. Input angka disimpan sebagai string (seperti .value di DOM lama);
// konversi ke angka dilakukan di hitungWarisan().
const INITIAL_FORM = {
  hartaKotor: "",
  hutang: "",
  wasiat: "",
  pemakaman: "",
  pasangan: "tidak", // "istri" | "suami" | "tidak"
  jmlIstri: "1",
  anakLaki: "0",
  anakPerempuan: "0",
  ayah: false,
  ibu: false,
  kakek: false,
  nenek: false,
  saudaraLaki: "0",
  saudaraPerempuan: "0",
};

export default function Calculator() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null); // { hasil, data } dari hitungWarisan — hasil valid terakhir
  const [showError, setShowError] = useState(false); // pesan "isi Harta Kotor" menggantikan ringkasan
  const [calcCount, setCalcCount] = useState(0); // untuk me-reset panel penjelasan tiap hitung ulang
  const [pdfBusy, setPdfBusy] = useState(false);

  const hartaKotorRef = useRef(null);
  const panelRef = useRef(null);

  // Input biasa: radio, checkbox, number
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Input uang: hanya digit, diformat dengan titik ribuan (1.500.000)
  const handleRupiahChange = (e) => {
    const { name, value } = e.target;
    const raw = value.replace(/\D/g, "");
    const num = Number(raw);
    setFormData((prev) => ({ ...prev, [name]: isNaN(num) || raw === "" ? "" : new Intl.NumberFormat("id-ID").format(num) }));
  };

  // Tombol − / + pada input angka (min 0, jumlah istri min 1 / maks 4)
  const handleStep = (name, delta) => {
    setFormData((prev) => {
      const cur = Number(prev[name]);
      if (delta < 0) {
        const min = name === "jmlIstri" ? 1 : 0;
        return cur > min ? { ...prev, [name]: String(cur - 1) } : prev;
      }
      const max = name === "jmlIstri" ? 4 : Infinity;
      return cur < max ? { ...prev, [name]: String(cur + 1) } : prev;
    });
  };

  const handleHitung = () => {
    // Setara getInputs() lama: nilai kosong → "0" (jumlah istri → "1")
    const data = {
      hartaKotor: formData.hartaKotor || "0",
      hutang: formData.hutang || "0",
      wasiat: formData.wasiat || "0",
      pemakaman: formData.pemakaman || "0",
      anakLaki: formData.anakLaki || "0",
      anakPerempuan: formData.anakPerempuan || "0",
      ayah: formData.ayah,
      ibu: formData.ibu,
      kakek: formData.kakek,
      nenek: formData.nenek,
      saudaraLaki: formData.saudaraLaki || "0",
      saudaraPerempuan: formData.saudaraPerempuan || "0",
      pasangan: formData.pasangan,
      jmlIstri: formData.jmlIstri || "1",
    };

    // Validasi minimal: harta kotor harus diisi
    const hartaKotor = Number(String(data.hartaKotor).replace(/\./g, "").replace(/,/g, ""));
    if (hartaKotor <= 0) {
      setShowError(true);
      hartaKotorRef.current?.focus();
      return;
    }

    const hasil = hitungWarisan(data);
    setResult({ hasil, data });
    setShowError(false);
    setCalcCount((n) => n + 1);

    // Scroll ke panel hasil
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // jsPDF cukup besar, jadi baru dimuat saat tombol Download diklik
  const handleDownloadPdf = async () => {
    const { generatePdfLaporan } = await import("../utils/pdf");
    generatePdfLaporan(result, setPdfBusy);
  };

  return (
    <section className="calc-section" id="kalkulator">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Kalkulator</div>
          <h2 className="section-title">
            Hitung Pembagian Warisan
            <br />
            Sesuai Hukum Islam (KHI)
          </h2>
          <p className="section-sub">Masukkan data ahli waris dan harta, sistem kami akan menghitung sesuai Kompilasi Hukum Islam — termasuk penyesuaian Aul &amp; Radd.</p>
        </div>

        <div className="calc-wrapper">
          <CalculatorForm formData={formData} onChange={handleChange} onRupiahChange={handleRupiahChange} onStep={handleStep} onHitung={handleHitung} hartaKotorRef={hartaKotorRef} />
          <ResultPanel result={result} showError={showError} calcCount={calcCount} onDownloadPdf={handleDownloadPdf} pdfBusy={pdfBusy} panelRef={panelRef} />
        </div>
      </div>
    </section>
  );
}
