import { parseNumber } from "./helpers";

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
export function hitungWarisan(data) {
  // ── 1. Parse semua angka ──────────────────────────────────
  const harta = parseNumber(data.hartaKotor);
  const hutang = parseNumber(data.hutang);
  const wasiat = parseNumber(data.wasiat);
  const pemakaman = parseNumber(data.pemakaman);

  // ── 2. Hitung harta bersih siap waris ────────────────────
  const totalPengurangan = hutang + wasiat + pemakaman;
  // TODO: Perlu verifikasi logic waris asli — wasiat tidak dibatasi maks 1/3 harta bersih (hanya petunjuk di form), dan jika pengurangan > harta tidak ada peringatan (bersih dipaksa 0).
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
    // TODO: Perlu verifikasi logic waris asli — kondisi ini sudah true untuk 1 saudara (adaSaudara), padahal catatan menyebut "2 atau lebih"; teks alasan Ibu di bawah memakai saudaraL + saudaraP mentah (bukan yang efektif/tidak terhijab).
    } else if (adaSaudara || saudaraLEfektif + saudaraPEfektif >= 2) {
      // Jika ada 2+ saudara dan tidak ada anak: ibu dapat 1/6
      porsi["Ibu"] = 1 / 6;
      catatan.push("Ibu mendapat 1/6 karena ada 2 atau lebih saudara kandung pewaris.");
    } else {
      // TODO: Perlu verifikasi logic waris asli — Ibu selalu 1/3 dari TOTAL harta, termasuk saat bersama Ayah + pasangan (KHI Pasal 178 ayat 2 setahu saya: 1/3 dari sisa setelah pasangan).
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

  // TODO: Perlu verifikasi logic waris asli — Radd hanya aktif jika tidak ada Ayah/anak/kakek/saudara. Contoh: 1 anak perempuan + Ayah = 1/2 + 1/6, sisa 1/3 tidak dibagikan ke siapa pun.
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
