import { PracticalExercise } from '../types';

export const DEFAULT_PRACTICAL_EXERCISES: PracticalExercise[] = [
  // 1. Persediaan & Jurnal Dasar
  {
    id: 'prak_pjdm_01',
    topic_id: 'top_01',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Analisis Transaksi & Kartu Persediaan FIFO Perpetual',
    deskripsi: 'Pencatatan 15 transaksi mutasi persediaan barang dagang ke kartu persediaan perpetual metode FIFO, penghitungan HPP, dan pencatatan ayat jurnal penyesuaian akhir periode pada spreadsheet PJDM terstandar LKS.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-fifo-persediaan/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-pjdm-topik01/view',
    deadline: '2026-09-05',
    max_score: 100,
    kompetensi: 'Pengoperasian Jurnal Dasar & Memori (PJDM) - Persediaan FIFO'
  },
  {
    id: 'prak_aol_01',
    topic_id: 'top_01',
    tipe_praktik: 'AOL',
    target_types: ['AOL'],
    judul: 'Praktik AOL: Setup Master Barang, Kategori & Saldo Awal Persediaan',
    deskripsi: 'Inisialisasi database Accurate Online (AOL), buat master data kategori barang, satuan barang, dan input saldo awal persediaan barang dagang lengkap beserta nomor seri dan gudang.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/persediaan-01',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-01/view',
    deadline: '2026-09-08',
    max_score: 100,
    kompetensi: 'Akuntansi Online (AOL) - Master Data Persediaan'
  },

  // 2. Piutang Usaha & Penjualan
  {
    id: 'prak_pjdm_02',
    topic_id: 'top_02',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Jurnal Khusus Penjualan & Kartu Piutang Usaha',
    deskripsi: 'Pencatatan transaksi penjualan kredit dengan termin 2/10 n/30 ke Jurnal Penjualan, posting ke Kartu Pembantu Piutang, serta estimasi cadangan kerugian piutang berdasarkan analisis umur piutang.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-piutang/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-piutang/view',
    deadline: '2026-09-12',
    max_score: 100,
    kompetensi: 'PJDM - Siklus Penjualan & Kartu Piutang'
  },
  {
    id: 'prak_aol_02',
    topic_id: 'top_02',
    tipe_praktik: 'AOL',
    target_types: ['AOL'],
    judul: 'Praktik AOL: Siklus Penjualan, Faktur PPN & Penerimaan Pelanggan',
    deskripsi: 'Proses penawaran penjualan, pesanan penjualan (Sales Order), pengiriman barang (DO), faktur penjualan kredit dengan PPN 11%, serta pelunasan piutang dengan potongan penjualan di Accurate Online.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/sales-02',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-sales/view',
    deadline: '2026-09-15',
    max_score: 100,
    kompetensi: 'AOL - Siklus Penjualan & Penerimaan Kas/Bank'
  },

  // 3. Kas Kecil & Pengeluaran Kas
  {
    id: 'prak_pjdm_03',
    topic_id: 'top_03',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Buku Kas Kecil Metode Imprest vs Fluktuasi',
    deskripsi: 'Penyusunan bukti voucher pengeluaran kas kecil, pencatatan transaksi ke Buku Kas Kecil sistem dana tetap (Imprest) dan dana tidak tetap, serta penjurnalan saat pengisian kembali kas kecil.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-kas-kecil/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-kas-kecil/view',
    deadline: '2026-09-18',
    max_score: 100,
    kompetensi: 'PJDM - Pengelolaan Dana Kas Kecil'
  },

  // 4. Kas Bank & Rekonsiliasi Bank
  {
    id: 'prak_pjdm_04',
    topic_id: 'top_04',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Kertas Kerja Rekonsiliasi Bank 4 Kolom & 8 Kolom',
    deskripsi: 'Verifikasi mutasi rekening koran bank vs buku kas bank perusahaan, identifikasi Deposit in Transit, Outstanding Check, biaya administrasi bank, jasa giro, dan penyusunan jurnal penyesuaian rekonsiliasi.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-rekonsiliasi/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-rekonsiliasi/view',
    deadline: '2026-09-22',
    max_score: 100,
    kompetensi: 'PJDM - Rekonsiliasi Bank & Jurnal Koreksi'
  },
  {
    id: 'prak_aol_03',
    topic_id: 'top_04',
    tipe_praktik: 'AOL',
    target_types: ['AOL'],
    judul: 'Praktik AOL: Modul Kas & Bank serta Rekonsiliasi Rekening Koran Digital',
    deskripsi: 'Pencatatan pembayaran operasional via modul Kas & Bank di Accurate Online, transfer antar bank, impor file mutasi rekening koran, dan pelaksanaan proses rekonsiliasi bank otomatis.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/bank-03',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-bank/view',
    deadline: '2026-09-25',
    max_score: 100,
    kompetensi: 'AOL - Manajemen Kas Bank & Sinkronisasi Mutasi'
  },

  // 5. Aset Tetap & Penyusutan
  {
    id: 'prak_pjdm_05',
    topic_id: 'top_05',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Tabel Penyusutan Aset Tetap & Jurnal Depresiasi',
    deskripsi: 'Penyusunan tabel perhitungan penyusutan aset tetap metode Garis Lurus dan Saldo Menurun Ganda, pencatatan beban penyusutan akhir tahun, serta penjurnalan pelepasan/penjualan aset tetap.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-aset-tetap/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-aset/view',
    deadline: '2026-09-28',
    max_score: 100,
    kompetensi: 'PJDM - Aset Tetap & Akumulasi Penyusutan'
  },
  {
    id: 'prak_aol_04',
    topic_id: 'top_05',
    tipe_praktik: 'AOL',
    target_types: ['AOL'],
    judul: 'Praktik AOL: Modul Aset Tetap, Kategori Pajak & Proses Akhir Bulan',
    deskripsi: 'Input data aset tetap di modul Aset Tetap AOL, penentuan golongan aktiva tetap pajak, umur ekonomis, metode penyusutan, dan eksekusi fitur Period End (Proses Akhir Bulan) untuk depresiasi otomatis.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/fixed-assets-04',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-fixed-assets/view',
    deadline: '2026-09-30',
    max_score: 100,
    kompetensi: 'AOL - Modul Aset Tetap & Period End'
  },

  // 6. Jurnal Khusus Pembelian & Utang Usaha
  {
    id: 'prak_pjdm_06',
    topic_id: 'top_12',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Jurnal Khusus Pembelian & Kartu Utang Usaha',
    deskripsi: 'Pencatatan faktur pembelian barang dagang secara kredit, PPN Masukan, biaya angkut pembelian (FOB Shipping Point), dan posting ke Kartu Pembantu Utang.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-pembelian/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-pembelian/view',
    deadline: '2026-10-02',
    max_score: 100,
    kompetensi: 'PJDM - Siklus Pembelian & Kartu Utang'
  },
  {
    id: 'prak_aol_05',
    topic_id: 'top_12',
    tipe_praktik: 'AOL',
    target_types: ['AOL'],
    judul: 'Praktik AOL: Siklus Pembelian Lengkap (PO, RI, PI & Pembayaran Pemasok)',
    deskripsi: 'Proses alur pesanan pembelian (Purchase Order), penerimaan barang (Receive Item), faktur pembelian (Purchase Invoice) dengan PPN 11%, dan pembayaran ke pemasok via modul Pembelian Accurate Online.',
    link_spreadsheet: 'https://aol-app.smk.id/simulasi/task/purchase-05',
    link_petunjuk: 'https://drive.google.com/file/d/sample-guide-aol-purchase/view',
    deadline: '2026-10-05',
    max_score: 100,
    kompetensi: 'AOL - Siklus Pembelian & Pembayaran Pemasok'
  },

  // 7. Jurnal Penyesuaian & Neraca Lajur 10 Kolom
  {
    id: 'prak_pjdm_07',
    topic_id: 'top_10',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Ayat Jurnal Penyesuaian (AJP) & Kertas Kerja 10 Kolom',
    deskripsi: 'Pembuatan ayat jurnal penyesuaian akhir periode (beban dibayar dimuka, pendapatan diterima dimuka, piutang tak tertagih, penyusutan) dan penyusunan Neraca Lajur (Worksheet) 10 kolom hingga seimbang.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-ajp-neracalajur/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-ajp/view',
    deadline: '2026-10-08',
    max_score: 100,
    kompetensi: 'PJDM - AJP & Kertas Kerja 10 Kolom'
  },

  // 8. Laporan Keuangan SAK EP & Jurnal Penutup
  {
    id: 'prak_pjdm_08',
    topic_id: 'top_06',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Penyusunan Laporan Keuangan Lengkap & Jurnal Penutup',
    deskripsi: 'Penyusunan Laporan Laba Rugi Komprehensif, Laporan Perubahan Ekuitas, Laporan Posisi Keuangan (Neraca), Laporan Arus Kas, serta pembuatan Ayat Jurnal Penutup dan Neraca Saldo Setelah Penutupan.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-laporan-keuangan/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-laporan/view',
    deadline: '2026-10-12',
    max_score: 100,
    kompetensi: 'PJDM - Laporan Keuangan SAK EP & Jurnal Penutup'
  },

  // 9. Perpajakan PPh 21 TER & SPT PPN Masa
  {
    id: 'prak_pjdm_09',
    topic_id: 'top_33',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Perhitungan PPh 21 TER & Rekapitulasi PPN Masukan/Keluaran',
    deskripsi: 'Perhitungan pemotongan PPh Pasal 21 pegawai tetap menggunakan Tarif Efektif Rata-rata (TER Bulanan), pembuatan bukti potong, serta rekapitulasi PPN Lebih Bayar/Kurang Bayar periode berjalan.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-pajak/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-pajak/view',
    deadline: '2026-10-15',
    max_score: 100,
    kompetensi: 'PJDM - Akuntansi Perpajakan & PPh 21 TER'
  },

  // 10. Manufaktur & Harga Pokok Produksi
  {
    id: 'prak_pjdm_10',
    topic_id: 'top_54',
    tipe_praktik: 'PJDM',
    target_types: ['PJDM'],
    judul: 'Praktik PJDM: Laporan Harga Pokok Produksi & Siklus Akuntansi Biaya Manufaktur',
    deskripsi: 'Pencatatan pemakaian bahan baku, biaya tenaga kerja langsung, pembebanan BOP, perhitungan unit ekuivalen proses, dan penyusunan Laporan Harga Pokok Produksi (Cost of Goods Manufactured).',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-hpp-manufaktur/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-manufaktur/view',
    deadline: '2026-10-18',
    max_score: 100,
    kompetensi: 'PJDM - Akuntansi Biaya & Laporan HP Produksi'
  },

  // 11. Simulasi Terpadu LKS PJDM & AOL
  {
    id: 'prak_pjdm_11',
    topic_id: 'top_01',
    tipe_praktik: 'PJDM & AOL',
    target_types: ['PJDM', 'AOL'],
    judul: 'Praktik PJDM & AOL: Simulasi Kasus Terpadu LKS Akuntansi (30 Transaksi Perusahaan Dagang & Jasa)',
    deskripsi: 'Pengerjaan studi kasus terpadu komprehensif 30 transaksi lengkap: PJDM Spreadsheet 90 menit dan input AOL 90 menit hingga terbit Laporan Posisi Keuangan dan Laba Rugi terverifikasi.',
    link_spreadsheet: 'https://docs.google.com/spreadsheets/d/1sample-pjdm-aol-lks-simulasi/edit#gid=0',
    link_petunjuk: 'https://drive.google.com/file/d/sample-petunjuk-simulasi-lks/view',
    deadline: '2026-10-22',
    max_score: 100,
    kompetensi: 'Simulasi Terpadu LKS - PJDM Spreadsheet & Accurate Online Digital'
  }
];
