import {
  Student,
  Teacher,
  ClassRoom,
  Topic,
  Task,
  Question,
  OralQuestion,
  StudentProgress,
  Submission,
  QuizResult,
  OralSubmission,
  PresentationSubmission,
  AppSettings,
  Material,
  AppNotification
} from '../types';
import { TOPICS_60, ALL_QUESTIONS_60 } from './questionBankData';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    teacher_id: 'tch_01',
    nama: 'Dra. Endang Rahayu, M.Pd.',
    email: 'endang.rahayu@smk.belajar.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    teacher_id: 'tch_02',
    nama: 'Budi Santoso, S.E., Ak.',
    email: 'budi.santoso@smk.belajar.id',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    class_id: 'cls_11_akl_1',
    nama_kelas: 'XI AKL 1 (Akuntansi & Keuangan Lembaga)',
    tahun_ajaran: '2026/2027',
    teacher_id: 'tch_01',
    total_siswa: 5
  },
  {
    class_id: 'cls_11_akl_2',
    nama_kelas: 'XI AKL 2 (Akuntansi & Keuangan Lembaga)',
    tahun_ajaran: '2026/2027',
    teacher_id: 'tch_02',
    total_siswa: 5
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    student_id: 'std_01',
    user_id: 'usr_std_01',
    nama: 'Andi Saputra',
    kelas: 'XI AKL 1',
    nomor_absen: 1,
    email: 'andi.saputra@student.smk.id',
    password: 'andi123',
    password_updated_at: '2026-08-01T08:00:00.000Z',
    status: 'aktif',
    level: 4,
    xp: 1420,
    badges: ['First Submission', 'HOTS Learner', 'Presentation Star', 'Accounting Master'],
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_02',
    user_id: 'usr_std_02',
    nama: 'Siti Nurhaliza',
    kelas: 'XI AKL 1',
    nomor_absen: 2,
    email: 'siti.nurhaliza@student.smk.id',
    password: 'siti123',
    password_updated_at: '2026-08-02T09:15:00.000Z',
    status: 'aktif',
    level: 3,
    xp: 1150,
    badges: ['First Submission', 'Presentation Star'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_03',
    user_id: 'usr_std_03',
    nama: 'Bagus Pratama',
    kelas: 'XI AKL 1',
    nomor_absen: 3,
    email: 'bagus.pratama@student.smk.id',
    password: 'bagus123',
    password_updated_at: '2026-08-03T10:30:00.000Z',
    status: 'remedial',
    level: 2,
    xp: 680,
    badges: ['First Submission'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_04',
    user_id: 'usr_std_04',
    nama: 'Dewi Lestari',
    kelas: 'XI AKL 1',
    nomor_absen: 4,
    email: 'dewi.lestari@student.smk.id',
    password: 'dewi123',
    password_updated_at: '2026-08-04T11:00:00.000Z',
    status: 'aktif',
    level: 3,
    xp: 990,
    badges: ['First Submission', 'HOTS Master'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_05',
    user_id: 'usr_std_05',
    nama: 'Eko Wijaya',
    kelas: 'XI AKL 1',
    nomor_absen: 5,
    email: 'eko.wijaya@student.smk.id',
    password: 'eko123',
    password_updated_at: '2026-08-05T13:20:00.000Z',
    status: 'aktif',
    level: 2,
    xp: 720,
    badges: ['First Submission'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_06',
    user_id: 'usr_std_06',
    nama: 'Fitri Handayani',
    kelas: 'XI AKL 2',
    nomor_absen: 1,
    email: 'fitri.handayani@student.smk.id',
    password: 'fitri123',
    password_updated_at: '2026-08-06T14:10:00.000Z',
    status: 'aktif',
    level: 4,
    xp: 1300,
    badges: ['First Submission', 'HOTS Master', 'Presentation Star'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_07',
    user_id: 'usr_std_07',
    nama: 'Gilang Ramadhan',
    kelas: 'XI AKL 2',
    nomor_absen: 2,
    email: 'gilang.ramadhan@student.smk.id',
    password: 'gilang123',
    password_updated_at: '2026-08-07T15:45:00.000Z',
    status: 'remedial',
    level: 1,
    xp: 450,
    badges: ['First Submission'],
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_08',
    user_id: 'usr_std_08',
    nama: 'Hani Susanti',
    kelas: 'XI AKL 2',
    nomor_absen: 3,
    email: 'hani.susanti@student.smk.id',
    password: 'hani123',
    password_updated_at: '2026-08-08T08:30:00.000Z',
    status: 'aktif',
    level: 3,
    xp: 1080,
    badges: ['First Submission', 'HOTS Learner'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_09',
    user_id: 'usr_std_09',
    nama: 'Irfan Maulana',
    kelas: 'XI AKL 2',
    nomor_absen: 4,
    email: 'irfan.maulana@student.smk.id',
    password: 'irfan123',
    password_updated_at: '2026-08-09T09:40:00.000Z',
    status: 'aktif',
    level: 2,
    xp: 810,
    badges: ['First Submission'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    student_id: 'std_10',
    user_id: 'usr_std_10',
    nama: 'Jasmine Putri',
    kelas: 'XI AKL 2',
    nomor_absen: 5,
    email: 'jasmine.putri@student.smk.id',
    password: 'jasmine123',
    password_updated_at: '2026-08-10T11:15:00.000Z',
    status: 'aktif',
    level: 3,
    xp: 1120,
    badges: ['First Submission', 'Presentation Star'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_TOPICS: Topic[] = TOPICS_60;

export const INITIAL_MATERIALS: Material[] = [
  {
    material_id: 'mat_01',
    topic_id: 'top_01',
    judul: 'Modul Teori & Praktik Persediaan (FIFO, LIFO, Average)',
    link_materi: 'https://drive.google.com/file/d/sample-persediaan-guide/view',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    deskripsi: 'Sistem pencatatan persediaan perpetual dan periodik serta penyusunan kartu persediaan.',
    ringkasan: 'Persediaan dicatat dengan metode Perpetual (real-time) atau Periodik. FIFO mengasumsikan barang masuk pertama dijual pertama.'
  },
  {
    material_id: 'mat_02',
    topic_id: 'top_02',
    judul: 'Modul Piutang Usaha & Estimasi Kerugian Piutang',
    link_materi: 'https://drive.google.com/file/d/sample-piutang-guide/view',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    deskripsi: 'Pencatatan timbulnya piutang, termin pembayaran, serta penghitungan cadangan kerugian piutang tak tertagih.',
    ringkasan: 'Piutang usaha timbul dari penjualan kredit. Metode cadangan mengakui beban estimasi kerugian piutang pada periode berjalan.'
  },
  {
    material_id: 'mat_03',
    topic_id: 'top_03',
    judul: 'Modul Pengelolaan Kas Kecil (Imprest & Fluktuasi)',
    link_materi: 'https://drive.google.com/file/d/sample-kas-kecil-guide/view',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    deskripsi: 'Pengelolaan dana kas kecil dengan sistem dana tetap (Imprest Fund System) dan sistem dana tidak tetap.',
    ringkasan: 'Metode Imprest tidak menjurnal saat pengeluaran kas kecil melainkan saat pembentukan dan pengisian kembali kas kecil.'
  },
  {
    material_id: 'mat_04',
    topic_id: 'top_04',
    judul: 'Modul Kas Bank & Rekonsiliasi Bank',
    link_materi: 'https://drive.google.com/file/d/sample-kas-bank-guide/view',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    deskripsi: 'Analisis perbedaan saldo kas perusahaan dengan rekening koran bank dan pembuatan jurnal penyesuaian rekonsiliasi.',
    ringkasan: 'Perbedaan saldo timbul akibat Deposit in Transit, Outstanding Check, Jasa Giro, Biaya Administrasi Bank, dan Koreksi Kesalahan.'
  },
  {
    material_id: 'mat_05',
    topic_id: 'top_05',
    judul: 'Modul Aset Tetap & Metode Penyusutan',
    link_materi: 'https://drive.google.com/file/d/sample-aset-tetap-guide/view',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    deskripsi: 'Harga perolehan aset tetap, perhitungan beban penyusutan tahunan, serta penghentian dan pelepasan aset.',
    ringkasan: 'Aset tetap memiliki masa manfaat lebih dari 1 tahun. Metode penyusutan mencakup Garis Lurus, Saldo Menurun Ganda, dan Unit Produksi.'
  }
];

export const INITIAL_TASKS: Task[] = [
  // 1. PERTEMUAN 1: TEORI UTAMA 1 - PERSEDIAAN
  {
    task_id: 'tsk_theory_01',
    topic_id: 'top_01',
    task_type: 'Teori',
    judul: '1. Teori Utama: Persediaan Barang Dagang & Penilaian HPP',
    deskripsi: 'Kerjakan 20 soal teori bilingual Middle & HOTS seputar metode FIFO, LIFO, Average, dan pencatatan kartu persediaan perpetual.',
    deadline: '2026-08-25',
    urutan: 1,
    pertemuan: 1,
    pertemuan_judul: 'Pertemuan 1: Penguasaan Teori Persediaan & Penilaian HPP',
    wajib: true,
    status: 'sedang_dikerjakan',
    max_score: 100
  },
  // 2. PERTEMUAN 2: TEORI UTAMA 2 - PIUTANG USAHA
  {
    task_id: 'tsk_theory_02',
    topic_id: 'top_02',
    task_type: 'Teori',
    judul: '2. Teori Utama: Piutang Usaha & Estimasi Kerugian Piutang',
    deskripsi: 'Kerjakan 20 soal teori bilingual Middle & HOTS seputar pengakuan piutang, termin 2/10 n/30, dan cadangan kerugian piutang.',
    deadline: '2026-08-26',
    urutan: 2,
    pertemuan: 2,
    pertemuan_judul: 'Pertemuan 2: Piutang Dagang & Cadangan Kerugian Piutang',
    wajib: true,
    status: 'belum_mulai',
    prerequisite_task_id: 'tsk_theory_01',
    max_score: 100
  },
  // 3. PERTEMUAN 3: TEORI UTAMA 3 - KAS KECIL
  {
    task_id: 'tsk_theory_03',
    topic_id: 'top_03',
    task_type: 'Teori',
    judul: '3. Teori Utama: Pengelolaan Dana Kas Kecil (Imprest & Fluktuasi)',
    deskripsi: 'Kerjakan 20 soal teori bilingual Middle & HOTS seputar pembentukan, pengeluaran kas kecil, dan pengisian kembali.',
    deadline: '2026-08-27',
    urutan: 3,
    pertemuan: 3,
    pertemuan_judul: 'Pertemuan 3: Pengelolaan Kas Kecil Sistem Imprest & Fluktuasi',
    wajib: true,
    status: 'belum_mulai',
    prerequisite_task_id: 'tsk_theory_02',
    max_score: 100
  },
  // 4. PERTEMUAN 4: TEORI UTAMA 4 - KAS BANK & REKONSILIASI
  {
    task_id: 'tsk_theory_04',
    topic_id: 'top_04',
    task_type: 'Teori',
    judul: '4. Teori Utama: Kas Bank & Penyusunan Rekonsiliasi Bank',
    deskripsi: 'Kerjakan 20 soal teori bilingual Middle & HOTS seputar setoran dalam perjalanan (DIT), cek beredar (OC), dan rekonsiliasi saldo kas.',
    deadline: '2026-08-28',
    urutan: 4,
    pertemuan: 4,
    pertemuan_judul: 'Pertemuan 4: Kas Bank & Penyusunan Rekonsiliasi Bank',
    wajib: true,
    status: 'belum_mulai',
    prerequisite_task_id: 'tsk_theory_03',
    max_score: 100
  },
  // 5. PERTEMUAN 5: TEORI UTAMA 5 - ASET TETAP & PENYUSUTAN
  {
    task_id: 'tsk_theory_05',
    topic_id: 'top_05',
    task_type: 'Teori',
    judul: '5. Teori Utama: Perolehan & Penyusutan Aset Tetap',
    deskripsi: 'Kerjakan 20 soal teori bilingual Middle & HOTS seputar harga perolehan, metode penyusutan (Garis Lurus, Saldo Menurun, Unit Produksi), dan pelepasan aset.',
    deadline: '2026-08-29',
    urutan: 5,
    pertemuan: 5,
    pertemuan_judul: 'Pertemuan 5: Pengakuan & Perhitungan Penyusutan Aset Tetap',
    wajib: true,
    status: 'belum_mulai',
    prerequisite_task_id: 'tsk_theory_04',
    max_score: 100
  },
  // 6. PERTEMUAN 6: PRAKTIK PJDM (HANYA TERBUKA SETELAH 5 TEORI UTAMA SELESAI)
  {
    task_id: 'tsk_pjdm_01',
    topic_id: 'top_01',
    task_type: 'PJDM',
    judul: 'Praktik PJDM: Kartu Persediaan FIFO & Lembar Kerja Kasus Terpadu',
    deskripsi: 'Input transaksi kartu persediaan FIFO perpetual, mutasi kas, dan jurnal penyesuaian pada spreadsheet PJDM terstandar LKS.',
    link_materi: 'https://drive.google.com/file/d/sample-pjdm-material',
    link_tugas: 'https://docs.google.com/spreadsheets/d/sample-pjdm-template',
    deadline: '2026-09-01',
    urutan: 6,
    pertemuan: 6,
    pertemuan_judul: 'Pertemuan 6: Praktik Siklus Akuntansi Manual (PJDM)',
    wajib: true,
    status: 'belum_mulai',
    prerequisite_task_id: 'tsk_theory_05',
    max_score: 100
  },
  // 7. PERTEMUAN 7: PRAKTIK AOL (HANYA TERBUKA SETELAH PJDM SELESAI)
  {
    task_id: 'tsk_aol_01',
    topic_id: 'top_01',
    task_type: 'AOL',
    judul: 'Praktik AOL: Laporan Simulasi Akuntansi Online (AOL)',
    deskripsi: 'Posting data transaksi persediaan, piutang, kas, dan aset tetap ke modul Akuntansi Online (AOL) dan unduh laporan posisi keuangan.',
    link_materi: 'https://drive.google.com/file/d/sample-aol-material',
    link_tugas: 'https://aol-app.smk.id/task/01',
    deadline: '2026-09-05',
    urutan: 7,
    pertemuan: 7,
    pertemuan_judul: 'Pertemuan 7: Komputer Akuntansi Accurate Online (AOL)',
    wajib: true,
    status: 'belum_mulai',
    prerequisite_task_id: 'tsk_pjdm_01',
    max_score: 100
  },
  // 8. PERTEMUAN 8: PRESENTASI & MATERI
  {
    task_id: 'tsk_pres_01',
    topic_id: 'top_01',
    task_type: 'Presentasi',
    judul: 'Tugas Video Presentasi: Analisis Akuntansi Persediaan & Pengendalian Kas',
    deskripsi: 'Buat video presentasi durasi 3-5 menit memaparkan analisis komprehensif kartu persediaan, rekonsiliasi kas, dan penyusutan aset tetap.',
    link_materi: 'https://drive.google.com/file/d/sample-pres-guide',
    deadline: '2026-09-10',
    urutan: 8,
    pertemuan: 8,
    pertemuan_judul: 'Pertemuan 8: Pemaparan Video Presentasi & Wawancara Juri LKS',
    wajib: true,
    status: 'belum_mulai',
    prerequisite_task_id: 'tsk_aol_01',
    rubrik: [
      { aspek: 'Penguasaan Materi', bobot: 30 },
      { aspek: 'Ketepatan Konsep', bobot: 25 },
      { aspek: 'Penyampaian & Komunikasi', bobot: 20 },
      { aspek: 'Struktur Video', bobot: 15 },
      { aspek: 'Kreativitas & Visual', bobot: 10 }
    ],
    max_score: 100
  }
];

export const INITIAL_QUESTIONS: Question[] = ALL_QUESTIONS_60;

export const INITIAL_ORAL_QUESTIONS: OralQuestion[] = [
  {
    oral_question_id: 'oral_q_top01_m01',
    topic_id: 'top_01',
    difficulty: 'MIDDLE',
    question_id: 'Jelaskan apa yang dimaksud dengan Persamaan Dasar Akuntansi dan mengapa Aset harus selalu seimbang dengan penjumlahan Liabilitas dan Ekuitas!',
    question_en: 'Explain what the Basic Accounting Equation is and why Assets must always equal the sum of Liabilities and Equity!'
  },
  {
    oral_question_id: 'oral_q_top01_h01',
    topic_id: 'top_01',
    difficulty: 'HOTS',
    question_id: 'Jika sebuah perusahaan mengambil pinjaman bank untuk membeli gedung operasional, bagaimana analisis Anda terkait risiko solvabilitas dan dampaknya terhadap posisi keuangan jangka panjang?',
    question_en: 'If a company takes a bank loan to buy an operational building, how would you analyze the solvency risk and its impact on long-term financial position?'
  },
  {
    oral_question_id: 'oral_q_top19_h01',
    topic_id: 'top_19',
    difficulty: 'HOTS',
    question_id: 'Jika suatu perusahaan mengalami lonjakan nilai persediaan akhir hingga 200% namun penjualan stagnan, bagaimana analisis Anda mengenai efisiensi modal kerja dan risiko penurunan nilai persediaan?',
    question_en: 'If a company experiences a 200% spike in ending inventory while sales stagnate, how would you analyze working capital efficiency and inventory impairment risk?'
  }
];

export const INITIAL_STUDENT_PROGRESS: StudentProgress[] = [
  {
    student_id: 'std_01',
    pjdm_progress: 100,
    aol_progress: 80,
    theory_progress: 85,
    presentation_progress: 70,
    oral_progress: 75,
    overall_progress: 82,
    remedial_count: 0,
    strengths: ['Teori Persamaan Dasar', 'Jurnal Umum', 'Penjurnalan Metode Perpetual'],
    weaknesses: ['Rasio Solvabilitas', 'Analisis Arus Kas'],
    recommendations: ['Tingkatkan latihan analisis kasus HOTS Rasio Keuangan', 'Coba rekam ulang oral interview topik 19 untuk nilai maksimal']
  },
  {
    student_id: 'std_03',
    pjdm_progress: 50,
    aol_progress: 40,
    theory_progress: 55,
    presentation_progress: 30,
    oral_progress: 20,
    overall_progress: 39,
    remedial_count: 2,
    strengths: ['Pencatatan Bukti Transaksi Kas'],
    weaknesses: ['Jurnal Penyesuaian', 'Metode Persediaan Perpetual', 'Presentasi Komunikasi'],
    recommendations: ['Wajib mengikuti remedial Teori Penyesuaian', 'Pelajari kembali video tutorial pembuatan Kertas Kerja']
  }
];

export const INITIAL_QUIZ_RESULTS: QuizResult[] = [
  {
    result_id: 'res_01',
    student_id: 'std_01',
    topic_id: 'top_01',
    score: 85,
    total_questions: 20,
    correct: 17,
    wrong: 3,
    duration_seconds: 780,
    submitted_at: '2026-08-11 14:30',
    middle_score: 90,
    hots_score: 80,
    remedial_required: false
  },
  {
    result_id: 'res_03',
    student_id: 'std_03',
    topic_id: 'top_01',
    score: 55,
    total_questions: 20,
    correct: 11,
    wrong: 9,
    duration_seconds: 1100,
    submitted_at: '2026-08-10 10:15',
    middle_score: 60,
    hots_score: 50,
    remedial_required: true
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    submission_id: 'sub_01',
    student_id: 'std_01',
    task_id: 'tsk_pjdm_01',
    topic_id: 'top_01',
    link: 'https://docs.google.com/spreadsheets/d/sample-andi-pjdm',
    catatan_siswa: 'Sudah diisi lengkap 10 transaksi dan neraca balance.',
    submitted_at: '2026-08-11 09:00',
    status: 'sudah_dinilai',
    score: 95,
    feedback: 'Pekerjaan sangat rapi dan neraca seimbang sempurna!'
  }
];

export const INITIAL_ORAL_SUBMISSIONS: OralSubmission[] = [
  {
    oral_submission_id: 'oral_sub_01',
    student_id: 'std_01',
    topic_id: 'top_01',
    oral_question_id: 'oral_q_top01_m01',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg',
    transcript: 'Persamaan dasar akuntansi adalah hubungan antara aset, kewajiban, dan ekuitas. Aset harus seimbang karena seluruh aset yang dimiliki perusahaan didanai oleh kewajiban dari kreditur atau ekuitas dari pemilik modal.',
    duration_seconds: 42,
    submitted_at: '2026-08-11 11:20',
    ai_score: 88,
    teacher_score: 90,
    ai_eval: {
      concept_accuracy: 90,
      reasoning: 85,
      completeness: 88,
      communication: 90,
      recommended_score: 88,
      summary_feedback: 'Penjelasan konsep seimbang aset vs utang+ekuitas sangat tepat dan artikulasi jelas.',
      strengths: ['Penggunaan terminologi akuntansi tepat', 'Struktur jawaban logis'],
      improvements: ['Dapat menambahkan contoh konkret jenis aset lancar']
    },
    feedback: 'Sangat bagus Andi! Penjelasan terdengar lugas dan penuh percaya diri.',
    status: 'reviewed'
  }
];

export const INITIAL_PRESENTATION_SUBMISSIONS: PresentationSubmission[] = [
  {
    presentation_id: 'pres_sub_01',
    student_id: 'std_01',
    topic_id: 'top_01',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    catatan: 'Video presentasi YouTube unlisted durasi 4 menit 15 detik.',
    submitted_at: '2026-08-11 15:00',
    score: 88,
    feedback: 'Visualisasi grafik menarik, suara terdengar jelas.',
    rubric_scores: {
      'Penguasaan Materi': 28,
      'Ketepatan Konsep': 23,
      'Penyampaian & Komunikasi': 18,
      'Struktur Video': 12,
      'Kreativitas & Visual': 7
    },
    status: 'reviewed'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  spreadsheet_id: '1a2b3c4d5e6f_SMK_Accounting_LMS_2026',
  google_api_key: '',
  webhook_url: 'https://script.google.com/macros/s/sample/exec',
  auto_ai_eval: true,
  bilingual_default: true,
  enable_gamification: true,
  enable_socratic_tutor: true,
  passing_grade_default: 75
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_01',
    student_id: 'std_01',
    type: 'task_feedback',
    title: 'Feedback Tugas Diterima: Nilai 92',
    message: 'Guru memberikan evaluasi pada tugas Praktik PJDM - Kas Kecil: "Pencatatan metode imprest sangat rapi dan rekonsiliasi tepat. Pertahankan!"',
    target_type: 'task',
    target_id: 'tsk_02',
    score: 92,
    feedback: 'Pencatatan metode imprest sangat rapi dan rekonsiliasi tepat. Pertahankan!',
    created_at: '2026-08-24T08:30:00.000Z',
    read: false,
    sender_name: 'Dra. Endang Rahayu, M.Pd.'
  },
  {
    id: 'notif_02',
    student_id: 'all',
    type: 'new_task',
    title: 'Tugas Baru: Praktik PJDM - Aset Tetap & Depresiasi',
    message: 'Guru menambahkan tugas baru "Praktik PJDM - Aset Tetap & Depresiasi" (Tenggat: 30 Agustus 2026). Silakan buka Alur Pembelajaran untuk mulai mengerjakan.',
    target_type: 'task',
    target_id: 'tsk_03',
    created_at: '2026-08-23T14:15:00.000Z',
    read: false,
    sender_name: 'Dra. Endang Rahayu, M.Pd.'
  },
  {
    id: 'notif_03',
    student_id: 'std_01',
    type: 'oral_feedback',
    title: 'Feedback Wawancara Oral AI: Nilai 90',
    message: 'Guru mengulas rekaman wawancara lisan: "Sangat bagus Andi! Penjelasan terdengar lugas dan penuh percaya diri."',
    target_type: 'oral',
    target_id: 'oral_sub_01',
    score: 90,
    feedback: 'Sangat bagus Andi! Penjelasan terdengar lugas dan penuh percaya diri.',
    created_at: '2026-08-22T10:00:00.000Z',
    read: true,
    sender_name: 'Dra. Endang Rahayu, M.Pd.'
  },
  {
    id: 'notif_04',
    student_id: 'all',
    type: 'announcement',
    title: 'Simulasi LKS SMK Akuntansi 2026 Dimulai',
    message: 'Persiapkan seluruh materi Teori, PJDM, dan AOL. Kerjakan kuis penguatan HOTS untuk meningkatkan XP dan peringkat leaderboard.',
    target_type: 'general',
    created_at: '2026-08-20T07:00:00.000Z',
    read: true,
    sender_name: 'Pelatih LKS Akuntansi'
  }
];

