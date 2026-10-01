// Tabel referensi cepat porsi ahli waris (KHI)
export default function PorsiTable() {
  return (
    <section className="table-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Referensi Cepat</div>
          <h2 className="section-title">Tabel Porsi Ahli Waris<br />Kompilasi Hukum Islam</h2>
          <p className="section-sub">Ringkasan porsi pecahan setiap ahli waris berdasarkan kondisi yang ada.</p>
        </div>
        <div className="table-wrapper">
          <table className="waris-table">
            <thead>
              <tr>
                <th>Ahli Waris</th>
                <th>Kondisi Ada Anak</th>
                <th>Kondisi Tidak Ada Anak</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="table-badge blue">Suami</span></td>
                <td className="fraction">¼</td>
                <td className="fraction">½</td>
                <td>Porsi pasangan saat istri meninggal</td>
              </tr>
              <tr>
                <td><span className="table-badge purple">Istri</span></td>
                <td className="fraction">⅛</td>
                <td className="fraction">¼</td>
                <td>Jika lebih dari 1 istri, dibagi rata</td>
              </tr>
              <tr>
                <td><span className="table-badge gold">Ayah</span></td>
                <td className="fraction">⅙</td>
                <td className="td-asabah">Asabah (sisa)</td>
                <td>Ayah mengambil sisa jika tidak ada anak</td>
              </tr>
              <tr>
                <td><span className="table-badge teal">Ibu</span></td>
                <td className="fraction">⅙</td>
                <td className="fraction">⅓</td>
                <td>1/6 jika ada 2+ saudara pun ada anak</td>
              </tr>
              <tr>
                <td><span className="table-badge green">Anak Laki-laki</span></td>
                <td colSpan={2} className="td-asabah">Asabah (sisa) — rasio 2:1 vs anak perempuan</td>
                <td>Selalu ambil sisa setelah pasangan & ortu</td>
              </tr>
              <tr>
                <td><span className="table-badge rose">Anak Perempuan</span></td>
                <td className="fraction">Asabah (2:1)</td>
                <td className="fraction">½ (tunggal) / ⅔ (≥2)</td>
                <td>2/3 dibagi rata jika anak perempuan ≥2 dan tidak ada anak laki-laki</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-note">
          <span>⚠</span>
          <p>
            Jika total porsi melebihi 100% (<strong>Aul</strong>), penyebut diubah menyesuaikan pembilang agar pembagian tetap proporsional. Jika ada sisa setelah semua porsi terpenuhi (<strong>Radd</strong>), sisa dikembalikan kepada ahli
            waris secara proporsional.
          </p>
        </div>
      </div>
    </section>
  );
}
