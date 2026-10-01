// ============================================================
//  helpers.js — Utilitas format & parsing angka
//  FIX: parseNumber sekarang aman untuk input Number maupun string kosong
// ============================================================

/**
 * Format angka ke format Rupiah (tanpa simbol Rp)
 * Contoh: 1500000 → "1.500.000"
 */
function formatRupiah(value) {
  const num = Number(value);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Ambil angka dari input string (hapus titik pemisah ribuan & koma desimal)
 * FIX: Konversi ke String terlebih dahulu agar .replace() tidak crash
 * jika value berupa Number (misal: 0) atau null/undefined
 * Contoh: "600.000.000" → 600000000
 */
function parseNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/\./g, "").replace(/,/g, "").trim();
  const result = Number(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Format pecahan menjadi teks yang mudah dibaca
 * Contoh: 0.125 → "1/8", 0.1667 → "1/6"
 */
function formatFraksi(nilai) {
  const toleransi = 0.0001;
  const fraksi = [
    { nilai: 1 / 2, label: "½ (1/2)" },
    { nilai: 1 / 4, label: "¼ (1/4)" },
    { nilai: 1 / 8, label: "⅛ (1/8)" },
    { nilai: 1 / 3, label: "⅓ (1/3)" },
    { nilai: 2 / 3, label: "⅔ (2/3)" },
    { nilai: 1 / 6, label: "⅙ (1/6)" },
  ];
  for (const f of fraksi) {
    if (Math.abs(nilai - f.nilai) < toleransi) return f.label;
  }
  return `${(nilai * 100).toFixed(2)}%`;
}

// ── calculator.js ────────────────────────────────────────────
// ============================================================
//  calculator.js — Logika Perhitungan Waris (KHI / Faraidh)
//  FIX: Porsi sisa (asabah) dihitung dinamis dari porsi pasangan + ortu
//  FIX: Ayah & Ibu diperhitungkan dengan porsi 1/6 yang benar
//  FIX: Kasus hanya anak perempuan (tanpa anak laki) ditangani
//  FIX: Aul & Radd diterapkan otomatis
// ============================================================

/**
 * Fungsi utama: hitung warisan berdasarkan data form
 * @param {Object} data - data dari getInputs()
 * @returns {{ bersih, pengurangan, hasil, catatan }}
 */
function hitungWarisan(data) {
  // ── 1. Parse semua angka ──────────────────────────────────
  const harta = parseNumber(data.hartaKotor);
  const hutang = parseNumber(data.hutang);
  const wasiat = parseNumber(data.wasiat);
  const pemakaman = parseNumber(data.pemakaman);

  // ── 2. Hitung harta bersih siap waris ────────────────────
  const totalPengurangan = hutang + wasiat + pemakaman;
  let bersih = harta - totalPengurangan;
  if (bersih < 0) bersih = 0;

  const pengurangan = { harta, hutang, wasiat, pemakaman, totalPengurangan };

  // ── 3. Baca data ahli waris ───────────────────────────────
  const pasangan = data.pasangan;
  const jmlIstri = Math.max(1, Math.min(4, Number(data.jmlIstri) || 1));
  const anakL = Math.max(0, Number(data.anakLaki) || 0);
  const anakP = Math.max(0, Number(data.anakPerempuan) || 0);
  const adaAyah = Boolean(data.ayah);
  const adaIbu = Boolean(data.ibu);
  const adaKakek = Boolean(data.kakek);
  const adaNenek = Boolean(data.nenek);
  const saudaraL = Math.max(0, Number(data.saudaraLaki) || 0);
  const saudaraP = Math.max(0, Number(data.saudaraPerempuan) || 0);

  const adaAnak = anakL + anakP > 0;
  const adaAyahEfektif = adaAyah; // Ayah efektif menghijab saudara dan kakek
  const adaAnakLakiEfektif = anakL > 0; // Anak laki menghijab saudara

  // ── 4. Sistem Hijab ───────────────────────────────────────
  let hijab = []; // daftar ahli waris yang terhalang

  // Kakek dihijab oleh Ayah
  const kakekTerhijab = adaKakek && adaAyah;
  if (kakekTerhijab) {
    hijab.push({ nama: "Kakek", ikon: "👴", alasan: "Kakek tidak mendapatkan warisan karena terhalang (mahjoob) oleh keberadaan Ayah kandung pewaris." });
  }
  const adaKakekEfektif = adaKakek && !kakekTerhijab;

  // Nenek dihijab oleh Ibu atau Ayah
  const nenekTerhijabIbu = adaNenek && adaIbu;
  const nenekTerhijabAyah = adaNenek && adaAyah;
  const nenekTerhijab = nenekTerhijabIbu || nenekTerhijabAyah;
  if (nenekTerhijab && adaNenek) {
    const penghalang = adaIbu ? "Ibu kandung" : "Ayah kandung";
    hijab.push({ nama: "Nenek", ikon: "👵", alasan: `Nenek tidak mendapatkan warisan karena terhalang oleh keberadaan ${penghalang} pewaris.` });
  }
  const adaNenekEfektif = adaNenek && !nenekTerhijab;

  // Saudara dihijab oleh: Ayah, Anak Laki-laki, atau Kakek efektif
  const saudaraTerhijab = (saudaraL > 0 || saudaraP > 0) && (adaAyah || anakL > 0 || adaKakekEfektif);
  if (saudaraTerhijab && (saudaraL > 0 || saudaraP > 0)) {
    let penghalangSaudara = [];
    if (adaAyah) penghalangSaudara.push("Ayah kandung");
    if (anakL > 0) penghalangSaudara.push("Anak Laki-laki");
    if (adaKakekEfektif) penghalangSaudara.push("Kakek");
    if (saudaraL > 0) hijab.push({ nama: `Saudara Laki-laki (${saudaraL} orang)`, ikon: "👦", alasan: `Saudara laki-laki kandung tidak mendapatkan warisan karena terhalang oleh: ${penghalangSaudara.join(", ")}.` });
    if (saudaraP > 0) hijab.push({ nama: `Saudara Perempuan (${saudaraP} orang)`, ikon: "👧", alasan: `Saudara perempuan kandung tidak mendapatkan warisan karena terhalang oleh: ${penghalangSaudara.join(", ")}.` });
  }
  const saudaraLEfektif = saudaraTerhijab ? 0 : saudaraL;
  const saudaraPEfektif = saudaraTerhijab ? 0 : saudaraP;
  const adaSaudara = saudaraLEfektif + saudaraPEfektif > 0;

  // ── 5. Hitung porsi setiap ahli waris ────────────────────
  let porsi = {};
  let catatan = [];

  // — Pasangan —
  if (pasangan === "istri") {
    const bagianIstri = adaAnak ? 1 / 8 : 1 / 4;
    porsi["Istri"] = bagianIstri;
    if (jmlIstri > 1) {
      catatan.push(`Porsi istri (${adaAnak ? "1/8" : "1/4"}) dibagi rata untuk ${jmlIstri} orang istri.`);
    }
  } else if (pasangan === "suami") {
    porsi["Suami"] = adaAnak ? 1 / 4 : 1 / 2;
  }

  // — Ayah —
  if (adaAyah) {
    if (adaAnak) {
      porsi["Ayah"] = 1 / 6;
    } else {
      porsi["Ayah"] = "asabah";
    }
  }

  // — Ibu —
  if (adaIbu) {
    if (adaAnak) {
      porsi["Ibu"] = 1 / 6;
    } else if (adaSaudara || saudaraLEfektif + saudaraPEfektif >= 2) {
      // Jika ada 2+ saudara dan tidak ada anak: ibu dapat 1/6
      porsi["Ibu"] = 1 / 6;
      catatan.push("Ibu mendapat 1/6 karena ada 2 atau lebih saudara kandung pewaris.");
    } else {
      porsi["Ibu"] = 1 / 3;
      catatan.push("Ibu mendapat 1/3 karena tidak ada anak kandung. Porsi berkurang menjadi 1/6 jika ada 2 atau lebih saudara kandung pewaris.");
    }
  }

  // — Kakek Efektif (hanya jika tidak ada Ayah) —
  if (adaKakekEfektif) {
    if (adaAnak) {
      porsi["Kakek"] = 1 / 6;
    } else {
      porsi["Kakek"] = "asabah";
    }
  }

  // — Nenek Efektif (hanya jika tidak ada Ibu/Ayah) —
  if (adaNenekEfektif) {
    porsi["Nenek"] = 1 / 6;
    catatan.push("Nenek mendapat porsi 1/6 sebagai pengganti Ibu/Ayah yang tidak ada.");
  }

  // ── Hitung sisa (asabah) ──────────────────────────────────
  let totalPorsiTetap = 0;
  for (const [key, val] of Object.entries(porsi)) {
    if (val !== "asabah") totalPorsiTetap += val;
  }
  let sisaUntukAsabah = Math.max(0, 1 - totalPorsiTetap);

  // — Anak —
  if (adaAnak) {
    const totalUnit = anakL * 2 + anakP;
    if (anakL > 0) {
      porsi["Anak Laki-laki"] = ((anakL * 2) / totalUnit) * sisaUntukAsabah;
    }
    if (anakP > 0) {
      if (anakL > 0) {
        porsi["Anak Perempuan"] = (anakP / totalUnit) * sisaUntukAsabah;
      } else {
        if (anakP === 1) {
          porsi["Anak Perempuan"] = 1 / 2;
          catatan.push("Hanya 1 anak perempuan tanpa anak laki: mendapat porsi tetap 1/2.");
        } else {
          porsi["Anak Perempuan"] = 2 / 3;
          catatan.push(`${anakP} anak perempuan tanpa anak laki: total porsi 2/3 dibagi rata.`);
        }
      }
    }
  } else if (adaAyah) {
    // Ayah asabah jika tidak ada anak
    porsi["Ayah"] = sisaUntukAsabah;
    catatan.push("Tidak ada anak kandung: Ayah mengambil sisa harta sebagai Asabah.");
  } else if (adaKakekEfektif && !adaAyah) {
    porsi["Kakek"] = sisaUntukAsabah;
    catatan.push("Tidak ada anak atau ayah: Kakek mengambil sisa harta sebagai Asabah.");
  } else if (adaSaudara) {
    // Saudara sebagai asabah
    const totalUnitSaudara = saudaraLEfektif * 2 + saudaraPEfektif;
    if (saudaraLEfektif > 0) {
      porsi["Saudara Laki-laki"] = ((saudaraLEfektif * 2) / totalUnitSaudara) * sisaUntukAsabah;
    }
    if (saudaraPEfektif > 0) {
      if (saudaraLEfektif > 0) {
        porsi["Saudara Perempuan"] = (saudaraPEfektif / totalUnitSaudara) * sisaUntukAsabah;
      } else {
        // Hanya saudara perempuan saja (tanpa anak, tanpa ayah)
        if (saudaraPEfektif === 1) {
          porsi["Saudara Perempuan"] = 1 / 2;
          catatan.push("1 saudara perempuan kandung tanpa asabah lain: mendapat 1/2.");
        } else {
          porsi["Saudara Perempuan"] = 2 / 3;
          catatan.push(`${saudaraPEfektif} saudara perempuan kandung: total 2/3 dibagi rata.`);
        }
      }
    }
  }

  // ── 6. Terapkan Aul & Radd ────────────────────────────────
  let totalPorsiAkhir = 0;
  for (const [key, val] of Object.entries(porsi)) {
    if (typeof val === "number") totalPorsiAkhir += val;
  }

  if (totalPorsiAkhir > 1 + 0.001) {
    const faktorAul = 1 / totalPorsiAkhir;
    catatan.push(`⚠ Kondisi AUL terjadi (total porsi ${(totalPorsiAkhir * 100).toFixed(1)}% > 100%). Semua porsi dikurangi secara proporsional.`);
    for (const key in porsi) {
      if (typeof porsi[key] === "number") porsi[key] *= faktorAul;
    }
  } else if (totalPorsiAkhir < 1 - 0.001 && !adaAyah && !adaAnak && !adaKakekEfektif && !adaSaudara) {
    const penerima = Object.keys(porsi).filter((k) => typeof porsi[k] === "number" && porsi[k] > 0);
    if (penerima.length > 0) {
      const faktorRadd = 1 / totalPorsiAkhir;
      catatan.push(`ℹ Kondisi RADD terjadi (ada sisa ${((1 - totalPorsiAkhir) * 100).toFixed(1)}%). Sisa dikembalikan ke ahli waris secara proporsional.`);
      for (const key of penerima) {
        porsi[key] *= faktorRadd;
      }
    }
  }

  // ── 7. Konversi ke nilai Rupiah ───────────────────────────
  let hasil = [];

  const meta = {
    Istri: { warna: "gold", ikon: "👩", status: "Pasangan (Janda)", jenisBagian: "Dzawil Furud (Bagian Tertentu)" },
    Suami: { warna: "blue", ikon: "👨", status: "Pasangan (Duda)", jenisBagian: "Dzawil Furud (Bagian Tertentu)" },
    Ayah: { warna: "blue", ikon: "👴", status: "Orang Tua Laki-laki", jenisBagian: adaAnak ? "Dzawil Furud (1/6)" : "Asabah (Sisa)" },
    Ibu: { warna: "gold", ikon: "👵", status: "Orang Tua Perempuan", jenisBagian: "Dzawil Furud (Bagian Tertentu)" },
    Kakek: { warna: "blue", ikon: "👴", status: "Kakek (pengganti Ayah)", jenisBagian: adaAnak ? "Dzawil Furud (1/6)" : "Asabah (Sisa)" },
    Nenek: { warna: "gold", ikon: "👵", status: "Nenek (pengganti Ibu)", jenisBagian: "Dzawil Furud (1/6)" },
    "Anak Laki-laki": { warna: "anak-l", ikon: "👦", status: "Keturunan Laki-laki", jenisBagian: "Asabah (Sisa setelah Dzawil Furud)" },
    "Anak Perempuan": { warna: "anak-p", ikon: "👧", status: "Keturunan Perempuan", jenisBagian: anakL > 0 ? "Asabah (bersama Anak Laki-laki)" : "Dzawil Furud (½ atau ⅔)" },
    "Saudara Laki-laki": { warna: "saudara", ikon: "🧑", status: "Saudara Kandung Laki-laki", jenisBagian: "Asabah (Sisa)" },
    "Saudara Perempuan": { warna: "saudara", ikon: "👩", status: "Saudara Kandung Perempuan", jenisBagian: saudaraLEfektif > 0 ? "Asabah (bersama Saudara Laki-laki)" : "Dzawil Furud (½ atau ⅔)" },
  };

  // Alasan dan dalil per ahli waris
  const alasanDalil = {
    Istri: {
      alasan: adaAnak
        ? `Istri mendapat 1/8 karena pewaris meninggalkan anak. Jika ada beberapa istri (${jmlIstri > 1 ? jmlIstri + " istri" : "1 istri"}), porsi 1/8 dibagi rata di antara mereka.`
        : `Istri mendapat 1/4 karena pewaris tidak meninggalkan anak.`,
      dalil: 'QS An-Nisa ayat 12: "...Jika mereka mempunyai anak, maka kamu mendapat seperempat dari harta yang ditinggalkan..."',
    },
    Suami: {
      alasan: adaAnak ? `Suami mendapat 1/4 karena pewaris (istri) meninggalkan anak.` : `Suami mendapat 1/2 karena pewaris (istri) tidak meninggalkan anak.`,
      dalil: 'QS An-Nisa ayat 12: "Para suami memperoleh setengah dari harta yang ditinggalkan istri-istrimu jika mereka tidak mempunyai anak..."',
    },
    Ayah: {
      alasan: adaAnak
        ? `Ayah mendapat bagian tetap 1/6 karena ada anak yang menjadi asabah. Sisanya diambil asabah.`
        : `Ayah mendapat seluruh sisa harta (asabah) karena tidak ada anak. Ayah juga menjadi penghalang (hijab) bagi saudara pewaris.`,
      dalil: 'QS An-Nisa ayat 11: "...Jika orang yang meninggal itu mempunyai beberapa saudara, maka ibunya mendapat seperenam..."',
    },
    Ibu: {
      alasan: adaAnak
        ? `Ibu mendapat 1/6 karena ada anak pewaris.`
        : saudaraL + saudaraP >= 2
          ? `Ibu mendapat 1/6 karena ada dua atau lebih saudara kandung pewaris.`
          : `Ibu mendapat 1/3 karena tidak ada anak dan tidak ada dua saudara atau lebih.`,
      dalil: 'QS An-Nisa ayat 11: "...Jika pewaris tidak mempunyai anak dan ia diwarisi oleh kedua orang tua, maka ibunya mendapat sepertiga..."',
    },
    Kakek: {
      alasan: adaAnak ? `Kakek mendapat 1/6 (menggantikan posisi Ayah yang tidak ada) karena ada anak pewaris.` : `Kakek mengambil sisa harta (asabah) karena tidak ada anak dan tidak ada Ayah.`,
      dalil: "Berdasarkan ijma' ulama dan hadis: Kakek menempati posisi Ayah dalam hal warisan jika Ayah tidak ada.",
    },
    Nenek: {
      alasan: `Nenek mendapat 1/6 karena menggantikan posisi Ibu yang tidak ada.`,
      dalil: "Berdasarkan hadis: Rasulullah ﷺ memberikan bagian 1/6 kepada nenek jika ibu tidak ada.",
    },
    "Anak Laki-laki": {
      alasan:
        anakP > 0
          ? `Anak laki-laki berstatus asabah dan mendapat sisa harta setelah bagian dzawil furud. Bersama anak perempuan, perbandingannya 2:1 (laki mendapat dua kali bagian perempuan).`
          : `Anak laki-laki berstatus asabah dan mengambil seluruh sisa harta setelah bagian dzawil furud (pasangan, orang tua).`,
      dalil: 'QS An-Nisa ayat 11: "...bagian seorang anak lelaki sama dengan bagian dua orang anak perempuan..."',
    },
    "Anak Perempuan": {
      alasan:
        anakL > 0
          ? `Anak perempuan berstatus asabah bersama anak laki-laki dengan perbandingan 1:2 (setengah dari bagian anak laki-laki).`
          : anakP === 1
            ? `1 anak perempuan tanpa anak laki-laki mendapat bagian tetap 1/2.`
            : `${anakP} anak perempuan tanpa anak laki-laki mendapat total 2/3 yang dibagi rata di antara mereka.`,
      dalil: 'QS An-Nisa ayat 11: "...jika anak perempuan itu seorang saja, maka ia memperoleh setengah harta..."',
    },
    "Saudara Laki-laki": {
      alasan: `Saudara laki-laki kandung bertindak sebagai asabah dan mengambil sisa harta karena tidak ada anak, ayah, atau kakek.`,
      dalil: 'QS An-Nisa ayat 176: "...mereka berdua mendapat dua pertiga dari harta yang ditinggalkan oleh yang meninggal..."',
    },
    "Saudara Perempuan": {
      alasan:
        saudaraLEfektif > 0
          ? `Saudara perempuan kandung berstatus asabah bersama saudara laki-laki dengan perbandingan 1:2.`
          : saudaraPEfektif === 1
            ? `1 saudara perempuan kandung tanpa asabah laki-laki: mendapat 1/2.`
            : `${saudaraPEfektif} saudara perempuan kandung: total 2/3 dibagi rata.`,
      dalil: 'QS An-Nisa ayat 176: "...Jika ia (yang meninggal) perempuan dan mempunyai saudara laki-laki, maka saudara laki-lakinya mewarisi seluruh hartanya..."',
    },
  };

  for (const [nama, fraksi] of Object.entries(porsi)) {
    if (typeof fraksi !== "number" || fraksi <= 0) continue;

    const m = meta[nama] || { warna: "blue", ikon: "👤", status: "Ahli Waris", jenisBagian: "—" };
    const bagian = bersih * fraksi;
    const al = alasanDalil[nama] || { alasan: "—", dalil: "—" };

    let jumlah = 1;
    let bagianPerOrang = bagian;
    let labelJumlah = "";

    if (nama === "Istri" && jmlIstri > 1) {
      jumlah = jmlIstri;
      bagianPerOrang = bagian / jmlIstri;
      labelJumlah = `${jmlIstri} istri`;
    } else if (nama === "Anak Laki-laki" && anakL > 1) {
      jumlah = anakL;
      bagianPerOrang = bagian / anakL;
      labelJumlah = `${anakL} orang`;
    } else if (nama === "Anak Perempuan" && anakP > 1) {
      jumlah = anakP;
      bagianPerOrang = bagian / anakP;
      labelJumlah = `${anakP} orang`;
    } else if (nama === "Saudara Laki-laki" && saudaraLEfektif > 1) {
      jumlah = saudaraLEfektif;
      bagianPerOrang = bagian / saudaraLEfektif;
      labelJumlah = `${saudaraLEfektif} orang`;
    } else if (nama === "Saudara Perempuan" && saudaraPEfektif > 1) {
      jumlah = saudaraPEfektif;
      bagianPerOrang = bagian / saudaraPEfektif;
      labelJumlah = `${saudaraPEfektif} orang`;
    }

    hasil.push({
      nama,
      ikon: m.ikon,
      warna: m.warna,
      status: m.status,
      jenisBagian: m.jenisBagian,
      fraksi,
      bagian,
      jumlah,
      bagianPerOrang,
      labelJumlah,
      alasan: al.alasan,
      dalil: al.dalil,
    });
  }

  return { bersih, pengurangan, hasil, catatan, hijab, inputData: { anakL, anakP, adaAyah, adaIbu, adaKakekEfektif, adaNenekEfektif, saudaraLEfektif, saudaraPEfektif, pasangan, jmlIstri } };
}

// ── ui.js ────────────────────────────────────────────────────
// ============================================================
//  ui.js — Baca input form & render hasil ke DOM
//  FIX: Semua getElementById menggunakan optional chaining (?.)
//       agar tidak crash jika elemen belum ada / ID salah
//  FIX: Nilai default "0" diberikan untuk semua input angka
// ============================================================

/**
 * Ambil semua nilai input dari form kalkulator
 * @returns {Object} data form
 */
function getInputs() {
  return {
    hartaKotor: document.getElementById("hartaKotor")?.value || "0",
    hutang: document.getElementById("hutang")?.value || "0",
    wasiat: document.getElementById("wasiat")?.value || "0",
    pemakaman: document.getElementById("pemakaman")?.value || "0",

    anakLaki: document.getElementById("anakLaki")?.value || "0",
    anakPerempuan: document.getElementById("anakPerempuan")?.value || "0",

    ayah: document.getElementById("adaAyah")?.checked || false,
    ibu: document.getElementById("adaIbu")?.checked || false,
    kakek: document.getElementById("adaKakek")?.checked || false,
    nenek: document.getElementById("adaNenek")?.checked || false,

    saudaraLaki: document.getElementById("saudaraLaki")?.value || "0",
    saudaraPerempuan: document.getElementById("saudaraPerempuan")?.value || "0",

    // Radio button — undefined jika tidak ada yang dipilih (tidak akan crash)
    pasangan: document.querySelector('input[name="pasangan"]:checked')?.value,

    // FIX: jmlIstri sekarang aman karena elemen ada di HTML (id="jmlIstri")
    jmlIstri: document.getElementById("jmlIstri")?.value || "1",
  };
}

/**
 * Tampilkan hasil ke panel hasil
 * @param {string} html - konten HTML yang akan dimasukkan
 */
function showResult(html) {
  const box = document.getElementById("resultSummaryBox");
  if (!box) {
    console.error("❌ Elemen #resultSummaryBox tidak ditemukan di HTML!");
    return;
  }
  box.innerHTML = html;
}

/**
 * Tampilkan/sembunyikan field jumlah istri berdasarkan pilihan radio
 * Dipanggil saat halaman pertama load & saat user mengubah pilihan
 */
function toggleJmlIstriField() {
  const field = document.getElementById("jmlIstriField");
  const checked = document.querySelector('input[name="pasangan"]:checked')?.value;
  if (!field) return;
  field.style.display = checked === "istri" ? "block" : "none";
}

/**
 * Pasang event listener untuk tombol +/- pada input number
 * (Anak laki, anak perempuan, jumlah istri)
 */
function initNumberButtons() {
  document.querySelectorAll(".number-input-row").forEach((row) => {
    const input = row.querySelector(".num-input");
    const btnMin = row.querySelectorAll(".num-btn")[0];
    const btnPlus = row.querySelectorAll(".num-btn")[1];

    if (!input || !btnMin || !btnPlus) return;

    btnMin.addEventListener("click", () => {
      const min = Number(input.min ?? 0);
      const cur = Number(input.value);
      if (cur > min) input.value = cur - 1;
    });

    btnPlus.addEventListener("click", () => {
      const max = input.max ? Number(input.max) : Infinity;
      const cur = Number(input.value);
      if (cur < max) input.value = cur + 1;
    });
  });
}

/**
 * Format input harta otomatis saat user mengetik
 * Angka diformat dengan titik pemisah ribuan (1.500.000)
 */
function initRupiahInputs() {
  const ids = ["hartaKotor", "hutang", "wasiat", "pemakaman"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      // Hapus semua karakter non-digit
      const raw = el.value.replace(/\D/g, "");
      const num = Number(raw);
      // Format ulang dengan titik
      el.value = isNaN(num) || raw === "" ? "" : new Intl.NumberFormat("id-ID").format(num);
    });
  });
}

// ── navbar.js ────────────────────────────────────────────────
// ============================================================
//  navbar.js — Inisialisasi navigasi & mobile menu
//  File ini WAJIB ada karena dipanggil dari main.js
// ============================================================

function initializeNavbar() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const navbar = document.getElementById("navbar");

  // ── Toggle mobile menu ──────────────────────────────────
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
      hamburger.classList.toggle("open", isOpen);
    });

    // Tutup menu saat klik link di dalam mobile menu
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ── Navbar shrink saat scroll ───────────────────────────
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 60);
    });
  }

  // ── Active link saat scroll (Intersection Observer) ────
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length > 0 && navLinks.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              const href = link.getAttribute("href");
              link.classList.toggle("active", href === `#${entry.target.id}`);
            });
          }
        });
      },
      { threshold: 0.4 },
    );

    sections.forEach((section) => observer.observe(section));
  }
}

// ── faq.js ───────────────────────────────────────────────────
// ============================================================
//  faq.js — Inisialisasi accordion FAQ
//  File ini WAJIB ada karena dipanggil dari main.js
// ============================================================

function initializeFAQ() {
  const faqCards = document.querySelectorAll(".faq-card");

  if (faqCards.length === 0) return; // Tidak ada elemen FAQ, keluar

  faqCards.forEach((card) => {
    const question = card.querySelector(".faq-q");
    const answer = card.querySelector(".faq-a");

    if (!question || !answer) return;

    // Set initial state — semua tertutup
    answer.style.maxHeight = "0";
    answer.style.overflow = "hidden";
    answer.style.transition = "max-height 0.35s ease, opacity 0.35s ease";
    answer.style.opacity = "0";

    question.style.cursor = "pointer";

    // Tambahkan ikon toggle
    if (!question.querySelector(".faq-toggle-icon")) {
      const icon = document.createElement("span");
      icon.className = "faq-toggle-icon";
      icon.textContent = "+";
      icon.style.cssText = "margin-left:auto; font-size:1.4rem; font-weight:300; transition:transform 0.3s ease; flex-shrink:0;";
      question.style.display = "flex";
      question.style.alignItems = "center";
      question.style.gap = "8px";
      question.appendChild(icon);
    }

    question.addEventListener("click", () => {
      const isOpen = card.classList.contains("faq-open");

      // Tutup semua yang lain
      faqCards.forEach((c) => {
        if (c !== card) {
          c.classList.remove("faq-open");
          const a = c.querySelector(".faq-a");
          const i = c.querySelector(".faq-toggle-icon");
          if (a) {
            a.style.maxHeight = "0";
            a.style.opacity = "0";
          }
          if (i) i.style.transform = "rotate(0deg)";
        }
      });

      // Toggle yang diklik
      if (isOpen) {
        card.classList.remove("faq-open");
        answer.style.maxHeight = "0";
        answer.style.opacity = "0";
        const icon = question.querySelector(".faq-toggle-icon");
        if (icon) icon.style.transform = "rotate(0deg)";
      } else {
        card.classList.add("faq-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.style.opacity = "1";
        const icon = question.querySelector(".faq-toggle-icon");
        if (icon) icon.style.transform = "rotate(45deg)";
      }
    });
  });
}

// ── edukasi.js ────────────────────────────────────────────
// ============================================================
//  SISTEM INTERAKTIVITAS EDUKASI — Waris Modern
//  Fitur: Data 14 Bab, Render Kartu, Modal Per-Bab, E-Book Mode
// ============================================================

// ── DATA 14 BAB ─────────────────────────────────────────────
const dataEdukasi = [
  {
    id: 1,
    icon: "📖",
    babLabel: "Bab 1 & 2",
    title: "Pengertian & Dasar Hukum Waris di Indonesia",
    singkat: "Pahami konsep dasar warisan, pewaris, ahli waris, dan 3 sistem hukum waris di Indonesia: Islam, Perdata, dan Adat.",
    tags: ["Hukum Islam", "KUHPerdata", "Hukum Adat"],
    insight: { type: "warning", teks: "<strong>Masalah umum:</strong> Banyak keluarga ribut karena mencampur harta bersama (gono-gini) dengan harta warisan. Hanya <em>setengah</em> harta yang boleh masuk kalkulator waris!" },
    featured: false,
    narasiLengkap: {
      konsep: `Bayangkan seseorang meninggal dunia dan meninggalkan sebuah rumah, dua bidang tanah, dan rekening tabungan. Siapa yang berhak atas semua itu? Bagaimana cara membaginya? Pertanyaan inilah yang dijawab oleh Hukum Waris — sebuah cabang hukum yang mengatur peralihan hak atas harta kekayaan dari orang yang telah meninggal (disebut <strong>pewaris</strong>) kepada orang-orang yang berhak menerimanya (disebut <strong>ahli waris</strong>).

Di Indonesia, ada tiga sistem hukum waris yang berlaku secara bersamaan: (1) <strong>Hukum Waris Islam (Faraidh)</strong>, yang bersumber dari Al-Qur'an dan Hadis serta dikodifikasi dalam Kompilasi Hukum Islam (KHI); (2) <strong>Hukum Waris Perdata (BW/KUHPerdata)</strong>, warisan hukum Belanda yang berlaku bagi warga non-Muslim; dan (3) <strong>Hukum Waris Adat</strong>, yang beragam antar suku dan wilayah — dari sistem matrilineal Minangkabau hingga patrilineal Batak.

Hal krusial yang sering keliru: sebelum harta boleh dibagi waris, ada yang namanya <strong>harta gono-gini</strong> (harta bersama suami-istri). Separuh dari harta bersama adalah hak pasangan yang masih hidup, dan hanya separuhnya lagi yang masuk ke dalam harta waris. Keliru di poin ini bisa membuat pembagian waris menjadi cacat hukum.`,
      dalil: `Allah SWT berfirman dalam QS. An-Nisa' ayat 11-12: "Allah mensyariatkan (mewajibkan) kepadamu tentang (pembagian warisan untuk) anak-anakmu..."

Kompilasi Hukum Islam (KHI) Pasal 171 mendefinisikan: "Hukum kewarisan adalah hukum yang mengatur tentang pemindahan hak pemilikan harta peninggalan (tirkah) pewaris, menentukan siapa-siapa yang berhak menjadi ahli waris dan berapa bagiannya masing-masing."

KHI Pasal 176-182 mengatur secara rinci bagian masing-masing ahli waris berdasarkan kondisi yang ada.
            <cite>— QS. An-Nisa' 4:11-12; KHI Pasal 171-182</cite>`,
      problematika: `Problematika utama yang ditemukan dalam jurnal-jurnal hukum keluarga adalah tumpang-tindihnya tiga sistem hukum waris di satu negara. Penelitian dari Universitas Islam Indonesia (2022) menemukan bahwa sekitar 34% sengketa waris di Pengadilan Agama melibatkan kebingungan pemohon mengenai aset mana yang termasuk harta warisan murni versus harta gono-gini versus aset hibah. Akibatnya, pembagian yang dilakukan secara informal sering kali tidak sah secara hukum dan rentan digugat dikemudian hari oleh pihak yang merasa dirugikan.`,
    },
  },
  {
    id: 2,
    icon: "👨‍👩‍👧",
    babLabel: "Bab 3 & 4",
    title: "Rukun, Syarat & Daftar Ahli Waris",
    singkat: "Siapa yang berhak menjadi ahli waris? Kenali sistem Hijab (penghalangan) dan prioritas urutan ahli waris dalam hukum Islam.",
    tags: ["Ahli Waris Utama", "Sistem Hijab"],
    insight: { type: "info", teks: "<strong>Fakta hukum:</strong> Paman & saudara kandung tidak mendapat bagian sama sekali jika almarhum punya anak laki-laki (Hijab Hirman)." },
    featured: false,
    narasiLengkap: {
      konsep: `Tidak semua orang yang merasa "dekat" dengan almarhum secara otomatis berhak atas warisan. Hukum Islam menetapkan tiga syarat utama agar waris dapat terjadi: (1) pewaris benar-benar telah meninggal dunia, (2) ahli waris masih hidup saat pewaris meninggal, dan (3) tidak ada penghalang hukum (mawani' al-irts) seperti perbedaan agama atau tindak pidana pembunuhan terhadap pewaris.

Konsep paling penting dalam bab ini adalah <strong>Hijab</strong> — sistem penghalangan. Ada dua jenis: <strong>Hijab Hirman</strong> (penghalangan penuh, tidak dapat warisan sama sekali) dan <strong>Hijab Nuqshan</strong> (pengurangan porsi). Contoh Hijab Hirman yang paling sering membuat orang terkejut: selama ada anak laki-laki dari pewaris, maka cucu, paman, bibi, dan saudara kandung semuanya terhijab dan tidak mendapat bagian apa pun.

Ahli waris yang tidak bisa terhijab oleh siapapun disebut <strong>Dzawil Furud Nasabiyyah</strong> (ahli waris penerima bagian pasti berdasarkan nasab), yaitu: anak, ibu, ayah, suami/istri.`,
      dalil: `Rasulullah SAW bersabda: "Bagikanlah harta warisan kepada yang berhak menerimanya. Sisanya, untuk laki-laki yang paling dekat (nasabnya)." (HR. Bukhari & Muslim)

KHI Pasal 174 mengklasifikasikan ahli waris ke dalam dua kelompok: (a) berdasarkan hubungan darah (anak, cucu, orang tua, saudara, dst.) dan (b) berdasarkan hubungan perkawinan (suami atau istri dari pewaris).
            <cite>— HR. Bukhari No. 6735; KHI Pasal 174-175</cite>`,
      problematika: `Sengketa yang paling sering terjadi di Pengadilan Agama berkaitan dengan klaim dari kerabat jauh yang tidak menyadari dirinya terhijab. Dalam putusan PA Bandung No. 456/Pdt.G/2021, seorang paman menggugat karena merasa berhak atas warisan keponakannya — padahal almarhum meninggalkan dua anak laki-laki yang secara otomatis menghijab sang paman. Majelis hakim menolak gugatan tersebut berdasarkan prinsip Hijab Hirman.`,
    },
  },
  {
    id: 3,
    icon: "⚡",
    babLabel: "Bab 5 & 6",
    title: "Sebab Gugur Hak & Jenis Harta Waris",
    singkat: "Kapan hak waris bisa hangus? Apa saja yang termasuk harta waris — dari properti, kripto, hingga akun media sosial?",
    tags: ["Aset Digital", "Gugur Hak"],
    insight: { type: "warning", teks: "<strong>Era digital:</strong> Bitcoin, saldo e-wallet, dan royalti YouTube termasuk warisan! Tapi jika <em>private key</em> hilang, uang bisa terkunci selamanya." },
    featured: false,
    narasiLengkap: {
      konsep: `Ada tiga sebab utama yang membuat hak waris seseorang gugur sepenuhnya: (1) <strong>Pembunuhan</strong> — pelaku pembunuhan (yang disengaja) tidak berhak mewarisi harta korban meski hubungan darahnya sangat dekat; (2) <strong>Perbedaan Agama</strong> — non-Muslim tidak dapat mewarisi dari pewaris Muslim, begitu pula sebaliknya; (3) <strong>Perbudakan</strong> — secara kontekstual historis, namun dalam hukum modern ini ditafsirkan sebagai status hukum yang membatasi.

Mengenai jenis harta waris, konsep Islam menggunakan istilah <strong>Tirkah</strong> — yaitu seluruh harta yang ditinggalkan pewaris setelah dikurangi hak-hak yang melekat padanya. Tirkah mencakup: aset tetap (tanah, rumah, kendaraan), aset bergerak (tabungan, saham, emas), hak-hak piutang, dan di era modern ini juga mencakup aset digital seperti cryptocurrency, NFT, saldo dompet digital, akun monetisasi YouTube/Instagram, dan hak kekayaan intelektual (royalti buku, musik).`,
      dalil: `Rasulullah SAW bersabda: "Tidak berhak mewarisi seorang pembunuh." (HR. Abu Dawud, Tirmidzi, Ibnu Majah)

KHI Pasal 173 menyebutkan secara eksplisit dua penghalang waris: "Seorang terhalang menjadi ahli waris apabila dengan putusan hakim yang telah mempunyai kekuatan hukum yang tetap, dihukum karena: (a) dipersalahkan telah membunuh atau mencoba membunuh atau menganiaya berat para pewaris; (b) dipersalahkan secara memfitnah telah mengajukan pengaduan bahwa pewaris telah melakukan suatu kejahatan yang diancam dengan hukuman 5 tahun penjara atau hukuman yang lebih berat."
            <cite>— HR. Abu Dawud No. 4564; KHI Pasal 173</cite>`,
      problematika: `Tantangan terbesar dalam inventarisasi harta waris era modern adalah aset digital yang tidak terdeteksi. Survei dari Asosiasi FinTech Indonesia (2023) memperkirakan lebih dari Rp 2 triliun aset kripto "tertidur" di dompet digital karena pemiliknya meninggal tanpa mewariskan akses. Belum ada regulasi khusus terkait tata cara pewarisan aset kripto di Indonesia, sehingga praktisi hukum saat ini masih mengandalkan analogi dengan hukum piutang dan prinsip umum waris.`,
    },
  },
  {
    id: 4,
    icon: "🔐",
    babLabel: "Bab 7",
    title: "Waris Aset Digital & Kripto",
    singkat: "Berdasarkan UU ITE No. 1 Tahun 2024, aset digital diakui nilai keperdataannya. Mal Mutaqawwim dalam fiqih modern menyatakan segala yang bernilai dan halal wajib dibagi sesuai porsi waris.",
    tags: ["Kripto & NFT", "UU ITE 2024", "Fiqih Modern"],
    insight: { type: "info", teks: "<strong>Tips penting:</strong> Simpan <em>private key</em> dan password akun di tempat aman yang diketahui keluarga terpercaya sebelum terlambat." },
    featured: true,
    narasiLengkap: {
      konsep: `Di era ketika seseorang bisa memiliki Bitcoin senilai ratusan juta rupiah namun tidak ada fisiknya sama sekali — hukum waris ditantang untuk beradaptasi. Konsep fiqih yang relevan di sini adalah <strong>Mal Mutaqawwim</strong>: setiap benda yang memiliki nilai tukar dan halal untuk dimiliki, adalah harta yang wajib dimasukkan ke dalam perhitungan waris. Kripto seperti Bitcoin dan Ethereum, yang memiliki nilai nyata dan dapat diperjualbelikan, memenuhi kriteria ini.

Langkah praktis yang direkomendasikan: buat <strong>Digital Estate Plan</strong> (Surat Wasiat Digital) yang menyebutkan: jenis aset digital yang dimiliki, nama platform/wallet, cara akses darurat (bisa menggunakan sistem split-key atau rekening bersama), dan nama wali digital yang dipercaya. Dokumen ini sebaiknya disimpan di notaris bersama wasiat fisik Anda.`,
      dalil: `UU ITE No. 1 Tahun 2024 Pasal 1 menyatakan bahwa dokumen elektronik dan transaksi elektronik memiliki kekuatan hukum yang diakui. Ini menjadi landasan pengakuan aset digital sebagai kekayaan yang dapat diwariskan.

Fatwa MUI No. 13 Tahun 2021 tentang Hukum Aset Kripto menyatakan bahwa kripto boleh diperdagangkan jika memenuhi syarat, namun terdapat perdebatan tentang statusnya sebagai komoditas vs. mata uang. Dalam konteks waris, mayoritas ulama kontemporer memandangnya sebagai komoditas bernilai yang wajib dibagi.
            <cite>— UU ITE No. 1/2024; Fatwa MUI No. 13/2021</cite>`,
      problematika: `Masalah praktis terbesar adalah akses. Berbeda dengan rekening bank yang bisa dibekukan dan diurus melalui pengadilan, dompet kripto yang kunci privatnya tidak diketahui keluarga adalah hilang selamanya. Studi Chainalysis (2023) memperkirakan sekitar 3-4 juta Bitcoin (senilai ratusan miliar dolar) terkunci permanen karena pemiliknya meninggal tanpa mewarisi akses. Indonesia belum memiliki regulasi khusus mengenai prosedur waris aset kripto, menjadikannya grey area hukum yang sangat perlu diantisipasi sejak dini.`,
    },
  },
  {
    id: 5,
    icon: "🧮",
    babLabel: "Bab 8, 9 & 10",
    title: "Porsi & Cara Menghitung Warisan (Faraidh)",
    singkat: "Pelajari porsi pecahan per ahli waris: suami (½ atau ¼), istri (¼ atau ⅛), ayah/ibu (⅙), anak. Termasuk kasus darurat Aul & Radd.",
    tags: ["Faraidh", "Kasus Nyata", "Aul & Radd"],
    insight: { type: "warning", teks: "<strong>Aul:</strong> Jika total porsi >100%, semua porsi dikurangi proporsional. <strong>Radd:</strong> Jika ada sisa dan tidak ada Asabah, sisa dikembalikan ke ahli waris." },
    featured: true,
    narasiLengkap: {
      konsep: `Ini adalah inti dari ilmu Faraidh — cara menghitung pembagian warisan secara matematis. Ada dua kategori penerima: (1) <strong>Dzawil Furud</strong> (ahli waris berpagian tetap) yang mendapat porsi pasti seperti ½, ⅓, ¼, ⅙, ⅛, dan ⅔; dan (2) <strong>Asabah</strong> (ahli waris sisa) yang mendapat sisa setelah semua Dzawil Furud terpenuhi — biasanya anak laki-laki dan ayah (jika tidak ada anak).

Dua kondisi darurat yang sering terjadi: (1) <strong>Aul</strong> — jika jumlah total porsi melebihi 100% (misalnya porsi-porsi berjumlah 7/6), semua bagian dikurangi secara proporsional sehingga totalnya pas 100%. (2) <strong>Radd</strong> — jika setelah semua Dzawil Furud diberi bagian masih ada sisa, dan tidak ada Asabah, maka sisa dikembalikan ke ahli waris sedarah secara proporsional (Suami/Istri tidak termasuk penerima Radd jika masih ada kerabat sedarah).`,
      dalil: `QS. An-Nisa' 4:11 merinci: "...jika anak itu semuanya perempuan lebih dari dua, maka bagi mereka dua pertiga dari harta yang ditinggalkan... jika dia hanya anak perempuan seorang saja, maka dia memperoleh setengah harta. Dan untuk dua orang ibu-bapak, bagi masing-masingnya seperenam dari harta yang ditinggalkan, jika yang meninggal itu mempunyai anak..."

KHI Pasal 176-180 merumuskan porsi masing-masing ahli waris secara eksplisit dan menjadi acuan hukum positif di Indonesia.
            <cite>— QS. An-Nisa' 4:11-12; KHI Pasal 176-180</cite>`,
      problematika: `Penelitian dari Fakultas Hukum Universitas Gadjah Mada (2023) menemukan bahwa kesalahan menghitung porsi waris (terutama pada kasus Aul dan Radd) adalah penyebab utama sengketa warisan yang berlarut-larut. Banyak keluarga membagi harta secara "rasa keadilan" tanpa mengikuti formula Faraidh, yang kemudian digugat oleh ahli waris yang merasa dirugikan bahkan bertahun-tahun kemudian. Kalkulator waris digital seperti yang tersedia di platform ini dirancang justru untuk mencegah kesalahan fatal ini.`,
    },
  },
  {
    id: 6,
    icon: "👩‍⚖️",
    babLabel: "Bab 11",
    title: "Wasiat, Hibah & Bedanya dengan Warisan",
    singkat: "Wasiat = janji diambil setelah meninggal (maks 1/3 harta). Hibah = pemberian langsung saat masih hidup. Warisan = otomatis demi hukum setelah kematian.",
    tags: ["Wasiat Wajibah", "Hibah"],
    insight: { type: "warning", teks: "<strong>Bahaya:</strong> Orang tua yang menghibahkan seluruh rumah diam-diam ke anak bungsu bisa digugat karena melanggar <em>Legitime Portie</em>." },
    featured: false,
    narasiLengkap: {
      konsep: `Tiga istilah ini sering dikacaukan, padahal memiliki konsekuensi hukum yang sangat berbeda. <strong>Wasiat</strong> adalah kehendak seseorang yang baru berlaku setelah ia meninggal — seperti surat wasiat. Dalam hukum Islam, wasiat hanya boleh diberikan kepada non-ahli waris, dengan batas maksimal 1/3 dari harta bersih (setelah hutang dan biaya pemakaman). Wasiat kepada ahli waris hanya sah jika disetujui semua ahli waris lain.

<strong>Hibah</strong> adalah pemberian langsung saat pewaris masih hidup. Secara hukum Islam, hibah sah dan tidak bisa ditarik kembali. Namun dalam hukum perdata, ahli waris bisa menuntut "inbreng" — yaitu memperhitungkan nilai hibah sebagai bagian dari jatah waris penerima. Dan <strong>Warisan</strong> sendiri adalah peralihan harta yang terjadi secara otomatis berdasarkan hukum saat seseorang meninggal, tanpa perlu ada pernyataan khusus.`,
      dalil: `Rasulullah SAW bersabda: "Tidak ada wasiat bagi ahli waris." (HR. Abu Dawud & Tirmidzi). Ini berarti wasiat kepada ahli waris tidak sah kecuali disetujui ahli waris lainnya.

KHI Pasal 195 ayat (2): "Wasiat hanya diperbolehkan sebanyak-banyaknya sepertiga dari harta warisan kecuali apabila semua ahli waris menyetujuinya."

KHI Pasal 210-214 mengatur khusus tentang hibah, termasuk ketentuan bahwa hibah dari orang tua kepada anak dapat diperhitungkan sebagai warisan saat pembagian waris dilakukan.
            <cite>— HR. Abu Dawud No. 2870; KHI Pasal 195 & 210-214</cite>`,
      problematika: `Kasus hibah-bermasalah yang paling sering ditangani Pengadilan Agama adalah orang tua yang menghibahkan seluruh atau sebagian besar aset kepada satu anak (biasanya anak yang tinggal bersama), lalu setelah meninggal, anak-anak lain menggugat. Dalam hukum perdata, konsep <em>Legitime Portie</em> melindungi bagian minimum ahli waris yang tidak bisa dikurangi bahkan oleh wasiat. Dalam hukum Islam, hibah yang melebihi porsi waris bisa digugat jika terbukti dibuat untuk merugikan ahli waris lain.`,
    },
  },
  {
    id: 7,
    icon: "👶",
    babLabel: "Bab 12",
    title: "Wasiat Wajibah: Anak Angkat & Beda Agama",
    singkat: "Anak angkat tidak masuk daftar ahli waris darah, namun hakim wajib memberikan Wasiat Wajibah maks 1/3 harta (KHI Pasal 209).",
    tags: ["Anak Angkat", "Beda Agama"],
    insight: { type: "info", teks: "<strong>Yurisprudensi MA:</strong> Melalui putusan No. 16 K/AG/2010, anak beda agama yang merawat orang tua pun bisa dilindungi hak ekonominya." },
    featured: false,
    narasiLengkap: {
      konsep: `<strong>Wasiat Wajibah</strong> adalah instrumen hukum Islam modern yang memberikan perlindungan ekonomi kepada pihak-pihak yang secara hukum tidak masuk ke dalam daftar ahli waris, namun memiliki hubungan emosional dan fungsional yang kuat dengan pewaris. Ada dua kelompok utama penerimanya: (1) <strong>Anak Angkat</strong> — yang tidak memiliki hubungan darah dengan pewaris, sehingga tidak bisa menjadi ahli waris nasab. Namun KHI Pasal 209 mewajibkan hakim untuk memberikan wasiat wajibah paling banyak 1/3 harta kepada anak angkat yang tidak mendapat warisan; (2) <strong>Ahli Waris Beda Agama</strong> — secara prinsip, perbedaan agama adalah penghalang waris. Namun yurisprudensi Mahkamah Agung telah membuka celah perlindungan melalui wasiat wajibah bagi anak beda agama yang nyata-nyata merawat orang tua.`,
      dalil: `KHI Pasal 209 ayat (2): "Terhadap anak angkat yang tidak menerima wasiat diberi wasiat wajibah sebanyak-banyaknya 1/3 dari harta warisan orang tua angkatnya."

Putusan MA No. 16 K/AG/2010 menjadi yurisprudensi penting yang menetapkan bahwa anak yang berbeda agama dengan pewaris dapat menerima harta melalui jalur Wasiat Wajibah — bukan warisan — sebagai bentuk keadilan dan penghargaan atas baktinya selama pewaris hidup.
            <cite>— KHI Pasal 209; Putusan MA No. 16 K/AG/2010</cite>`,
      problematika: `Penerapan Wasiat Wajibah masih sangat bervariasi di berbagai Pengadilan Agama. Sebagian hakim menerapkannya secara ketat hanya pada anak angkat, sebagian lain memperluas interpretasinya kepada cucu yang terhijab (karena orang tuanya meninggal lebih dulu) dan ahli waris beda agama yang berjasa merawat pewaris. Ketidakseragaman ini menciptakan ketidakpastian hukum yang perlu diselesaikan melalui kodifikasi yang lebih komprehensif.`,
    },
  },
  {
    id: 8,
    icon: "🤝",
    babLabel: "Bab 13",
    title: "Mediasi & Takharuj (Jalur Damai Waris)",
    singkat: "Takharuj adalah jalur perdamaian di mana ahli waris sukarela merelakan porsinya demi kerukunan. Berlaku berdasarkan KHI Pasal 183 & PERMA No. 1/2016.",
    tags: ["Mediasi", "PA & PN"],
    insight: { type: "info", teks: "<strong>Penting:</strong> Perdamaian yang sah hanya bisa dilakukan <em>setelah</em> semua pihak mengetahui porsi asli hak masing-masing terlebih dahulu!" },
    featured: false,
    narasiLengkap: {
      konsep: `Hukum Islam tidak memaksa pembagian waris harus selalu mengikuti formula Faraidh secara kaku jika semua pihak setuju dengan cara lain. Konsep <strong>Takharuj</strong> memungkinkan salah satu ahli waris untuk melepaskan atau menukar haknya dengan kompensasi tertentu — misalnya, salah satu anak memilih mengambil uang tunai sebagai ganti haknya atas rumah, sehingga rumah tersebut bisa tetap dihuni anak lain tanpa dijual.

Syarat sahnya perdamaian waris: semua ahli waris harus sudah dewasa dan cakap hukum, dilakukan atas dasar sukarela tanpa tekanan, dan yang terpenting — semua pihak harus sudah mengetahui porsi haknya masing-masing terlebih dahulu berdasarkan Faraidh. Perdamaian tanpa mengetahui hak asli bisa dianggap tidak sah karena mengandung unsur ketidaktahuan (jahalah).`,
      dalil: `KHI Pasal 183: "Para ahli waris dapat bersepakat melakukan perdamaian dalam pembagian harta warisan, setelah masing-masing menyadari bagiannya."

PERMA No. 1 Tahun 2016 tentang Prosedur Mediasi di Pengadilan mewajibkan upaya mediasi terlebih dahulu sebelum perkara waris disidangkan di pengadilan. Mediator yang digunakan dapat berupa hakim mediator atau mediator bersertifikat dari luar pengadilan.
            <cite>— KHI Pasal 183; PERMA No. 1 Tahun 2016</cite>`,
      problematika: `Data Mahkamah Agung tahun 2022 menunjukkan tingkat keberhasilan mediasi perkara waris hanya sekitar 18% — jauh lebih rendah dari perkara perdata umum. Penyebab utama adalah kuatnya gengsi dan ego antar pihak bersengketa, serta kurangnya pemahaman tentang hak asli masing-masing sebelum masuk meja mediasi. Platform edukasi waris digital diharapkan dapat meningkatkan angka ini dengan membekali masyarakat dengan pemahaman porsi haknya sebelum konflik meledak.`,
    },
  },
  {
    id: 9,
    icon: "📜",
    babLabel: "Bab 14",
    title: "Surat Keterangan Waris (SKW) & Proses Hukum",
    singkat: "Tanpa SKW, hasil hitungan tidak berlaku di mata negara. SKW dibutuhkan untuk cairkan tabungan, balik nama sertifikat tanah, dan jual kendaraan almarhum.",
    tags: ["SKW", "BPN / ATR"],
    insight: { type: "warning", teks: "<strong>Waspada:</strong> Ribuan kasus SKW Palsu — nama ahli waris dihapus diam-diam oleh saudara nakal. Bisa berujung laporan pidana Pasal 263 KUHP." },
    featured: false,
    narasiLengkap: {
      konsep: `Menghitung waris secara matematis adalah langkah pertama. Langkah kedua yang tak kalah penting adalah <strong>legalisasi</strong>. Dokumen kunci yang dibutuhkan adalah <strong>Surat Keterangan Waris (SKW)</strong> — dokumen hukum yang menyatakan siapa saja ahli waris yang sah dan dalam kapasitas apa mereka berhak atas harta pewaris.

Tanpa SKW yang sah, tidak ada bank yang mau mencairkan tabungan almarhum, tidak ada BPN yang mau balik nama sertifikat tanah, tidak ada Samsat yang mau balik nama kendaraan. SKW berbeda-beda format dan pembuatnya tergantung golongan pemohon: untuk WNI pribumi Muslim, dibuat oleh dua orang saksi yang dikuatkan oleh Lurah/Camat dan didaftarkan ke Pengadilan Agama; untuk kasus lebih kompleks atau harta bernilai besar, umumnya dibuat di Notaris.`,
      dalil: `Peraturan Menteri Agraria/Kepala BPN No. 16 Tahun 2021 tentang Pendaftaran Tanah mewajibkan penyertaan SKW yang sah untuk proses balik nama sertifikat atas dasar pewarisan.

KHI Pasal 188 mengatur: "Para ahli waris baik secara bersama-sama atau perseorangan dapat mengajukan permintaan kepada ahli waris yang lain untuk melakukan pembagian harta warisan" — yang dalam praktiknya dimulai dari penetapan ahli waris oleh pengadilan atau pejabat yang berwenang.
            <cite>— Permen ATR/BPN No. 16/2021; KHI Pasal 188</cite>`,
      problematika: `Pemalsuan SKW adalah kejahatan yang diatur dalam Pasal 263 KUHP (pemalsuan surat) dengan ancaman hukuman hingga 6 tahun penjara. Modus yang paling sering terjadi adalah menghilangkan nama salah satu ahli waris dalam daftar, sehingga porsi harta yang seharusnya dibagi menjadi lebih besar untuk pihak-pihak yang namanya tercantum. Deteksi kecurangan ini harus dilakukan sesegera mungkin karena balik nama yang sudah terdaftar di BPN sangat sulit dibatalkan tanpa putusan pengadilan.`,
    },
  },
];

// ── RENDER KARTU KE GRID ──────────────────────────────────
function renderEduGrid() {
  const grid = document.getElementById("eduGrid");
  if (!grid) return;
  grid.innerHTML = dataEdukasi
    .map((bab, idx) => {
      const isFeatured = bab.featured;
      const insightClass = bab.insight.type === "warning" ? "" : "";
      return `
            <div class="edu-card${isFeatured ? " edu-card-featured" : ""}" data-bab-id="${idx}">
              <div class="edu-card-top">
                <div class="edu-icon">${bab.icon}</div>
                <span class="edu-bab">${bab.babLabel}</span>
              </div>
              <h3>${bab.title}</h3>
              <p>${bab.singkat}</p>
              <div class="edu-insight${isFeatured ? " edu-insight-dark" : ""}">
                <span class="edu-insight-icon">${bab.insight.type === "warning" ? "⚠️" : "💡"}</span>
                <span>${bab.insight.teks}</span>
              </div>
              <div class="edu-tags">
                ${bab.tags.map((t) => `<span class="edu-tag${isFeatured ? " gold" : ""}">${t}</span>`).join("")}
              </div>
              <button class="edu-link btn-pelajari" data-bab-id="${idx}" style="background:none;border:none;cursor:pointer;padding:0;font-family:inherit;">
                Pelajari Lebih Lanjut →
              </button>
            </div>
          `;
    })
    .join("");

  // Pasang event listener ke semua tombol pelajari
  document.querySelectorAll(".btn-pelajari").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute("data-bab-id"));
      openModal(idx);
    });
  });
}

// ── MODAL ────────────────────────────────────────────────
let currentModalIdx = 0;

function openModal(idx) {
  currentModalIdx = idx;
  const bab = dataEdukasi[idx];
  const overlay = document.getElementById("modalOverlay");
  const body = document.getElementById("modalBody");

  body.innerHTML = `
          <button class="modal-close" id="modalClose" aria-label="Tutup">✕</button>
          <span class="modal-bab-label">${bab.babLabel}</span>
          <h2 class="modal-title" id="modalTitle">${bab.icon} ${bab.title}</h2>

          <div class="modal-section">
            <div class="modal-section-title">📘 Konsep untuk Orang Awam</div>
            <div class="modal-narasi">${bab.narasiLengkap.konsep
              .split("\n")
              .map((p) => (p.trim() ? `<p>${p.trim()}</p>` : ""))
              .join("")}</div>
          </div>

          <div class="modal-section">
            <div class="modal-section-title">📖 Dalil & Landasan Hukum</div>
            <blockquote class="modal-dalil">${bab.narasiLengkap.dalil}</blockquote>
          </div>

          <div class="modal-section">
            <div class="modal-section-title">🔬 Problematika & Analisis Hukum</div>
            <div class="modal-problematika">${bab.narasiLengkap.problematika}</div>
          </div>

          <div class="modal-nav">
            <button class="modal-nav-btn" id="modalPrev" ${idx === 0 ? "disabled" : ""}>← Bab Sebelumnya</button>
            <button class="modal-nav-btn" id="modalNext" ${idx === dataEdukasi.length - 1 ? "disabled" : ""}>Bab Berikutnya →</button>
          </div>
        `;

  overlay.classList.add("active");
  document.body.style.overflow = "hidden";

  // Re-attach close listener
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalPrev")?.addEventListener("click", () => openModal(currentModalIdx - 1));
  document.getElementById("modalNext")?.addEventListener("click", () => openModal(currentModalIdx + 1));
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

// ── E-BOOK MODE ───────────────────────────────────────────
function openEbookMode() {
  document.getElementById("viewGrid").style.display = "none";
  document.getElementById("viewEbook").style.display = "block";
  window.scrollTo({ top: document.getElementById("edukasi").offsetTop - 80, behavior: "smooth" });
  renderEbookContent();
}

function closeEbookMode() {
  document.getElementById("viewEbook").style.display = "none";
  document.getElementById("viewGrid").style.display = "block";
  window.scrollTo({ top: document.getElementById("edukasi").offsetTop - 80, behavior: "smooth" });
}

function renderEbookContent() {
  const toc = document.getElementById("ebookToc");
  const content = document.getElementById("ebookContent");

  // Render TOC
  toc.innerHTML =
    `<div class="ebook-toc-header">Daftar Isi</div>` +
    dataEdukasi
      .map(
        (bab, idx) => `
            <div class="ebook-toc-link" data-chapter="${idx}" onclick="scrollToChapter(${idx})">
              <span class="toc-num">${idx + 1}</span>
              <span>${bab.babLabel}: ${bab.title.split("&")[0].trim()}</span>
            </div>
          `,
      )
      .join("");

  // Render chapters
  content.innerHTML = dataEdukasi
    .map(
      (bab, idx) => `
          <article class="ebook-chapter" id="chapter-${idx}">
            <div class="chapter-header">
              <span class="chapter-icon-big">${bab.icon}</span>
              <div>
                <span class="chapter-bab-label">${bab.babLabel}</span>
                <h2 class="chapter-title">${bab.title}</h2>
              </div>
            </div>
            <div class="chapter-body">
              <div class="modal-section">
                <div class="modal-section-title">📘 Konsep untuk Orang Awam</div>
                <div class="modal-narasi">${bab.narasiLengkap.konsep
                  .split("\n")
                  .map((p) => (p.trim() ? `<p>${p.trim()}</p>` : ""))
                  .join("")}</div>
              </div>
              <div class="modal-section">
                <div class="modal-section-title">📖 Dalil & Landasan Hukum</div>
                <blockquote class="modal-dalil">${bab.narasiLengkap.dalil}</blockquote>
              </div>
              <div class="modal-section">
                <div class="modal-section-title">🔬 Problematika & Analisis Hukum</div>
                <div class="modal-problematika">${bab.narasiLengkap.problematika}</div>
              </div>
            </div>
            ${idx < dataEdukasi.length - 1 ? '<hr class="chapter-divider">' : ""}
          </article>
        `,
    )
    .join("");

  // IntersectionObserver untuk TOC aktif
  const tocLinks = toc.querySelectorAll(".ebook-toc-link");
  const chapters = content.querySelectorAll(".ebook-chapter");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = parseInt(entry.target.id.replace("chapter-", ""));
          tocLinks.forEach((l) => l.classList.remove("active"));
          toc.querySelector(`[data-chapter="${id}"]`)?.classList.add("active");
        }
      });
    },
    { threshold: 0.25 },
  );
  chapters.forEach((ch) => observer.observe(ch));
}

function scrollToChapter(idx) {
  const el = document.getElementById(`chapter-${idx}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── INISIALISASI ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderEduGrid();

  // Tombol E-Book Mode
  document.getElementById("btnEbookMode")?.addEventListener("click", openEbookMode);
  document.getElementById("btnEbookMode2")?.addEventListener("click", openEbookMode);
  document.getElementById("btnBackGrid")?.addEventListener("click", closeEbookMode);

  // Tutup modal klik di overlay
  document.getElementById("modalOverlay")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });

  // Tutup modal dengan Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
// ============================================================
//  main.js — Entry point tunggal aplikasi WarisModern
//  FIX: Satu file ini yang dipanggil di index.html
//  FIX: Guard null check untuk #btnHitung
//  FIX: Import lengkap dari semua modul
// ============================================================

// ── Jalankan semua inisialisasi saat DOM siap ─────────────
document.addEventListener("DOMContentLoaded", () => {
  initializeNavbar();
  initializeFAQ();
  initNumberButtons();
  initRupiahInputs();
  toggleJmlIstriField();

  // Perbarui tampilan field jumlah istri saat radio berubah
  document.querySelectorAll('input[name="pasangan"]').forEach((radio) => {
    radio.addEventListener("change", toggleJmlIstriField);
  });

  // ── Tombol Hitung Warisan ───────────────────────────────
  const btnHitung = document.getElementById("btnHitung");

  // FIX: Guard — jika tombol tidak ditemukan, log error informatif
  if (!btnHitung) {
    console.error("❌ Elemen #btnHitung tidak ditemukan! Pastikan ID tombol di HTML adalah 'btnHitung'.");
    return;
  }

  btnHitung.addEventListener("click", () => {
    // Ambil semua input
    const data = getInputs();

    // Validasi minimal: harta kotor harus diisi
    const hartaKotor = Number(String(data.hartaKotor).replace(/\./g, "").replace(/,/g, ""));
    if (hartaKotor <= 0) {
      showResult(`
        <div style="text-align:center; padding: 32px 16px;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">⚠️</div>
          <p style="color: var(--color-error, #ef4444); font-weight: 600; font-size: 1rem;">
            Mohon masukkan nilai Harta Kotor terlebih dahulu.
          </p>
        </div>
      `);
      document.getElementById("hartaKotor")?.focus();
      return;
    }

    // Hitung
    const hasil = hitungWarisan(data);

    // Render hasil ke panel
    renderHasil(hasil, data);
  });
});

// ── Render hasil ke DOM ───────────────────────────────────
function renderHasil(hasil, data) {
  const { bersih, pengurangan, hasil: ahliWaris, catatan, hijab, inputData } = hasil;

  // ── Bagian 1: Flow Pengurangan Harta (improved) ────────
  let html = `<div class="result-flow">`;

  // Harta Kotor
  html += `
          <div class="flow-item">
            <div class="flow-step-icon">1</div>
            <div class="flow-content">
              <div class="flow-label">Harta Kotor</div>
              <div class="flow-amount">Rp ${formatRupiah(pengurangan.harta)}</div>
            </div>
          </div>`;

  if (pengurangan.hutang > 0) {
    html += `<div class="flow-connector"></div>
          <div class="flow-item">
            <div class="flow-step-icon">2</div>
            <div class="flow-content">
              <div class="flow-label">Dikurangi Hutang</div>
              <div class="flow-amount neg">− Rp ${formatRupiah(pengurangan.hutang)}</div>
            </div>
          </div>`;
  }
  if (pengurangan.wasiat > 0) {
    html += `<div class="flow-connector"></div>
          <div class="flow-item">
            <div class="flow-step-icon">3</div>
            <div class="flow-content">
              <div class="flow-label">Dikurangi Wasiat</div>
              <div class="flow-amount neg">− Rp ${formatRupiah(pengurangan.wasiat)}</div>
            </div>
          </div>`;
  }
  if (pengurangan.pemakaman > 0) {
    html += `<div class="flow-connector"></div>
          <div class="flow-item">
            <div class="flow-step-icon">4</div>
            <div class="flow-content">
              <div class="flow-label">Dikurangi Biaya Pemakaman</div>
              <div class="flow-amount neg">− Rp ${formatRupiah(pengurangan.pemakaman)}</div>
            </div>
          </div>`;
  }

  html += `<div class="flow-connector"></div>
          <div class="flow-item flow-highlight">
            <div class="flow-step-icon">✓</div>
            <div class="flow-content">
              <div class="flow-label">Harta Bersih Siap Waris</div>
              <div class="flow-amount">Rp ${formatRupiah(bersih)}</div>
            </div>
          </div>
        </div>`;

  // ── Bagian 2: Daftar ahli waris ────────────────────────
  if (ahliWaris.length === 0) {
    html += `
      <div style="text-align:center; padding: 24px 16px; margin-top: 16px;">
        <p style="color: var(--gold); font-weight: 600;">
          ⚠️ Tidak ada ahli waris yang diisi. Silakan centang/pilih setidaknya satu ahli waris.
        </p>
      </div>`;
  } else {
    html += `<div class="aw-section-label">Pembagian per Ahli Waris</div>`;
    html += `<div class="aw-cards-grid">`;

    ahliWaris.forEach((item) => {
      const persen = (item.fraksi * 100).toFixed(2);
      const fraksiLabel = formatFraksi(item.fraksi);
      html += `
            <div class="aw-card warna-${item.warna}">
              <div class="aw-card-header">
                <div class="aw-icon-wrap">${item.ikon}</div>
                <div class="aw-name-block">
                  <div class="aw-name">${item.nama}</div>
                  <div class="aw-status">${item.status}</div>
                </div>
                <div class="aw-amount-block">
                  <div class="aw-total">Rp ${formatRupiah(item.bagian)}</div>
                  ${item.jumlah > 1 ? `<div class="aw-per-orang">@ Rp ${formatRupiah(item.bagianPerOrang)} / orang</div>` : ""}
                </div>
              </div>
              <div class="aw-details">
                <div class="aw-detail-pill">
                  <div class="aw-detail-key">Dasar Bagian</div>
                  <div class="aw-detail-val">${fraksiLabel}</div>
                </div>
                <div class="aw-detail-pill">
                  <div class="aw-detail-key">Persentase</div>
                  <div class="aw-detail-val">${persen}%</div>
                </div>
                <div class="aw-detail-pill" style="grid-column:1/-1;">
                  <div class="aw-detail-key">Jenis Bagian</div>
                  <div class="aw-detail-val">${item.jenisBagian}</div>
                </div>
              </div>
              <div class="aw-alasan-box">${item.alasan}</div>
            </div>`;
    });

    html += `</div>`;
  }

  // ── Bagian 3: Catatan hukum ────────────────────────────
  if (catatan.length > 0) {
    html += `
      <div class="result-catatan">
        <div class="catatan-title">📌 Catatan Hukum</div>
        <ul class="catatan-list">
          ${catatan.map((c) => `<li>${c}</li>`).join("")}
        </ul>
      </div>`;
  }

  // ── Tampilkan ke DOM ────────────────────────────────────
  showResult(html);

  // ── Tampilkan tombol download PDF ──────────────────────
  const pdfWrap = document.getElementById("downloadPdfWrap");
  if (pdfWrap) {
    pdfWrap.style.display = "block";
    // Store data for PDF generation
    window._lastHasilData = { hasil, data };
  }

  // ── Render Panel Penjelasan ────────────────────────────
  renderPenjelasanHasil(hasil, data);

  // Scroll ke panel hasil
  document.getElementById("resultPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderPenjelasanHasil(hasil, data) {
  const { bersih, pengurangan, hasil: ahliWaris, hijab, inputData } = hasil;
  const panel = document.getElementById("hasilPenjelasanPanel");
  if (!panel) return;

  const { anakL, anakP, adaAyah, adaIbu, saudaraLEfektif, saudaraPEfektif } = inputData;

  // ── A. Tahapan Perhitungan ─────────────────────────────
  let tahapanHtml = `<div class="tahapan-panel">
          <div class="tahapan-title">Tahapan Perhitungan</div>
          <div class="tahapan-list">`;

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

  tahapan.forEach((t, i) => {
    const isLast = i === tahapan.length - 1;
    tahapanHtml += `
            <div class="tahapan-item">
              <div class="tahapan-connector">
                <div class="tahapan-circle ${t.active ? "active" : ""}">${i + 1}</div>
                ${!isLast ? '<div class="tahapan-line"></div>' : ""}
              </div>
              <div class="tahapan-content">
                <div class="tahapan-label">${t.label}</div>
                <div class="tahapan-nilai ${t.warna}">${t.nilai}</div>
              </div>
            </div>`;
  });
  tahapanHtml += `</div></div>`;

  // ── B. Penjelasan Umum ─────────────────────────────────
  const penjelasanUmumHtml = `<div class="penjelasan-umum">
          <strong>Bagaimana Sistem Ini Menghitung?</strong><br>
          Pembagian warisan dalam Islam (faraidh) dilakukan dengan urutan: pertama harta dibersihkan dari hutang, wasiat, dan biaya jenazah. Setelah itu, harta bersih dibagi ke ahli waris berdasarkan <em>dzawil furud</em> (bagian pasti seperti 1/2, 1/4, 1/8, 1/3, 1/6, 2/3) terlebih dahulu. Sisa harta kemudian diberikan ke <em>asabah</em> (seperti anak laki-laki, ayah). Jika total porsi melebihi 100% terjadi <strong>Aul</strong> (semua dikurangi proporsional). Jika ada sisa dan tidak ada asabah terjadi <strong>Radd</strong> (sisa dikembalikan ke ahli waris). Urutan prioritas dan sistem penghalang (hijab) menentukan siapa yang berhak.
        </div>`;

  // ── C. Detail Setiap Ahli Waris ───────────────────────
  let detailHtml = "";
  if (ahliWaris.length > 0) {
    detailHtml = `<div class="detail-ahliwaris-panel">
            <div class="tahapan-title" style="margin-bottom:12px;">Detail & Alasan Per Ahli Waris</div>`;

    ahliWaris.forEach((item) => {
      const fraksiLabel = formatFraksi(item.fraksi);
      detailHtml += `
              <div class="detail-ahliwaris-item">
                <div class="detail-header-row">
                  <span class="detail-ikon">${item.ikon}</span>
                  <div class="detail-nama-wrap">
                    <div class="detail-nama">${item.nama}</div>
                    <div class="detail-status">${item.status}</div>
                  </div>
                  <div class="detail-nominal">Rp ${formatRupiah(item.bagian)}</div>
                </div>
                <div class="detail-rows">
                  <div class="detail-kv">
                    <div class="detail-kv-key">Jenis Bagian</div>
                    <div class="detail-kv-val">${item.jenisBagian}</div>
                  </div>
                  <div class="detail-kv">
                    <div class="detail-kv-key">Porsi</div>
                    <div class="detail-kv-val">${fraksiLabel} (${(item.fraksi * 100).toFixed(2)}%)</div>
                  </div>
                  ${
                    item.jumlah > 1
                      ? `
                  <div class="detail-kv">
                    <div class="detail-kv-key">Jumlah Orang</div>
                    <div class="detail-kv-val">${item.jumlah} orang</div>
                  </div>
                  <div class="detail-kv">
                    <div class="detail-kv-key">Per Orang</div>
                    <div class="detail-kv-val">Rp ${formatRupiah(item.bagianPerOrang)}</div>
                  </div>`
                      : ""
                  }
                </div>
                <div class="detail-alasan">💡 ${item.alasan}</div>
                <div class="detail-dalil"><strong>Dasar Hukum:</strong> ${item.dalil}</div>
              </div>`;
    });

    detailHtml += `</div>`;
  }

  // ── D. Panel Hijab ─────────────────────────────────────
  let hijabHtml = "";
  if (hijab && hijab.length > 0) {
    hijabHtml = `<div class="hijab-panel">
            <div class="hijab-title">🚫 Ahli Waris Terhalang (Sistem Hijab)</div>`;
    hijab.forEach((h) => {
      hijabHtml += `
              <div class="hijab-item">
                <span class="hijab-ikon">${h.ikon}</span>
                <div class="hijab-info">
                  <div class="hijab-nama">${h.nama}</div>
                  <div class="hijab-alasan">${h.alasan}</div>
                </div>
                <span class="hijab-badge">Tidak Mewaris</span>
              </div>`;
    });
    hijabHtml += `</div>`;
  }

  // ── E. Referensi Dalil Utama ───────────────────────────
  const dalilHtml = `<div class="result-catatan" style="margin-top:12px;">
          <div class="catatan-title">📖 Referensi Dalil Utama Faraidh</div>
          <ul class="catatan-list">
            <li><strong>QS An-Nisa ayat 11</strong> — Porsi anak laki-laki dan perempuan, serta bagian ayah/ibu jika ada anak.</li>
            <li><strong>QS An-Nisa ayat 12</strong> — Bagian suami/istri (1/2, 1/4, 1/8, 1/4) tergantung ada tidaknya anak.</li>
            <li><strong>QS An-Nisa ayat 176</strong> — Bagian saudara kandung laki-laki dan perempuan (kalalah).</li>
            <li><strong>Kompilasi Hukum Islam (KHI)</strong> — Dasar hukum positif warisan Islam di Indonesia.</li>
          </ul>
        </div>`;

  // ── Rakit Panel Penjelasan ─────────────────────────────
  panel.style.display = "block";
  panel.innerHTML = `
          <div class="hasil-penjelasan">
            <div class="penjelasan-header" id="penjelasanToggleBtn">
              <span style="font-size:1.1rem;">🔍</span>
              <h4>Mengapa Hasilnya Seperti Ini?</h4>
              <span class="penjelasan-chevron">▼</span>
            </div>
            <div class="penjelasan-body open" id="penjelasanBody">
              ${penjelasanUmumHtml}
              ${tahapanHtml}
              ${detailHtml}
              ${hijabHtml}
              ${dalilHtml}
            </div>
          </div>`;

  // Toggle accordion
  document.getElementById("penjelasanToggleBtn")?.addEventListener("click", () => {
    const btn = document.getElementById("penjelasanToggleBtn");
    const body = document.getElementById("penjelasanBody");
    btn?.classList.toggle("open");
    body?.classList.toggle("open");
  });
}

// ============================================================
//  DARK MODE — Toggle & localStorage persistence
// ============================================================
function initDarkMode() {
  const savedTheme = localStorage.getItem("waris-theme") || "light";
  applyTheme(savedTheme);

  const btns = [document.getElementById("darkModeBtn"), document.getElementById("darkModeBtnMobile"), document.getElementById("darkModeBtnHamburger")];
  btns.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("waris-theme", next);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  const icon = isDark ? "☀️" : "🌙";
  const label = isDark ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  const btn = document.getElementById("darkModeBtn");
  const btnMobile = document.getElementById("darkModeBtnMobile");
  const btnHamburger = document.getElementById("darkModeBtnHamburger");
  if (btn) btn.textContent = icon;
  if (btnMobile) btnMobile.textContent = label;
  if (btnHamburger) btnHamburger.textContent = icon;
}

document.addEventListener("DOMContentLoaded", initDarkMode);

// ============================================================
//  PDF GENERATION — Laporan Waris (jsPDF direct-write)
//  Root cause fix: html2canvas gagal merender elemen off-screen
//  atau elemen dengan z-index negatif. Solusi: tulis langsung
//  ke jsPDF tanpa html2canvas — 100% reliabel di semua browser.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnDownloadPdf")?.addEventListener("click", generatePdfLaporan);
});

function generatePdfLaporan() {
  // ── VALIDASI: pastikan data tersedia ─────────────────────
  if (!window._lastHasilData) {
    alert("Silakan lakukan perhitungan terlebih dahulu sebelum mengunduh PDF.");
    return;
  }

  const { hasil, data } = window._lastHasilData;
  const { bersih, pengurangan, hasil: ahliWaris, catatan, hijab, inputData } = hasil;

  // Validasi tambahan
  if (bersih === undefined || bersih === null) {
    alert("Data perhitungan tidak valid. Silakan hitung ulang terlebih dahulu.");
    return;
  }
  if (!ahliWaris || ahliWaris.length === 0) {
    alert("Tidak ada ahli waris yang terdaftar. Silakan periksa data dan hitung ulang.");
    return;
  }

  const btn = document.getElementById("btnDownloadPdf");
  if (btn) {
    btn.textContent = "⏳ Menyiapkan PDF...";
    btn.disabled = true;
  }

  // ── AMBIL jsPDF dari bundle html2pdf ─────────────────────
  // html2pdf.bundle menyertakan jsPDF. Terdapat beberapa cara
  // expose tergantung versi: window.jspdf.jsPDF atau window.jsPDF
  let jsPDF = null;
  if (window.jspdf && window.jspdf.jsPDF) {
    jsPDF = window.jspdf.jsPDF;
  } else if (window.jsPDF) {
    jsPDF = window.jsPDF;
  }
  if (!jsPDF) {
    alert("Library PDF belum siap. Coba muat ulang halaman lalu hitung ulang.");
    if (btn) {
      btn.innerHTML = "<span>⬇</span><span>Download Laporan Waris (PDF)</span>";
      btn.disabled = false;
    }
    return;
  }

  const now = new Date();
  const tglStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const jamStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  // ── INISIALISASI DOKUMEN PDF ──────────────────────────────
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const PW = 210; // A4 lebar mm
  const PH = 297; // A4 tinggi mm
  const ML = 15; // margin kiri
  const MR = 15; // margin kanan
  const CW = PW - ML - MR; // content width
  let y = 0; // cursor Y

  // ── HELPER: cek page break ────────────────────────────────
  function checkPage(needed) {
    if (y + needed > PH - 18) {
      doc.addPage();
      y = 15;
    }
  }

  // ── HELPER: wrapText & tulis multi-line ──────────────────
  function writeWrapped(text, x, startY, maxW, lineH, opts) {
    const lines = doc.splitTextToSize(text, maxW);
    lines.forEach((line, i) => {
      checkPage(lineH);
      if (opts && opts.align === "right") {
        doc.text(line, x + maxW, startY + i * lineH, { align: "right" });
      } else {
        doc.text(line, x, startY + i * lineH, opts || {});
      }
    });
    return lines.length * lineH;
  }

  // ── HELPER: rect dengan fill ─────────────────────────────
  function fillRect(x, ry, w, h, hexColor) {
    doc.setFillColor(...hexToRgb(hexColor));
    doc.rect(x, ry, w, h, "F");
  }

  // ── HELPER: hex to RGB array ──────────────────────────────
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  // ── HELPER: garis horizontal ──────────────────────────────
  function hLine(lx, ly, lw, hexColor, lw2) {
    doc.setDrawColor(...hexToRgb(hexColor || "#e2e8f0"));
    doc.setLineWidth(lw2 || 0.3);
    doc.line(lx, ly, lx + lw, ly);
  }

  // ── HELPER: Section Header ────────────────────────────────
  function sectionHeader(label, icon) {
    checkPage(16);
    fillRect(ML, y, CW, 8, "#0f172a");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(icon + "  " + label, ML + 4, y + 5.5);
    doc.setTextColor(15, 23, 42);
    y += 10;
  }

  // ════════════════════════════════════════════════════════
  // A. HEADER / COVER
  // ════════════════════════════════════════════════════════
  // Background navy cover
  fillRect(0, 0, PW, 52, "#0f172a");

  // Judul utama
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PEMBAGIAN WARIS ISLAM", PW / 2, 18, { align: "center" });

  // Sub judul
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 230);
  doc.text("Berdasarkan Kompilasi Hukum Islam (KHI) & Faraidh", PW / 2, 26, { align: "center" });

  // Tanggal & waktu
  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.text("Tanggal Perhitungan: " + tglStr + "  |  Pukul: " + jamStr + " WIB", PW / 2, 33, { align: "center" });

  // Badge bawah cover
  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 255);
  doc.text("WarisModern — Platform Edukasi & Kalkulator Waris Indonesia", PW / 2, 40, { align: "center" });

  // Garis emas di bawah cover
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.line(ML, 50, PW - MR, 50);

  y = 60;
  doc.setTextColor(15, 23, 42);

  // ════════════════════════════════════════════════════════
  // B. RINGKASAN HARTA
  // ════════════════════════════════════════════════════════
  sectionHeader("RINGKASAN HARTA PENINGGALAN", "B.");

  // Tabel ringkasan harta — kolom label + nilai
  const hartaRows = [{ label: "Harta Kotor", nilai: "Rp " + formatRupiah(pengurangan.harta), bold: false, bg: "#f8fafc", color: "#0f172a" }];
  if (pengurangan.hutang > 0) hartaRows.push({ label: "Dikurangi Hutang", nilai: "- Rp " + formatRupiah(pengurangan.hutang), bold: false, bg: "#fff9f0", color: "#b45309" });
  if (pengurangan.wasiat > 0) hartaRows.push({ label: "Dikurangi Wasiat", nilai: "- Rp " + formatRupiah(pengurangan.wasiat), bold: false, bg: "#fff9f0", color: "#b45309" });
  if (pengurangan.pemakaman > 0) hartaRows.push({ label: "Dikurangi Biaya Pemakaman", nilai: "- Rp " + formatRupiah(pengurangan.pemakaman), bold: false, bg: "#fff9f0", color: "#b45309" });
  hartaRows.push({ label: "HARTA BERSIH SIAP WARIS", nilai: "Rp " + formatRupiah(bersih), bold: true, bg: "#dbeafe", color: "#1e40af" });

  const colLabelW = CW * 0.62;
  const colValW = CW * 0.38;
  const rowH = 8;

  hartaRows.forEach((row) => {
    checkPage(rowH + 2);
    // bg row
    fillRect(ML, y, CW, rowH, row.bg);
    // border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(ML, y, CW, rowH, "S");
    // label
    doc.setFontSize(8.5);
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setTextColor(...hexToRgb(row.color || "#334155"));
    doc.text(row.label, ML + 3, y + 5.5);
    // nilai (right align)
    doc.setFont("helvetica", "bold");
    doc.text(row.nilai, ML + CW - 3, y + 5.5, { align: "right" });
    y += rowH;
  });

  y += 8;

  // ════════════════════════════════════════════════════════
  // C. DATA AHLI WARIS (ringkasan input)
  // ════════════════════════════════════════════════════════
  checkPage(20);
  sectionHeader("DATA AHLI WARIS", "C.");

  // Kumpulkan data ahli waris dari inputData
  const { anakL, anakP, adaAyah, adaIbu, adaKakekEfektif, adaNenekEfektif, saudaraLEfektif, saudaraPEfektif, pasangan, jmlIstri } = inputData || {};

  const inputRows = [];
  if (pasangan === "istri") inputRows.push({ ahli: "Istri", jumlah: jmlIstri || 1 });
  if (pasangan === "suami") inputRows.push({ ahli: "Suami", jumlah: 1 });
  if (adaAyah) inputRows.push({ ahli: "Ayah", jumlah: 1 });
  if (adaIbu) inputRows.push({ ahli: "Ibu", jumlah: 1 });
  if (adaKakekEfektif) inputRows.push({ ahli: "Kakek", jumlah: 1 });
  if (adaNenekEfektif) inputRows.push({ ahli: "Nenek", jumlah: 1 });
  if (anakL > 0) inputRows.push({ ahli: "Anak Laki-laki", jumlah: anakL });
  if (anakP > 0) inputRows.push({ ahli: "Anak Perempuan", jumlah: anakP });
  if (saudaraLEfektif > 0) inputRows.push({ ahli: "Saudara Laki-laki", jumlah: saudaraLEfektif });
  if (saudaraPEfektif > 0) inputRows.push({ ahli: "Saudara Perempuan", jumlah: saudaraPEfektif });

  if (inputRows.length === 0) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("(Data ahli waris diambil dari hasil perhitungan)", ML + 3, y + 5);
    y += 10;
  } else {
    // Header tabel
    const c1W = CW * 0.65,
      c2W = CW * 0.35;
    fillRect(ML, y, CW, 7.5, "#1e3a5f");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Ahli Waris", ML + 3, y + 5);
    doc.text("Jumlah", ML + c1W + c2W / 2, y + 5, { align: "center" });
    y += 7.5;

    inputRows.forEach((row, idx) => {
      checkPage(7.5);
      const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      fillRect(ML, y, CW, 7, bg);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(ML, y, CW, 7, "S");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(row.ahli, ML + 3, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text(String(row.jumlah) + " orang", ML + c1W + c2W / 2, y + 5, { align: "center" });
      y += 7;
    });
  }

  // Hijab (ahli waris terhalang)
  if (hijab && hijab.length > 0) {
    y += 4;
    checkPage(10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text("Ahli Waris Terhalang (Mahjub/Hijab):", ML, y);
    y += 5;
    hijab.forEach((h) => {
      checkPage(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      const txt = "  x  " + h.nama + ": " + h.alasan;
      const wrapped = doc.splitTextToSize(txt, CW);
      wrapped.forEach((line) => {
        checkPage(5);
        doc.text(line, ML, y);
        y += 4.5;
      });
    });
  }

  y += 8;

  // ════════════════════════════════════════════════════════
  // D. HASIL PEMBAGIAN — TABEL UTAMA
  // ════════════════════════════════════════════════════════
  checkPage(30);
  sectionHeader("HASIL PEMBAGIAN WARISAN", "D.");

  const hasPerOrang = ahliWaris.some((i) => i.jumlah > 1);

  // Lebar kolom
  let colW;
  if (hasPerOrang) {
    colW = [CW * 0.2, CW * 0.22, CW * 0.13, CW * 0.12, CW * 0.18, CW * 0.15];
  } else {
    colW = [CW * 0.23, CW * 0.26, CW * 0.16, CW * 0.13, CW * 0.22];
  }
  const colLabels = hasPerOrang ? ["Nama Ahli Waris", "Status / Jenis", "Fraksi", "Persen", "Nominal Diterima", "Per Orang"] : ["Nama Ahli Waris", "Status / Jenis", "Fraksi", "Persen", "Nominal Diterima"];

  // Header tabel
  fillRect(ML, y, CW, 9, "#0f172a");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  let cx = ML;
  colLabels.forEach((label, i) => {
    const align = i >= 2 ? "center" : "left";
    doc.text(label, cx + (align === "center" ? colW[i] / 2 : 3), y + 6, { align });
    cx += colW[i];
  });
  y += 9;

  // Baris data
  ahliWaris.forEach((item, idx) => {
    // Estimasi tinggi baris (nama bisa panjang)
    const namaLines = doc.splitTextToSize(item.nama, colW[0] - 4).length;
    const statusLines = doc.splitTextToSize(item.jenisBagian || "-", colW[1] - 4).length;
    const rowHeight = Math.max(namaLines, statusLines) * 5 + 4;

    checkPage(rowHeight + 2);

    const bg = idx % 2 === 0 ? "#f0f6ff" : "#ffffff";
    fillRect(ML, y, CW, rowHeight, bg);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(ML, y, CW, rowHeight, "S");

    cx = ML;
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    // Nama
    doc.setFont("helvetica", "bold");
    const namaArr = doc.splitTextToSize(item.nama, colW[0] - 4);
    namaArr.forEach((ln, li) => doc.text(ln, cx + 3, y + 5.5 + li * 4.5));
    cx += colW[0];

    // Status / jenisBagian
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7);
    const statusArr = doc.splitTextToSize(item.jenisBagian || "-", colW[1] - 4);
    statusArr.forEach((ln, li) => doc.text(ln, cx + 3, y + 5.5 + li * 4));
    cx += colW[1];

    // Fraksi
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(formatFraksi(item.fraksi), cx + colW[2] / 2, y + 5.5, { align: "center" });
    cx += colW[2];

    // Persen
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(7.5);
    doc.text((item.fraksi * 100).toFixed(2) + "%", cx + colW[3] / 2, y + 5.5, { align: "center" });
    cx += colW[3];

    // Nominal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const nomArr = doc.splitTextToSize("Rp " + formatRupiah(item.bagian), colW[4] - 4);
    nomArr.forEach((ln, li) => doc.text(ln, cx + colW[4] - 3, y + 5.5 + li * 4.5, { align: "right" }));
    cx += colW[4];

    // Per Orang (jika ada)
    if (hasPerOrang) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      if (item.jumlah > 1) {
        doc.text("Rp " + formatRupiah(item.bagianPerOrang), cx + colW[5] - 3, y + 4, { align: "right" });
        doc.setFontSize(7);
        doc.text("(" + item.jumlah + " orang)", cx + colW[5] - 3, y + 8, { align: "right" });
      } else {
        doc.text("-", cx + colW[5] / 2, y + 5.5, { align: "center" });
      }
    }

    y += rowHeight;
  });

  // Baris TOTAL
  checkPage(9);
  fillRect(ML, y, CW, 9, "#0f172a");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL DIBAGIKAN", ML + 3, y + 6);
  doc.text("100%", ML + colW[0] + colW[1] + colW[2] + colW[3] / 2, y + 6, { align: "center" });
  doc.setTextColor(245, 158, 11);
  const totalX = ML + colW[0] + colW[1] + colW[2] + colW[3] + colW[4] - 3;
  doc.text("Rp " + formatRupiah(bersih), totalX, y + 6, { align: "right" });
  y += 11;

  y += 6;

  // ════════════════════════════════════════════════════════
  // E. RINGKASAN AKHIR
  // ════════════════════════════════════════════════════════
  checkPage(30);
  sectionHeader("RINGKASAN AKHIR & KESIMPULAN", "E.");

  // Box ringkasan
  const totalDibagi = ahliWaris.reduce((sum, i) => sum + i.bagian, 0);
  const sisa = bersih - totalDibagi;

  const ringkasanItems = [
    { label: "Total Harta Siap Waris", nilai: "Rp " + formatRupiah(bersih) },
    { label: "Total Dibagikan ke " + ahliWaris.length + " Ahli Waris", nilai: "Rp " + formatRupiah(totalDibagi) },
    { label: "Sisa Pembagian", nilai: Math.abs(sisa) < 1 ? "Rp 0 (habis terbagi)" : "Rp " + formatRupiah(sisa) },
  ];

  ringkasanItems.forEach((r, idx) => {
    checkPage(8);
    const bg = idx === 0 ? "#dbeafe" : idx === 1 ? "#f0fdf4" : "#fef9c3";
    fillRect(ML, y, CW, 7.5, bg);
    doc.setDrawColor(200, 210, 230);
    doc.setLineWidth(0.2);
    doc.rect(ML, y, CW, 7.5, "S");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", idx === 0 ? "bold" : "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(r.label, ML + 3, y + 5.3);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(r.nilai, ML + CW - 3, y + 5.3, { align: "right" });
    y += 7.5;
  });

  y += 6;

  // Kesimpulan narasi
  checkPage(20);
  fillRect(ML, y, CW, 5, "#e0f2fe");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("Kesimpulan Perhitungan:", ML + 3, y + 3.5);
  y += 7;

  const narasiTeks =
    "Berdasarkan perhitungan hukum waris Islam (Faraidh) sesuai Kompilasi Hukum Islam (KHI), " +
    "harta peninggalan senilai Rp " +
    formatRupiah(pengurangan.harta) +
    " setelah dikurangi kewajiban (hutang, wasiat, biaya pemakaman) menjadi harta bersih siap waris " +
    "sebesar Rp " +
    formatRupiah(bersih) +
    ", yang kemudian dibagikan kepada " +
    ahliWaris.length +
    " ahli waris berhak " +
    "sesuai ketentuan fara'idh dengan porsi yang telah ditetapkan syariat Islam.";

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  const narasiLines = doc.splitTextToSize(narasiTeks, CW - 6);
  narasiLines.forEach((line) => {
    checkPage(5.5);
    doc.text(line, ML + 3, y);
    y += 5;
  });

  y += 5;

  // ── Catatan Hukum ────────────────────────────────────────
  if (catatan && catatan.length > 0) {
    checkPage(14);
    fillRect(ML, y, CW, 6, "#fef3c7");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text("Catatan Hukum:", ML + 3, y + 4);
    y += 7;

    catatan.forEach((c) => {
      const stripped = c.replace(/^[⚠ℹ]\s*/u, "");
      const lines = doc.splitTextToSize("• " + stripped, CW - 6);
      lines.forEach((line) => {
        checkPage(5.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8);
        doc.text(line, ML + 3, y);
        y += 4.8;
      });
    });

    y += 4;
  }

  // ── Landasan Hukum ───────────────────────────────────────
  checkPage(30);
  fillRect(ML, y, CW, 6, "#dbeafe");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("Landasan Hukum & Dalil:", ML + 3, y + 4);
  y += 7;

  const dalil = [
    "QS An-Nisa: 11  —  Porsi anak laki-laki & perempuan, serta ayah/ibu jika ada anak kandung.",
    "QS An-Nisa: 12  —  Bagian suami/istri tergantung ada tidaknya anak kandung pewaris.",
    "QS An-Nisa: 176  —  Bagian saudara kandung laki-laki dan perempuan (kalalah).",
    "KHI Pasal 171-182  —  Dasar hukum positif warisan Islam di Indonesia.",
  ];
  dalil.forEach((d) => {
    const lines = doc.splitTextToSize("• " + d, CW - 6);
    lines.forEach((line) => {
      checkPage(5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8);
      doc.text(line, ML + 3, y);
      y += 4.8;
    });
  });

  y += 6;

  // ── Disclaimer & Footer ──────────────────────────────────
  checkPage(22);
  fillRect(ML, y, CW, 18, "#f1f5f9");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, 18, "S");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Disclaimer:", ML + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const disclaimerTxt = "Dokumen ini bersifat edukatif dan tidak merupakan nasihat hukum resmi. " + "Untuk kepastian hukum, konsultasikan dengan notaris, pengacara, atau hakim Pengadilan Agama.";
  const dLines = doc.splitTextToSize(disclaimerTxt, CW - 6);
  dLines.forEach((line, i) => {
    doc.text(line, ML + 3, y + 9 + i * 4);
  });
  y += 22;

  // Nomor halaman di setiap halaman
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    // Footer stripe
    fillRect(0, PH - 10, PW, 10, "#0f172a");
    doc.setTextColor(180, 200, 230);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("WarisModern | " + tglStr, ML, PH - 4);
    doc.text("Hal " + p + " / " + pageCount, PW - MR, PH - 4, { align: "right" });
  }

  // ── SIMPAN FILE PDF ──────────────────────────────────────
  // FIX: Instagram in-app browser & WebView memblokir doc.save() (blob download).
  // Solusi: coba doc.save() dulu, kalau gagal fallback buka PDF di tab baru via data URL.
  const fileName = "laporan-waris-" + now.toISOString().slice(0, 10) + ".pdf";

  try {
    // Deteksi apakah browser adalah in-app WebView (Instagram, Facebook, TikTok, dll)
    const ua = navigator.userAgent || "";
    const isInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|Twitter|Line\/|KAKAOTALK|Snapchat|Pinterest|TikTok/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (isInAppBrowser || isIOS) {
      // Fallback: buka PDF sebagai data URL di tab/jendela baru
      // Ini bekerja di IG browser karena tidak bergantung pada blob download
      const pdfDataUri = doc.output("datauristring");
      const newWin = window.open("", "_blank");
      if (newWin) {
        newWin.document.write(
          `<!DOCTYPE html>
                <html><head><meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Laporan Waris</title>
                <style>
                  body { margin:0; background:#1e293b; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; padding:16px; box-sizing:border-box; }
                  h2 { color:#f8fafc; font-size:1rem; margin-bottom:12px; text-align:center; }
                  p { color:#94a3b8; font-size:0.85rem; text-align:center; margin-bottom:20px; }
                  a.btn { display:inline-block; background:#2563eb; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:0.95rem; margin-bottom:12px; }
                  iframe { width:100%; max-width:800px; height:80vh; border:none; border-radius:8px; }
                </style>
                </head><body>
                <h2>📄 Laporan Waris Siap</h2>
                <p>Browser Instagram tidak mendukung download otomatis.<br>Tekan tombol di bawah untuk membuka / menyimpan PDF.</p>
                <a class="btn" href="${pdfDataUri}" download="${fileName}">⬇ Simpan PDF</a>
                <br>
                <iframe src="${pdfDataUri}"></iframe>
                </body></html>`,
        );
        newWin.document.close();
      } else {
        // Jika pop-up diblokir, langsung navigasi
        window.location.href = pdfDataUri;
      }
    } else {
      // Browser normal: gunakan doc.save() standar
      doc.save(fileName);
    }
  } catch (err) {
    // Ultimate fallback: coba buka sebagai blob URL
    try {
      const pdfBlob = doc.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (e) {
      alert("Gagal mengunduh PDF. Coba buka halaman ini di browser Chrome atau Safari.");
    }
  }

  if (btn) {
    btn.innerHTML = "<span>⬇</span><span>Download Laporan Waris (PDF)</span>";
    btn.disabled = false;
  }
}
