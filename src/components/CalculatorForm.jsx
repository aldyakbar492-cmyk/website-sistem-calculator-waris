// Input +/- (anak, saudara, jumlah istri). Nilai disimpan di state Calculator.
function NumberField({ id, name, value, min, max, onChange, onStep }) {
  return (
    <div className="number-input-row">
      <button className="num-btn" type="button" onClick={() => onStep(name, -1)}>
        −
      </button>
      <input type="number" className="num-input" value={value} min={min} max={max} id={id} name={name} onChange={onChange} />
      <button className="num-btn" type="button" onClick={() => onStep(name, 1)}>
        +
      </button>
    </div>
  );
}

// Input uang dengan prefix "Rp" (format ribuan diurus onRupiahChange)
function RupiahField({ id, placeholder, value, onChange, inputRef }) {
  return (
    <div className="input-wrapper">
      <span className="input-prefix">Rp</span>
      <input type="text" className="form-input" placeholder={placeholder} id={id} name={id} value={value} onChange={onChange} ref={inputRef} />
    </div>
  );
}

export default function CalculatorForm({ formData, onChange, onRupiahChange, onStep, onHitung, hartaKotorRef }) {
  return (
    <div className="calc-form-panel">
      <div className="calc-form-section">
        <h3 className="form-section-title">
          <span className="form-step">01</span>Data Harta Peninggalan
        </h3>

        <div className="form-group">
          <label className="form-label">Total Harta Kotor (Rp)</label>
          <RupiahField id="hartaKotor" placeholder="Contoh: 600.000.000" value={formData.hartaKotor} onChange={onRupiahChange} inputRef={hartaKotorRef} />
          <span className="form-hint">Semua aset: rumah, tanah, kendaraan, tabungan, dll.</span>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Hutang Pewaris (Rp)</label>
            <RupiahField id="hutang" placeholder="0" value={formData.hutang} onChange={onRupiahChange} />
            <span className="form-hint">Cicilan KPR, hutang bank, dll.</span>
          </div>
          <div className="form-group">
            <label className="form-label">Wasiat (Rp)</label>
            <RupiahField id="wasiat" placeholder="0" value={formData.wasiat} onChange={onRupiahChange} />
            <span className="form-hint">Maks 1/3 dari harta bersih</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Biaya Pemakaman (Rp)</label>
          <RupiahField id="pemakaman" placeholder="Contoh: 10.000.000" value={formData.pemakaman} onChange={onRupiahChange} />
          <span className="form-hint">Kafan, peti, makam, prosesi pemakaman.</span>
        </div>
      </div>

      {/* Divider */}
      <div className="form-divider"></div>

      <div className="calc-form-section">
        <h3 className="form-section-title">
          <span className="form-step">02</span>Data Ahli Waris
        </h3>

        {/* Pasangan */}
        <div className="ahli-group">
          <div className="ahli-group-title">Pasangan Pewaris</div>
          <div className="toggle-row">
            <div className="toggle-option">
              <input type="radio" name="pasangan" id="adaIstri" value="istri" checked={formData.pasangan === "istri"} onChange={onChange} />
              <label htmlFor="adaIstri" className="toggle-label">
                <span className="toggle-icon">👩</span>Ada Istri
              </label>
            </div>
            <div className="toggle-option">
              <input type="radio" name="pasangan" id="adaSuami" value="suami" checked={formData.pasangan === "suami"} onChange={onChange} />
              <label htmlFor="adaSuami" className="toggle-label">
                <span className="toggle-icon">👨</span>Ada Suami
              </label>
            </div>
            <div className="toggle-option">
              <input type="radio" name="pasangan" id="tidakAdaPasangan" value="tidak" checked={formData.pasangan === "tidak"} onChange={onChange} />
              <label htmlFor="tidakAdaPasangan" className="toggle-label">
                <span className="toggle-icon">–</span>Tidak Ada
              </label>
            </div>
          </div>
          {/* Jumlah Istri (muncul jika ada istri) */}
          <div className="conditional-field" id="jmlIstriField" style={{ display: formData.pasangan === "istri" ? "block" : "none" }}>
            <label className="form-label" style={{ marginTop: "12px" }}>
              Jumlah Istri
            </label>
            <NumberField id="jmlIstri" name="jmlIstri" value={formData.jmlIstri} min={1} max={4} onChange={onChange} onStep={onStep} />
            <span className="form-hint">Jika lebih dari satu, porsi 1/4 atau 1/8 dibagi rata.</span>
          </div>
        </div>

        {/* Anak */}
        <div className="ahli-group">
          <div className="ahli-group-title">Anak Kandung</div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Anak Laki-laki</label>
              <NumberField id="anakLaki" name="anakLaki" value={formData.anakLaki} min={0} onChange={onChange} onStep={onStep} />
            </div>
            <div className="form-group">
              <label className="form-label">Anak Perempuan</label>
              <NumberField id="anakPerempuan" name="anakPerempuan" value={formData.anakPerempuan} min={0} onChange={onChange} onStep={onStep} />
            </div>
          </div>
        </div>

        {/* Orang Tua */}
        <div className="ahli-group">
          <div className="ahli-group-title">Orang Tua Pewaris</div>
          <div className="toggle-row">
            <div className="toggle-option">
              <input type="checkbox" id="adaAyah" name="ayah" checked={formData.ayah} onChange={onChange} />
              <label htmlFor="adaAyah" className="toggle-label">
                <span className="toggle-icon">👴</span>Ada Ayah
              </label>
            </div>
            <div className="toggle-option">
              <input type="checkbox" id="adaIbu" name="ibu" checked={formData.ibu} onChange={onChange} />
              <label htmlFor="adaIbu" className="toggle-label">
                <span className="toggle-icon">👵</span>Ada Ibu
              </label>
            </div>
          </div>
        </div>

        {/* Kakek & Nenek */}
        <div className="ahli-group">
          <div className="ahli-group-title">Kakek &amp; Nenek (dari pihak Ayah)</div>
          <div className="toggle-row">
            <div className="toggle-option">
              <input type="checkbox" id="adaKakek" name="kakek" checked={formData.kakek} onChange={onChange} />
              <label htmlFor="adaKakek" className="toggle-label">
                <span className="toggle-icon">👴</span>Ada Kakek
              </label>
            </div>
            <div className="toggle-option">
              <input type="checkbox" id="adaNenek" name="nenek" checked={formData.nenek} onChange={onChange} />
              <label htmlFor="adaNenek" className="toggle-label">
                <span className="toggle-icon">👵</span>Ada Nenek
              </label>
            </div>
          </div>
          <span className="form-hint">Hanya berlaku jika Ayah tidak ada.</span>
        </div>

        {/* Saudara Kandung */}
        <div className="ahli-group">
          <div className="ahli-group-title">Saudara Kandung Pewaris</div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Saudara Laki-laki Kandung</label>
              <NumberField id="saudaraLaki" name="saudaraLaki" value={formData.saudaraLaki} min={0} onChange={onChange} onStep={onStep} />
            </div>
            <div className="form-group">
              <label className="form-label">Saudara Perempuan Kandung</label>
              <NumberField id="saudaraPerempuan" name="saudaraPerempuan" value={formData.saudaraPerempuan} min={0} onChange={onChange} onStep={onStep} />
            </div>
          </div>
          <span className="form-hint">Saudara terhalang (hijab) oleh: Ayah, Anak Laki-laki, atau Kakek.</span>
        </div>
      </div>

      <button className="btn-hitung" type="button" id="btnHitung" onClick={onHitung}>
        <span>Hitung Warisan</span>
        <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}
