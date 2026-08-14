import { Topic, Question } from '../types';

export const TOPICS_60: Topic[] = [
  { topic_id: 'top_01', nama_topik: 'Persediaan', deskripsi: 'Sistem pencatatan persediaan perpetual & periodik (FIFO, LIFO, Average), kartu persediaan, dan penilaian HPP', urutan: 1, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_02', nama_topik: 'Piutang Usaha', deskripsi: 'Pencatatan timbulnya piutang dagang, syarat pembayaran (termin 2/10 n/30), estimasi cadangan kerugian piutang, dan pelunasan', urutan: 2, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_03', nama_topik: 'Kas Kecil', deskripsi: 'Pengelolaan dana kas kecil metode imprest (dana tetap) dan fluctuating (dana tidak tetap), pembentukan, bukti pengeluaran, serta pengisian kembali', urutan: 3, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_04', nama_topik: 'Kas Bank', deskripsi: 'Pencatatan kas di bank, verifikasi rekening koran, setoran dalam perjalanan, cek beredar, dan penyusunan rekonsiliasi bank', urutan: 4, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_05', nama_topik: 'Aset Tetap', deskripsi: 'Perolehan aset tetap, pengeluaran modal vs pendapatan, metode penyusutan (garis lurus, saldo menurun ganda, unit produksi), dan pelepasan aset', urutan: 5, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_06', nama_topik: 'Persamaan Dasar Akuntansi', deskripsi: 'Konsep Aset = Liabilitas + Ekuitas dan analisis pengaruh transaksi keuangan', urutan: 6, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_07', nama_topik: 'Jurnal Umum', deskripsi: 'Prosedur pencatatan kronologis transaksi debit dan kredit dalam jurnal umum', urutan: 7, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_08', nama_topik: 'Buku Besar', deskripsi: 'Posting ayat jurnal umum ke bentuk skontro dan stafel 4 kolom', urutan: 8, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_09', nama_topik: 'Neraca Saldo', deskripsi: 'Pengujian kesamaan total saldo debit dan kredit di seluruh akun buku besar', urutan: 9, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_10', nama_topik: 'Jurnal Penyesuaian', deskripsi: 'Pembuatan ayat penyesuaian akhir periode untuk akrual dan deferral', urutan: 10, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_11', nama_topik: 'Piutang Wesel', deskripsi: 'Pencatatan piutang wesel berbunga dan diskonto piutang wesel', urutan: 11, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_12', nama_topik: 'Utang Usaha', deskripsi: 'Pencatatan kewajiban jangka pendek atas pembelian barang/jasa secara kredit', urutan: 12, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_13', nama_topik: 'Utang Wesel', deskripsi: 'Pencatatan promes bayar, wesel berbunga, dan akrual beban bunga utang', urutan: 13, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_14', nama_topik: 'Pendapatan', deskripsi: 'Pengakuan dan pengukuran pendapatan operasional dan non-operasional', urutan: 14, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_15', nama_topik: 'Beban', deskripsi: 'Klasifikasi beban operasional, beban penjualan, dan beban administrasi umum', urutan: 15, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_16', nama_topik: 'Modal dan Prive', deskripsi: 'Pencatatan setoran modal pemilik, pengambilan pribadi (prive), dan deviden', urutan: 16, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_17', nama_topik: 'Bukti Transaksi', deskripsi: 'Verifikasi faktur, kuitansi, nota debet/kredit, dan voucher kas', urutan: 17, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_18', nama_topik: 'Beban Penghapusan Piutang', deskripsi: 'Pencatatan beban tak tertagih dan estimasi risiko gagal bayar', urutan: 18, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_19', nama_topik: 'Cadangan Kerugian Piutang', deskripsi: 'Estimasi cadangan kerugian piutang berbasis analisis umur piutang', urutan: 19, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_20', nama_topik: 'Metode Penghapusan Langsung', deskripsi: 'Pencatatan kerugian piutang saat benar-benar dipastikan tak tertagih', urutan: 20, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_21', nama_topik: 'Metode Cadangan', deskripsi: 'Pengakuan beban estimasi kerugian piutang pada periode berjalan', urutan: 21, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_22', nama_topik: 'Penyusutan Aset Tetap', deskripsi: 'Alokasi sistematis harga perolehan aset tetap selama umur ekonomis', urutan: 22, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_23', nama_topik: 'Metode Garis Lurus', deskripsi: 'Perhitungan penyusutan konstan tiap periode (Cost - Residual) / Life', urutan: 23, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_24', nama_topik: 'Metode Saldo Menurun', deskripsi: 'Perhitungan penyusutan dipercepat dengan tarif ganda atas nilai buku', urutan: 24, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_25', nama_topik: 'Metode Jumlah Angka Tahun', deskripsi: 'Perhitungan beban penyusutan berdasarkan pecahan angka tahun', urutan: 25, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_26', nama_topik: 'Aset Tidak Berwujud', deskripsi: 'Pencatatan dan penilaian hak paten, hak cipta, merek dagang, dan goodwill', urutan: 26, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_27', nama_topik: 'Amortisasi', deskripsi: 'Pengalokasian beban berkala untuk aset tidak berwujud', urutan: 27, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_28', nama_topik: 'Beban Dibayar di Muka', deskripsi: 'Pencatatan dan penyesuaian sewa/asuransi dibayar dimuka', urutan: 28, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_29', nama_topik: 'Pendapatan Diterima di Muka', deskripsi: 'Pencatatan kewajiban deferral atas uang muka pelanggan', urutan: 29, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_30', nama_topik: 'Koreksi Kesalahan Akuntansi', deskripsi: 'Pembuatan jurnal koreksi atas kesalahan posting dan transposisi angka', urutan: 30, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_31', nama_topik: 'Pengertian dan Fungsi Pajak', deskripsi: 'Prinsip perpajakan Indonesia, fungsi budgetair, dan regulasi pajak', urutan: 31, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_32', nama_topik: 'Pajak Penghasilan (PPh)', deskripsi: 'Konsep dasar PPh badan dan perorangan serta penghitungan PKP', urutan: 32, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_33', nama_topik: 'PPh Pasal 21', deskripsi: 'Pemotongan PPh atas penghasilan gaji, upah, dan honorarium pegawai', urutan: 33, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_34', nama_topik: 'PPh Pasal 22', deskripsi: 'Pemungutan pajak atas kegiatan impor dan pembelian barang pemerintah', urutan: 34, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_35', nama_topik: 'PPh Pasal 23', deskripsi: 'Pemotongan PPh atas dividen, bunga, royalti, dan jasa manajemen', urutan: 35, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_36', nama_topik: 'PPh Pasal 25', deskripsi: 'Angsuran PPh bulanan dalam tahun berjalan sebagai kredit pajak', urutan: 36, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_37', nama_topik: 'PPh Pasal 29', deskripsi: 'PPh kurang bayar pada SPT Tahunan PPh Badan / Orang Pribadi', urutan: 37, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_38', nama_topik: 'Pajak Pertambahan Nilai (PPN)', deskripsi: 'Mekanisme pemungutan PPN atas penyerahan BKP dan JKP', urutan: 38, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_39', nama_topik: 'Pajak Masukan', deskripsi: 'PPN yang dibayar saat pembelian barang/jasa kena pajak', urutan: 39, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_40', nama_topik: 'Pajak Keluaran', deskripsi: 'PPN yang dipungut saat penjualan barang/jasa kena pajak', urutan: 40, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_41', nama_topik: 'Pengusaha Kena Pajak (PKP)', deskripsi: 'Syarat dan hak/kewajiban pengusaha yang dikukuhkan sebagai PKP', urutan: 41, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_42', nama_topik: 'Nomor Pokok Wajib Pajak (NPWP)', deskripsi: 'Fungsi, pendaftaran, dan sanksi terkait kepemilikan NPWP', urutan: 42, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_43', nama_topik: 'Surat Pemberitahuan (SPT)', deskripsi: 'Jenis SPT Masa/Tahunan, batas waktu pelaporan, dan sanksi keterlambatan', urutan: 43, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_44', nama_topik: 'Pemotongan dan Pemungutan Pajak', deskripsi: 'Sistem withholding tax dalam perpajakan Indonesia', urutan: 44, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_45', nama_topik: 'Kredit Pajak', deskripsi: 'Pengurangan pajak terutang dengan pajak yang telah dipotong/dibayar', urutan: 45, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_46', nama_topik: 'Pengertian Akuntansi Biaya', deskripsi: 'Tujuan, peran, dan perbedaan akuntansi biaya dengan akuntansi keuangan', urutan: 46, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_47', nama_topik: 'Klasifikasi Biaya', deskripsi: 'Pengelompokan biaya berdasarkan fungsi, objek pengeluaran, dan perilaku', urutan: 47, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_48', nama_topik: 'Biaya Tetap', deskripsi: 'Karakteristik biaya tetap total vs biaya tetap per unit dalam kapasitas relevan', urutan: 48, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_49', nama_topik: 'Biaya Variabel', deskripsi: 'Karakteristik biaya variabel total vs biaya variabel per unit', urutan: 49, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_50', nama_topik: 'Biaya Semivariabel', deskripsi: 'Pemisahan unsur tetap dan variabel menggunakan metode High-Low Method', urutan: 50, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_51', nama_topik: 'Biaya Bahan Baku', deskripsi: 'Pencatatan perolehan, pemakaian, dan pengendalian persediaan bahan baku', urutan: 51, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_52', nama_topik: 'Biaya Tenaga Kerja Langsung', deskripsi: 'Perhitungan dan pencatatan upah langsung serta tunjangan produksi', urutan: 52, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_53', nama_topik: 'Biaya Overhead Pabrik', deskripsi: 'Pembebanan BOP berbasis tarif ditentukan dimuka dan analisis selisih', urutan: 53, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_54', nama_topik: 'Harga Pokok Produksi', deskripsi: 'Penyusunan Laporan Harga Pokok Produksi (Cost of Goods Manufactured)', urutan: 54, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_55', nama_topik: 'Harga Pokok Penjualan', deskripsi: 'Perhitungan HPP perusahaan manufaktur dan barang dagang', urutan: 55, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_56', nama_topik: 'Biaya Produk dan Biaya Periode', deskripsi: 'Perbedaan inventoriable cost vs period expense dalam laporan keuangan', urutan: 56, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_57', nama_topik: 'Biaya Langsung dan Tidak Langsung', deskripsi: 'Traseabilitas biaya ke objek biaya (cost object)', urutan: 57, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_58', nama_topik: 'Break Even Point (BEP)', deskripsi: 'Perhitungan titik impas unit dan rupiah menggunakan analisis CVP', urutan: 58, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_59', nama_topik: 'Margin of Safety', deskripsi: 'Analisis tingkat keamanan penjualan sebelum perusahaan mengalami kerugian', urutan: 59, status: 'aktif', passing_grade: 75 },
  { topic_id: 'top_60', nama_topik: 'Rasio Keuangan', deskripsi: 'Analisis rasio likuiditas, solvabilitas, aktivitas, dan profitabilitas', urutan: 60, status: 'aktif', passing_grade: 75 }
];

// Helper to generate 20 MIDDLE and 20 HOTS questions for any of the 60 topics
export function generateQuestionsForTopic(topic: Topic): Question[] {
  const questions: Question[] = [];
  const name = topic.nama_topik;
  const tid = topic.topic_id;

  // 1. GENERATE 20 MIDDLE QUESTIONS
  for (let i = 1; i <= 20; i++) {
    const qid = `q_${tid}_mid_${i.toString().padStart(2, '0')}`;
    let qTextId = '';
    let qTextEn = '';
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let correct: 'A' | 'B' | 'C' | 'D' = 'A';
    let expId = '';
    let expEn = '';

    switch (i) {
      case 1:
        qTextId = `Manakah yang merupakan definisi dasar dan prinsip utama dari materi ${name}?`;
        qTextEn = `Which of the following defines the fundamental principle of ${name}?`;
        optA = `Pencatatan dan pengakuan yang sesuai dengan standar akuntansi keuangan terkait ${name}.`;
        optB = `Pencatatan transaksi secara sembarangan tanpa bukti dokumen pendukung.`;
        optC = `Penilaian aset perusahaan berdasarkan perkiraan harga pasar subjektif.`;
        optD = `Penghapusan kewajiban tanpa adanya pelunasan kas atau kompensasi.`;
        correct = 'A';
        expId = `Materi ${name} berfokus pada pencatatan dan akuntansi yang patuh pada standar SAK/PABU.`;
        expEn = `${name} focuses on proper recording compliant with accounting standards.`;
        break;

      case 2:
        qTextId = `Dalam konteks ${name}, apabila terjadi transaksi penambahan nilai sebesar Rp 5.000.000, pengaruh pada akun terkait adalah...`;
        qTextEn = `In the context of ${name}, if a transaction increases the value by IDR 5,000,000, the effect on the respective account is...`;
        optA = `Debit/Kredit dicatat bertambah sesuai saldo normal akun ${name} sebesar Rp 5.000.000.`;
        optB = `Dicatat berkurang di kedua sisi akun sebesar Rp 2.500.000.`;
        optC = `Tidak perlu dicatat sampai akhir tahun fiskal.`;
        optD = `Dicatat sebagai beban luar biasa tanpa mempengaruhi saldo.`;
        correct = 'A';
        expId = `Transaksi mempengaruhi saldo normal akun terkait ${name} secara proporsional.`;
        expEn = `Transactions affect the normal balance of accounts related to ${name}.`;
        break;

      case 3:
        qTextId = `Dokumen sumber utama yang menjadi dasar validasi pencatatan transaksi ${name} adalah...`;
        qTextEn = `The primary source document validating the transaction entry of ${name} is...`;
        optA = `Faktur/Kuitansi/Voucher resmi yang sah dan terverifikasi.`;
        optB = `Catatan tidak resmi di kertas biasa.`;
        optC = `Estimasi verbal dari bagian pemasaran.`;
        optD = `Brosur harga produk dari kompetitor.`;
        correct = 'A';
        expId = `Setiap pencatatan akuntansi ${name} wajib didukung bukti transaksi sah.`;
        expEn = `Every accounting entry for ${name} must be supported by valid source documents.`;
        break;

      case 4:
        qTextId = `Bagaimana pengaruh pencatatan ${name} terhadap Laporan Posisi Keuangan (Neraca) perusahaan?`;
        qTextEn = `How does the recording of ${name} affect the Statement of Financial Position (Balance Sheet)?`;
        optA = `Mempengaruhi posisi Aset, Liabilitas, atau Ekuitas secara seimbang.`;
        optB = `Hanya mempengaruhi akun Laba Rugi tanpa menyentuh Neraca.`;
        optC = `Menyebabkan neraca menjadi tidak seimbang.`;
        optD = `Menghapus seluruh nilai ekuitas pemilik.`;
        correct = 'A';
        expId = `Transaksi ${name} menjaga keseimbangan persamaan akuntansi Aset = Liabilitas + Ekuitas.`;
        expEn = `Transactions in ${name} maintain the balance of Assets = Liabilities + Equity.`;
        break;

      case 5:
        qTextId = `Aturan pencatatan saldo normal untuk akun yang tergolong dalam topik ${name} adalah...`;
        qTextEn = `The normal balance rule for accounts classified under ${name} is...`;
        optA = `Sesuai klasifikasi utamanya (Aset/Beban di Debit; Pasiva/Pendapatan di Kredit).`;
        optB = `Selalu di sisi Debit tanpa memandang jenis akun.`;
        optC = `Selalu di sisi Kredit tanpa memandang jenis akun.`;
        optD = `Berubah-ubah setiap hari sesuai keputusan manajemen.`;
        correct = 'A';
        expId = `Saldo normal ditentukan oleh klasifikasi dasar akun dalam ${name}.`;
        expEn = `Normal balance is dictated by the account classification in ${name}.`;
        break;

      case 6:
        qTextId = `Jika perusahaan melakukan transaksi terkait ${name} senilai Rp 12.000.000 secara tunai, akun Kas akan...`;
        qTextEn = `If a company engages in a cash transaction for ${name} worth IDR 12,000,000, the Cash account will...`;
        optA = `Berkurang atau bertambah sebesar Rp 12.000.000 tergantung posisi penerimaan/pengeluaran.`;
        optB = `Selalu bertambah di sisi kredit sebesar Rp 12.000.000.`;
        optC = `Tidak mengalami perubahan apapun.`;
        optD = `Dicatat sebagai utang jangka panjang.`;
        correct = 'A';
        expId = `Transaksi tunai secara langsung mengubah posisi Kas perusahaan.`;
        expEn = `Cash transactions directly alter the company Cash balance.`;
        break;

      case 7:
        qTextId = `Karakteristik utama yang membedakan ${name} dari transaksi operasional harian lainnya adalah...`;
        qTextEn = `The main characteristic distinguishing ${name} from other daily operational transactions is...`;
        optA = `Prosedur spesifik dan cakupan akun yang terlibat dalam pembahasan ${name}.`;
        optB = `Ketidakbutuhan akan jurnal dan bukti transaksi.`;
        optC = `Hanya dilakukan oleh perusahaan berbadan hukum BUMN.`;
        optD = `Bebas dari pengawasan auditor dan perpajakan.`;
        correct = 'A';
        expId = `Setiap topik akuntansi seperti ${name} memiliki standar prosedur teknis tersendiri.`;
        expEn = `Each accounting topic such as ${name} has its own specific technical standards.`;
        break;

      case 8:
        qTextId = `Pada akhir periode akuntansi, perlakuan terhadap akun nominal terkait ${name} adalah...`;
        qTextEn = `At the end of the accounting period, the treatment for nominal accounts related to ${name} is...`;
        optA = `Ditutup ke akun Ikhtisar Laba Rugi melalui Jurnal Penutup.`;
        optB = `Dibiarkan bersaldo untuk periode berikutnya.`;
        optC = `Dihapus secara langsung tanpa jurnal penutup.`;
        optD = `Dipindahkan seluruhnya ke akun Kas Kecil.`;
        correct = 'A';
        expId = `Akun nominal terkait pendapatan/beban pada ${name} ditutup pada akhir periode.`;
        expEn = `Nominal accounts related to ${name} are closed at period end.`;
        break;

      case 9:
        qTextId = `Perusahaan membayar tagihan sebesar Rp 3.500.000 untuk transaksi ${name}. Jurnal yang dicatat adalah...`;
        qTextEn = `Company pays an invoice of IDR 3,500,000 for ${name}. The recorded entry is...`;
        optA = `Akun Terkait ${name} (Debit) Rp 3.500.000; Kas (Kredit) Rp 3.500.000.`;
        optB = `Kas (Debit) Rp 3.500.000; Akun Terkait (Kredit) Rp 3.500.000.`;
        optC = `Modal (Debit) Rp 3.500.000; Utang (Kredit) Rp 3.500.000.`;
        optD = `Piutang (Debit) Rp 3.500.000; Kas (Kredit) Rp 3.500.000.`;
        correct = 'A';
        expId = `Pengeluaran kas untuk ${name} dicatat dengan mendebit akun tujuan dan mengkredit Kas.`;
        expEn = `Cash disbursement for ${name} debits the target account and credits Cash.`;
        break;

      case 10:
        qTextId = `Mengapa pemahaman mendalam tentang ${name} sangat krusial bagi seorang teknisi akuntansi?`;
        qTextEn = `Why is a thorough understanding of ${name} crucial for an accounting technician?`;
        optA = `Menjamin keakuratan penyusunan laporan keuangan dan kepatuhan regulasi.`;
        optB = `Agar dapat memanipulasi nilai pajak terutang perusahaan.`;
        optC = `Menghindari kewajiban pembuatan bukti transaksi.`;
        optD = `Mempercepat proses pembubaran entitas bisnis.`;
        correct = 'A';
        expId = `Penguasaan ${name} memastikan penyajian laporan keuangan yang wajar dan dapat dipercaya.`;
        expEn = `Mastering ${name} ensures fair and reliable presentation of financial statements.`;
        break;

      default:
        qTextId = `Langkah teknis ke-${i} dalam menerapkan siklus akuntansi untuk topik ${name} adalah...`;
        qTextEn = `The technical step #${i} in applying the accounting cycle for ${name} is...`;
        optA = `Melakukan identifikasi, verifikasi bukti, dan pencatatan yang presisi terkait ${name}.`;
        optB = `Mengabaikan angka selisih kecil di neraca saldo.`;
        optC = `Mengubah metode akuntansi setiap bulan.`;
        optD = `Menyimpan bukti transaksi tanpa dicatat di jurnal.`;
        correct = 'A';
        expId = `Prinsip konsistensi dan ketelitian berlaku wajib pada topik ${name}.`;
        expEn = `Consistency and accuracy apply mandatorily to ${name}.`;
        break;
    }

    questions.push({
      question_id: qid,
      topic_id: tid,
      difficulty: 'MIDDLE',
      pertanyaan_id: qTextId,
      question_en: qTextEn,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correct,
      explanation_id: expId,
      explanation_en: expEn,
      kompetensi: `Pemahaman Konsep & Prosedur ${name}`
    });
  }

  // 2. GENERATE 20 HOTS QUESTIONS
  for (let j = 1; j <= 20; j++) {
    const qid = `q_${tid}_hots_${j.toString().padStart(2, '0')}`;
    let qTextId = '';
    let qTextEn = '';
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let correct: 'A' | 'B' | 'C' | 'D' = 'A';
    let expId = '';
    let expEn = '';

    switch (j) {
      case 1:
        qTextId = `[Studi Kasus HOTS #1] PT Utama Karya mencatat transaksi ${name} sebesar Rp 25.000.000 dengan salah mencantumkan akun di sisi Kredit. Dampak analisis terhadap Neraca Saldo akhir periode adalah...`;
        qTextEn = `[HOTS Case #1] PT Utama Karya recorded a ${name} transaction of IDR 25,000,000 with a wrong account credited. The impact on the Trial Balance is...`;
        optA = `Neraca Saldo tetap seimbang namun saldo salah satu akun pasiva/aset menjadi terdistorsi Rp 25.000.000.`;
        optB = `Sisi Debit menjadi lebih besar Rp 50.000.000 daripada Kredit.`;
        optC = `Sisi Kredit menjadi nol dan laporan laba rugi langsung rugi.`;
        optD = `Tidak ada dampak apapun pada seluruh laporan keuangan.`;
        correct = 'A';
        expId = `Kesalahan klasifikasi akun tidak menyebabkan Neraca Saldo tidak seimbang, tetapi menyebabkan salah saji posisi akun.`;
        expEn = `Account misclassification keeps Trial Balance equal but distorts individual balances.`;
        break;

      case 2:
        qTextId = `[Studi Kasus HOTS #2] Pada topik ${name}, perusahaan menemukan understatement beban sebesar Rp 8.000.000 di tahun berjalan. Jika tidak dikoreksi, dampak evaluasi terhadap Laba Bersih dan Ekuitas adalah...`;
        qTextEn = `[HOTS Case #2] Regarding ${name}, an expense understatement of IDR 8,000,000 was found. If uncorrected, the effect on Net Income and Equity is...`;
        optA = `Laba Bersih overstated Rp 8.000.000 dan Ekuitas Akhir overstated Rp 8.000.000.`;
        optB = `Laba Bersih understated Rp 8.000.000 dan Ekuitas tidak berpengaruh.`;
        optC = `Laba Bersih dan Ekuitas keduanya understated Rp 8.000.000.`;
        optD = `Aset bertambah Rp 16.000.000 secara otomatis.`;
        correct = 'A';
        expId = `Beban yang dicatat terlalu rendah (understated) menyebabkan Laba dan Ekuitas menjadi terlalu tinggi (overstated).`;
        expEn = `Understated expenses lead to overstated Net Income and Equity.`;
        break;

      case 3:
        qTextId = `[Studi Kasus HOTS #3] Manakah tindakan koreksi & analisis terbaik bagi teknisi akuntansi jika ditemukan transaksi ${name} senilai Rp 15.000.000 yang belum dicatat hingga tutup buku?`;
        qTextEn = `[HOTS Case #3] What is the best corrective action for an accountant when an unrecorded ${name} transaction of IDR 15,000,000 is discovered at period end?`;
        optA = `Membuat Ayat Jurnal Penyesuaian/Koreksi sebesar Rp 15.000.000 sebelum laporan keuangan final diterbitkan.`;
        optB = `Mengabaikan transaksi tersebut agar laporan keuangan tidak berubah.`;
        optC = `Mencatatnya sebagai pendapatan luar biasa di periode tahun depan.`;
        optD = `Mengubah nilai transaksi menjadi nol di sistem akuntansi.`;
        correct = 'A';
        expId = `Transaksi yang belum dicatat wajib disesuaikan melalui Jurnal Penyesuaian agar memenuhi prinsip accrual basis.`;
        expEn = `Unrecorded transactions must be adjusted via adjusting entries prior to finalizing reports.`;
        break;

      case 4:
        qTextId = `[Studi Kasus HOTS #4] Dalam evaluasi audit ${name}, rasio efisiensi menurun akibat kelalaian pengawasan internal. Solusi strategis yang direkomendasikan adalah...`;
        qTextEn = `[HOTS Case #4] An audit evaluation on ${name} reveals lower efficiency due to weak internal controls. The recommended strategic solution is...`;
        optA = `Menerapkan SOP otorisasi bertingkat dan pemisahan fungsi penyimpanan, pencatatan, serta otorisasi.`;
        optB = `Menghapuskan fungsi akuntansi dan menyerahkannya ke pihak luar tanpa kontrak.`;
        optC = `Menaikkan harga jual produk sebesar 50% tanpa perbaikan kontrol.`;
        optD = `Menghentikan seluruh pencatatan jurnal transaksi harian.`;
        correct = 'A';
        expId = `Pengendalian internal yang kuat mencegah kecurangan dan kesalahan dalam operasional ${name}.`;
        expEn = `Strong internal controls prevent fraud and errors in operations related to ${name}.`;
        break;

      case 5:
        qTextId = `[Studi Kasus HOTS #5] Analisislah dampak perubahan kebijakan perpajakan/regulasi atas transaksi ${name} terhadap proyeksi arus kas bersih perusahaan!`;
        qTextEn = `[HOTS Case #5] Analyze the impact of tax policy changes on ${name} transactions regarding projected net cash flows!`;
        optA = `Perubahan tarif/regulasi secara langsung mempengaruhi kewajiban kas keluar dan nilai laba setelah pajak.`;
        optB = `Arus kas perusahaan selalu meningkat meskipun tarif pajak dinaikkan.`;
        optC = `Pajak tidak memiliki hubungan sama sekali dengan arus kas operasional.`;
        optD = `Laporan arus kas tidak boleh mencantumkan elemen pembayaran pajak.`;
        correct = 'A';
        expId = `Kewajiban perpajakan atas ${name} mempengaruhi aktivitas arus kas operasional (Operating Cash Flow).`;
        expEn = `Tax obligations for ${name} directly impact operating cash flows.`;
        break;

      default:
        qTextId = `[Studi Kasus HOTS #${j}] PT Mitra Sejahtera melakukan evaluasi mendalam pada topik ${name} terkait varians nilai transaksi Rp ${(j * 4.5).toFixed(1)}.000.000. Keputusan manajerial yang paling rasional adalah...`;
        qTextEn = `[HOTS Case #${j}] PT Mitra Sejahtera conducted a deep evaluation on ${name} regarding a transaction variance of IDR ${(j * 4.5).toFixed(1)},000,000. The most rational managerial decision is...`;
        optA = `Melakukan rekonsiliasi detail, menganalisis akar penyebab varians, dan menerbitkan jurnal koreksi yang tepat.`;
        optB = `Langsung membebankan selisih ke kerugian tanpa verifikasi bukti pendukung.`;
        optC = `Mengubah data transaksi di bulan sebelumnya secara sepihak.`;
        optD = `Menutup rekening perusahaan di bank tanpa pemberitahuan.`;
        correct = 'A';
        expId = `Setiap varians atau selisih pada ${name} harus diinvestigasi akar penyebabnya sebelum ditindaklanjuti.`;
        expEn = `Any variance in ${name} must be thoroughly investigated before adjusting.`;
        break;
    }

    questions.push({
      question_id: qid,
      topic_id: tid,
      difficulty: 'HOTS',
      pertanyaan_id: qTextId,
      question_en: qTextEn,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correct,
      explanation_id: expId,
      explanation_en: expEn,
      kompetensi: `Analisis HOTS & Evaluasi Kasus ${name}`
    });
  }

  return questions;
}

// Pre-generate the full dataset for all 60 topics (20 MIDDLE + 20 HOTS = 2,400 questions)
export const ALL_QUESTIONS_60: Question[] = TOPICS_60.flatMap(t => generateQuestionsForTopic(t));
