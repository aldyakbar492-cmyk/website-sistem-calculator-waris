import { formatRupiah, formatFraksi } from "../utils/helpers";

// Kartu hasil satu ahli waris (nominal, dasar bagian, persentase, alasan)
export default function HeirResultCard({ item }) {
  const persen = (item.fraksi * 100).toFixed(2);
  const fraksiLabel = formatFraksi(item.fraksi);

  return (
    <div className={`aw-card warna-${item.warna}`}>
      <div className="aw-card-header">
        <div className="aw-icon-wrap">{item.ikon}</div>
        <div className="aw-name-block">
          <div className="aw-name">{item.nama}</div>
          <div className="aw-status">{item.status}</div>
        </div>
        <div className="aw-amount-block">
          <div className="aw-total">Rp {formatRupiah(item.bagian)}</div>
          {item.jumlah > 1 && <div className="aw-per-orang">@ Rp {formatRupiah(item.bagianPerOrang)} / orang</div>}
        </div>
      </div>
      <div className="aw-details">
        <div className="aw-detail-pill">
          <div className="aw-detail-key">Dasar Bagian</div>
          <div className="aw-detail-val">{fraksiLabel}</div>
        </div>
        <div className="aw-detail-pill">
          <div className="aw-detail-key">Persentase</div>
          <div className="aw-detail-val">{persen}%</div>
        </div>
        <div className="aw-detail-pill" style={{ gridColumn: "1/-1" }}>
          <div className="aw-detail-key">Jenis Bagian</div>
          <div className="aw-detail-val">{item.jenisBagian}</div>
        </div>
      </div>
      <div className="aw-alasan-box">{item.alasan}</div>
    </div>
  );
}
