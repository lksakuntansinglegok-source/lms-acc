import { StudentTeacherEvaluation } from '../types';

export const INITIAL_STUDENT_EVALUATIONS: Record<string, StudentTeacherEvaluation> = {
  std_01: {
    student_id: 'std_01',
    penguasaan_materi: {
      score: 92,
      level: 'Sangat Baik',
      catatan: 'Sangat menguasai siklus akuntansi manufaktur, jurnal penyesuaian kompleks, dan rekonsiliasi bank. Logika akuntansi runtut dan mampu membedakan metode perpetual vs periodik dengan sangat tepat.'
    },
    mental: {
      score: 88,
      level: 'Sangat Tangguh',
      catatan: 'Memiliki ketenangan tinggi saat diuji dalam simulasi waktu terbatas. Komunikasi saat presentasi video dan wawancara oral lugas, percaya diri, dan responsif terhadap pertanyaan penguji.'
    },
    penguasaan_aplikasi: {
      score: 90,
      level: 'Sangat Mahir',
      catatan: 'Sangat terampil menggunakan rumus Excel/Spreadsheet (VLOOKUP, INDEX MATCH, SUMIFS). Pengoperasian Accurate Online (AOL) dan MYOB sangat cepat dengan minimal salah klik.'
    },
    ketelitian: {
      score: 94,
      level: 'Sangat Teliti',
      catatan: 'Neraca lajur dan laporan keuangan selalu balance pada percobaan pertama. Pengecekan bukti transaksi dan pemotongan PPh 21/23 sangat teliti tanpa ada selisih saldo.'
    },
    rekomendasi_khusus: 'Kandidat utama LKS Akuntansi Tingkat Provinsi. Perlu diberikan pengayaan kasus HOTS konsolidasi entitas induk-anak dan analisis rasio solvabilitas mendalam.',
    status_kesiapan_lks: 'Siap Utama',
    target_fokus: 'Kandidat Juara 1 LKS Provinsi & Nasional',
    updated_at: '2026-08-20 16:30',
    updated_by: 'Dra. Endang Rahayu, M.Pd.'
  },
  std_02: {
    student_id: 'std_02',
    penguasaan_materi: {
      score: 85,
      level: 'Baik',
      catatan: 'Pemahaman materi dagang dan jasa sangat baik. Untuk materi persediaan metode rata-rata tertimbang dan jurnal penyesuaian beban dibayar dimuka sudah terkuasai dengan rapi.'
    },
    mental: {
      score: 82,
      level: 'Percaya Diri',
      catatan: 'Fokus dan tekun saat mengerjakan lembar kerja mandiri. Pada wawancara lisan sudah lancar, namun masih sedikit berhati-hati saat menjawab pertanyaan tak terduga dari juri.'
    },
    penguasaan_aplikasi: {
      score: 86,
      level: 'Kompeten',
      catatan: 'Mampu mengoperasikan modul Kas & Bank serta Penjualan di AOL dengan lancar. Penggunaan spreadsheet rapi dengan formatting standar akuntansi.'
    },
    ketelitian: {
      score: 88,
      level: 'Teliti',
      catatan: 'Selalu melakukan cross-check saldo akhir buku besar sebelum menyusun laporan laba rugi. Jarang terjadi salah entri nominal angka.'
    },
    rekomendasi_khusus: 'Kandidat cadangan utama LKS. Tingkatkan latihan simulasi wawancara bahasa Inggris dan kecepatan penyelesaian kertas kerja 10 kolom.',
    status_kesiapan_lks: 'Cadangan Unggulan',
    target_fokus: 'Pemantapan Wawancara Bilingual & Kecepatan Kerja',
    updated_at: '2026-08-20 15:45',
    updated_by: 'Dra. Endang Rahayu, M.Pd.'
  },
  std_03: {
    student_id: 'std_03',
    penguasaan_materi: {
      score: 62,
      level: 'Perlu Bimbingan',
      catatan: 'Masih sering terbalik antara aturan debit-kredit pada akun kontra aset dan penyesuaian pendapatan diterima dimuka. Perlu pengulangan konsep dasar jurnal penyesuaian.'
    },
    mental: {
      score: 65,
      level: 'Cemas / Ragu',
      catatan: 'Mudah panik saat menghadapi selisih saldo di neraca saldo disesuaikan. Perlu dibangun rasa percaya diri dan ketenangan saat menghadapi batasan waktu.'
    },
    penguasaan_aplikasi: {
      score: 68,
      level: 'Cukup',
      catatan: 'Bisa menginput transaksi dasar di spreadsheet, namun masih lambat dalam navigasi modul persediaan dan aset tetap pada aplikasi akuntansi.'
    },
    ketelitian: {
      score: 58,
      level: 'Sering Teledor / Kurang Balance',
      catatan: 'Sering terjadi salah ketik angka (transposisi digit) dan lupa mencatat bukti memo akhir periode. Lembar kerja perlu dirapikan.'
    },
    rekomendasi_khusus: 'Wajib mengikuti sesi bimbingan remedial mingguan materi Penyesuaian & Neraca Lajur. Fokuskan pada penguatan pemahaman konsep dasar sebelum latihan simulasi.',
    status_kesiapan_lks: 'Perlu Pemantapan',
    target_fokus: 'Remedial Jurnal Penyesuaian & Akurasi Input',
    updated_at: '2026-08-21 10:15',
    updated_by: 'Budi Santoso, S.E., Ak.'
  },
  std_04: {
    student_id: 'std_04',
    penguasaan_materi: {
      score: 80,
      level: 'Baik',
      catatan: 'Memahami alur pencatatan kas kecil sistem imprest, rekonsiliasi fiskal sederhana, dan perhitungan PPh 21 tarif progresif terbaru.'
    },
    mental: {
      score: 78,
      level: 'Cukup Tenang',
      catatan: 'Sikap kerja disiplin dan kooperatif. Mampu menjaga konsentrasi selama sesi praktik 3 jam tanpa kehilangan fokus.'
    },
    penguasaan_aplikasi: {
      score: 75,
      level: 'Kompeten',
      catatan: 'Penguasaan Excel cukup solid. Masih butuh pembiasaan pada fitur import data master barang dan pelanggan di Accurate Online.'
    },
    ketelitian: {
      score: 82,
      level: 'Teliti',
      catatan: 'Kerapian format tabel dan penulisan mata uang sangat baik. Neraca seimbang dengan catatan pendukung yang terstruktur.'
    },
    rekomendasi_khusus: 'Berikan latihan studi kasus variatif pada transaksi valuta asing dan modul persediaan multi-gudang.',
    status_kesiapan_lks: 'Dalam Pembinaan',
    target_fokus: 'Pengayaan Fitur Lanjutan AOL & Valas',
    updated_at: '2026-08-21 11:30',
    updated_by: 'Dra. Endang Rahayu, M.Pd.'
  },
  std_05: {
    student_id: 'std_05',
    penguasaan_materi: {
      score: 74,
      level: 'Cukup',
      catatan: 'Materi jurnal khusus dan buku besar pembantu sudah dikuasai, namun masih membutuhkan waktu lama pada pembuatan jurnal penutup dan jurnal pembalik.'
    },
    mental: {
      score: 76,
      level: 'Cukup Tenang',
      catatan: 'Memiliki motivasi belajar yang baik dan terbuka menerima masukan evaluasi setelah simulasi tugas.'
    },
    penguasaan_aplikasi: {
      score: 72,
      level: 'Cukup',
      catatan: 'Cukup lancar pada entri data harian, perlu diperbanyak latihan tombol shortcut keyboard untuk efisiensi waktu.'
    },
    ketelitian: {
      score: 75,
      level: 'Cukup Teliti',
      catatan: 'Terkadang melewatkan satu transaksi bukti kas masuk di akhir bulan. Perlu membiasakan checklist verifikasi bukti fisik.'
    },
    rekomendasi_khusus: 'Fokuskan pada latihan drill kecepatan siklus akuntansi lengkap (jurnal hingga laporan) dalam waktu maksimal 90 menit.',
    status_kesiapan_lks: 'Dalam Pembinaan',
    target_fokus: 'Drill Kecepatan Siklus & Checklist Bukti',
    updated_at: '2026-08-22 09:00',
    updated_by: 'Budi Santoso, S.E., Ak.'
  },
  std_06: {
    student_id: 'std_06',
    penguasaan_materi: {
      score: 90,
      level: 'Sangat Baik',
      catatan: 'Daya nalar akuntansi sangat tajam. Mampu menganalisis distorsi laba akibat kesalahan pencatatan persediaan serta fasih menjelaskan perhitungan harga pokok produksi (HPP).'
    },
    mental: {
      score: 87,
      level: 'Sangat Tangguh',
      catatan: 'Sangat percaya diri dan ekspresif dalam penyampaian presentasi video. Artikulasi konsep jelas dan terstruktur dengan intonasi meyakinkan.'
    },
    penguasaan_aplikasi: {
      score: 89,
      level: 'Sangat Mahir',
      catatan: 'Sangat mahir dalam pembuatan dashboard akuntansi Excel dan pengoperasian AOL modul manufaktur (Job Costing & Formula Produk).'
    },
    ketelitian: {
      score: 91,
      level: 'Sangat Teliti',
      catatan: 'Ketelitian tinggi dalam rekonsiliasi bank dan perhitungan penyusutan aset tetap metode saldo menurun ganda.'
    },
    rekomendasi_khusus: 'Kandidat unggulan paralel kelas XI AKL 2. Disiapkan bersama Andi Saputra untuk simulasi tanding pra-LKS tingkat kota.',
    status_kesiapan_lks: 'Siap Utama',
    target_fokus: 'Simulasi Tanding Kompetisi & Kasus Manufaktur HOTS',
    updated_at: '2026-08-22 14:20',
    updated_by: 'Budi Santoso, S.E., Ak.'
  },
  std_07: {
    student_id: 'std_07',
    penguasaan_materi: {
      score: 60,
      level: 'Perlu Bimbingan',
      catatan: 'Mengalami kendala pemahaman pada perlakuan piutang tak tertagih metode cadangan dan jurnal penghentian aset tetap. Perlu bimbingan intensif 1-on-1.'
    },
    mental: {
      score: 64,
      level: 'Cemas / Ragu',
      catatan: 'Cenderung tergesa-gesa saat memulai namun mudah putus asa jika hasil neraca saldo tidak langsung seimbang.'
    },
    penguasaan_aplikasi: {
      score: 65,
      level: 'Cukup',
      catatan: 'Masih sering salah memilih tipe akun saat membuat akun baru di daftar akun aplikasi komputer akuntansi.'
    },
    ketelitian: {
      score: 55,
      level: 'Sering Teledor / Kurang Balance',
      catatan: 'Kerap tertukar antara pos debit dan kredit pada jurnal penyesuaian perlengkapan vs beban perlengkapan.'
    },
    rekomendasi_khusus: 'Jadwalkan pendampingan tutor sebaya (peer tutoring) bersama siswa berprestasi dan perbanyak latihan soal LOTS ke MIDDLE.',
    status_kesiapan_lks: 'Perlu Pemantapan',
    target_fokus: 'Penguatan Konsep Debit-Kredit & Tutor Sebaya',
    updated_at: '2026-08-23 10:40',
    updated_by: 'Budi Santoso, S.E., Ak.'
  },
  std_08: {
    student_id: 'std_08',
    penguasaan_materi: {
      score: 83,
      level: 'Baik',
      catatan: 'Menguasai pencatatan wesel tagih, diskonto wesel, dan penyusunan laporan arus kas metode langsung dengan benar.'
    },
    mental: {
      score: 80,
      level: 'Percaya Diri',
      catatan: 'Konsisten, tenang, dan mampu menjawab pertanyaan penguji dengan penjelasan logis berbasis standar SAK ETAP/EP.'
    },
    penguasaan_aplikasi: {
      score: 81,
      level: 'Kompeten',
      catatan: 'Terampil mengolah data transaksi di Spreadsheet dan pembuatan grafik keuangan pendukung presentasi.'
    },
    ketelitian: {
      score: 84,
      level: 'Teliti',
      catatan: 'Pekerjaan rapi dan selalu menyertakan memo rekonsiliasi yang mudah ditelusuri jejak auditnya.'
    },
    rekomendasi_khusus: 'Tingkatkan penguasaan akuntansi perpajakan (SPT Masa PPN 1111) dan akuntansi persekutuan.',
    status_kesiapan_lks: 'Dalam Pembinaan',
    target_fokus: 'Pengayaan PPN & Laporan Arus Kas Lanjutan',
    updated_at: '2026-08-23 13:10',
    updated_by: 'Dra. Endang Rahayu, M.Pd.'
  },
  std_09: {
    student_id: 'std_09',
    penguasaan_materi: {
      score: 76,
      level: 'Cukup',
      catatan: 'Paham akuntansi perusahaan jasa dan dagang. Perlu pendalaman pada akuntansi biaya (kartu harga pokok pesanan/proses).'
    },
    mental: {
      score: 75,
      level: 'Cukup Tenang',
      catatan: 'Stabil dan tekun. Memiliki daya konsentrasi yang baik saat mengerjakan soal hitungan.'
    },
    penguasaan_aplikasi: {
      score: 77,
      level: 'Kompeten',
      catatan: 'Kecepatan ketik angka (numpad) cukup cepat dan pengoperasian menu dasar AOL lancar.'
    },
    ketelitian: {
      score: 78,
      level: 'Teliti',
      catatan: 'Selalu meneliti kembali hasil posting buku besar sebelum closing bulanan.'
    },
    rekomendasi_khusus: 'Berikan modul latihan akuntansi biaya manufaktur dan rekonsiliasi saldo piutang.',
    status_kesiapan_lks: 'Dalam Pembinaan',
    target_fokus: 'Akuntansi Biaya & Kartu Harga Pokok',
    updated_at: '2026-08-23 15:00',
    updated_by: 'Budi Santoso, S.E., Ak.'
  },
  std_10: {
    student_id: 'std_10',
    penguasaan_materi: {
      score: 84,
      level: 'Baik',
      catatan: 'Sangat baik dalam analisis rasio profitabilitas dan likuiditas serta penyusunan catatan atas laporan keuangan (CALK).'
    },
    mental: {
      score: 85,
      level: 'Percaya Diri',
      catatan: 'Kemampuan komunikasi verbal dan ekspresi saat presentasi sangat memikat dan meyakinkan penguji.'
    },
    penguasaan_aplikasi: {
      score: 83,
      level: 'Kompeten',
      catatan: 'Desain slide presentasi dan grafik keuangan di spreadsheet sangat profesional dan estetis.'
    },
    ketelitian: {
      score: 82,
      level: 'Teliti',
      catatan: 'Cermat dalam memeriksa referensi silang (cross-reference) akun antara neraca lajur dan CALK.'
    },
    rekomendasi_khusus: 'Pertahankan performa presentasi dan tingkatkan kecepatan pada modul entri jurnal penyesuaian.',
    status_kesiapan_lks: 'Cadangan Unggulan',
    target_fokus: 'Simulasi Wawancara Juri & Kecepatan Jurnal',
    updated_at: '2026-08-23 16:15',
    updated_by: 'Dra. Endang Rahayu, M.Pd.'
  }
};
