import { useState } from "react";
import { formatRupiah, formatFraksi } from "../utils/helpers";

// Panel "Mengapa Hasilnya Seperti Ini?" — tahapan, penjelasan, detail & dalil per ahli waris, hijab.
export default function ExplanationPanel({ hasil }) {
  // Perilaku lama dipertahankan: body terbuka di awal, header belum ber-class "open";
  // setiap klik membalik keduanya (jadi ikon panah & isi panel bergantian terbalik).
  const [toggled, setToggled] = useState(false);

  const { bersih, pengurangan, hasil: ahliWaris, hijab } = hasil;

  const tahapan = [
    { label: "Total Harta", nilai: `Rp ${formatRupiah(pengurangan.harta)}`, warna: "" },
    { label: "Dikurangi Hutang", nilai: pengurangan.hutang > 0 ? `− Rp ${formatRupiah(pengurangan.hutang)}` : "Tidak ada", warna: pengurangan.hutang > 0 ? "red" : "" },
    { label: "Dikurangi Wasiat", nilai: pengurangan.wasiat > 0 ? `− Rp ${formatRupiah(pengurangan.wasiat)}` : "Tidak ada", warna: pengurangan.wasiat > 0 ? "red" : "" },
    { label: "Dikurangi Biaya Pengurusan Jenazah", nilai: pengurangan.pemakaman > 0 ? `− Rp ${formatRupiah(pengurangan.pemakaman)}` : "Tidak ada", warna: pengurangan.pemakaman > 0 ? "red" : "" },
    { label: "Harta Bersih Siap Waris", nilai: `Rp ${formatRupiah(bersih)}`, warna: "green", active: true },
    { label: "Identifikasi Ahli Waris", nilai: ahliWaris.length > 0 ? `${ahliWaris.length} ahli waris berhak` : "Tidak ada ahli waris", warna: "gold" },
    { label: "Pembagian Warisan", nilai: "Sesuai ketentuan faraidh (KHI)", warna: "" },
    { label: "Hasil Akhir Telah Dihitung", nilai: "✓ Lihat rincian di atas", warna: "green", active: true },
  ];

  return (
    <div className="hasil-penjelasan">
      <div className={"penjelasan-header" + (toggled ? " open" : "")} id="penjelasanToggleBtn" onClick={() => setToggled((t) => !t)}>
        <span style={{ fontSize: "1.1rem" }}>🔍</span>
        <h4>Mengapa Hasilnya Seperti Ini?</h4>
        <span className="penjelasan-chevron">▼</span>
      </div>
      <div className={"penjelasan-body" + (!toggled ? " open" : "")} id="penjelasanBody">
        {/* B. Penjelasan Umum */}
        <div className="penjelasan-umum">
          <strong>Bagaimana Sistem Ini Menghitung?</strong>
          <br />
          Pembagian warisan dalam Islam (faraidh) dilakukan dengan urutan: pertama harta dibersihkan dari hutang, wasiat, dan biaya jenazah. Setelah itu, harta bersih dibagi ke ahli waris berdasarkan <em>dzawil furud</em> (bagian pasti seperti 1/2, 1/4, 1/8, 1/3,
          1/6, 2/3) terlebih dahulu. Sisa harta kemudian diberikan ke <em>asabah</em> (seperti anak laki-laki, ayah). Jika total porsi melebihi 100% terjadi <strong>Aul</strong> (semua dikurangi proporsional). Jika ada sisa dan tidak ada asabah terjadi{" "}
          <strong>Radd</strong> (sisa dikembalikan ke ahli waris). Urutan prioritas dan sistem penghalang (hijab) menentukan siapa yang berhak.
        </div>

        {/* A. Tahapan Perhitungan */}
        <div className="tahapan-panel">
          <div className="tahapan-title">Tahapan Perhitungan</div>
          <div className="tahapan-list">
            {tahapan.map((t, i) => {
              const isLast = i === tahapan.length - 1;
              return (
                <div className="tahapan-item" key={i}>
                  <div className="tahapan-connector">
                    <div className={`tahapan-circle ${t.active ? "active" : ""}`}>{i + 1}</div>
                    {!isLast && <div className="tahapan-line"></div>}
                  </div>
                  <div className="tahapan-content">
                    <div className="tahapan-label">{t.label}</div>
                    <div className={`tahapan-nilai ${t.warna}`}>{t.nilai}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* C. Detail Setiap Ahli Waris */}
        {ahliWaris.length > 0 && (
          <div className="detail-ahliwaris-panel">
            <div className="tahapan-title" style={{ marginBottom: "12px" }}>
              Detail &amp; Alasan Per Ahli Waris
            </div>
            {ahliWaris.map((item) => (
              <div className="detail-ahliwaris-item" key={item.nama}>
                <div className="detail-header-row">
                  <span className="detail-ikon">{item.ikon}</span>
                  <div className="detail-nama-wrap">
                    <div className="detail-nama">{item.nama}</div>
                    <div className="detail-status">{item.status}</div>
                  </div>
                  <div className="detail-nominal">Rp {formatRupiah(item.bagian)}</div>
                </div>
                <div className="detail-rows">
                  <div className="detail-kv">
                    <div className="detail-kv-key">Jenis Bagian</div>
                    <div className="detail-kv-val">{item.jenisBagian}</div>
                  </div>
                  <div className="detail-kv">
                    <div className="detail-kv-key">Porsi</div>
                    <div className="detail-kv-val">
                      {formatFraksi(item.fraksi)} ({(item.fraksi * 100).toFixed(2)}%)
                    </div>
                  </div>
                  {item.jumlah > 1 && (
                    <>
                      <div className="detail-kv">
                        <div className="detail-kv-key">Jumlah Orang</div>
                        <div className="detail-kv-val">{item.jumlah} orang</div>
                      </div>
                      <div className="detail-kv">
                        <div className="detail-kv-key">Per Orang</div>
                        <div className="detail-kv-val">Rp {formatRupiah(item.bagianPerOrang)}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="detail-alasan">💡 {item.alasan}</div>
                <div className="detail-dalil">
                  <strong>Dasar Hukum:</strong> {item.dalil}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* D. Panel Hijab */}
        {hijab && hijab.length > 0 && (
          <div className="hijab-panel">
            <div className="hijab-title">🚫 Ahli Waris Terhalang (Sistem Hijab)</div>
            {hijab.map((h, i) => (
              <div className="hijab-item" key={i}>
                <span className="hijab-ikon">{h.ikon}</span>
                <div className="hijab-info">
                  <div className="hijab-nama">{h.nama}</div>
                  <div className="hijab-alasan">{h.alasan}</div>
                </div>
                <span className="hijab-badge">Tidak Mewaris</span>
              </div>
            ))}
          </div>
        )}

        {/* E. Referensi Dalil Utama */}
        <div className="result-catatan" style={{ marginTop: "12px" }}>
          <div className="catatan-title">📖 Referensi Dalil Utama Faraidh</div>
          <ul className="catatan-list">
            <li>
              <strong>QS An-Nisa ayat 11</strong> — Porsi anak laki-laki dan perempuan, serta bagian ayah/ibu jika ada anak.
            </li>
            <li>
              <strong>QS An-Nisa ayat 12</strong> — Bagian suami/istri (1/2, 1/4, 1/8, 1/4) tergantung ada tidaknya anak.
            </li>
            <li>
              <strong>QS An-Nisa ayat 176</strong> — Bagian saudara kandung laki-laki dan perempuan (kalalah).
            </li>
            <li>
              <strong>Kompilasi Hukum Islam (KHI)</strong> — Dasar hukum positif warisan Islam di Indonesia.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
