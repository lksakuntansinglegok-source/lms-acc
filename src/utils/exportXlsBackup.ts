import * as XLSX from 'xlsx';
import {
  Student,
  Task,
  Topic,
  Submission,
  QuizResult,
  OralSubmission,
  PresentationSubmission,
  StudentProgress
} from '../types';

export interface BackupDataPayload {
  students: Student[];
  tasks: Task[];
  topics: Topic[];
  submissions: Submission[];
  quizResults: QuizResult[];
  oralSubmissions: OralSubmission[];
  presentationSubmissions: PresentationSubmission[];
  progressList: StudentProgress[];
}

export function generateAndDownloadXlsBackup(data: BackupDataPayload): string {
  const {
    students = [],
    tasks = [],
    topics = [],
    submissions = [],
    quizResults = [],
    oralSubmissions = [],
    presentationSubmissions = [],
    progressList = []
  } = data;

  // Helper maps for quick lookups
  const studentMap = new Map<string, Student>();
  students.forEach(s => studentMap.set(s.student_id, s));

  const taskMap = new Map<string, Task>();
  tasks.forEach(t => taskMap.set(t.task_id, t));

  const topicMap = new Map<string, Topic>();
  topics.forEach(tp => topicMap.set(tp.topic_id, tp));

  // 1. Sheet 1: Data Siswa & Akun
  const rowsSiswa = students.map(s => ({
    'ID Siswa': s.student_id,
    'Nama Lengkap': s.nama,
    'Kelas': s.kelas,
    'No. Absen': s.nomor_absen,
    'Email Siswa': s.email,
    'Kata Sandi Mandiri': s.password || 'siswa123',
    'Level': s.level || 1,
    'Total XP': s.xp || 0,
    'Status Siswa': s.status || 'aktif',
    'Badges Penghargaan': (s.badges || []).join(', ')
  }));

  // 2. Sheet 2: Link Pengumpulan Tugas (PJDM, AOL, Presentasi, dll.)
  const rowsTugas = submissions.map(sub => {
    const st = studentMap.get(sub.student_id);
    const tsk = taskMap.get(sub.task_id);
    const top = topicMap.get(sub.topic_id);

    return {
      'ID Submisi': sub.submission_id,
      'ID Siswa': sub.student_id,
      'Nama Siswa': st ? st.nama : sub.student_id,
      'Kelas': st ? st.kelas : '-',
      'Jenis Tugas': tsk ? tsk.task_type : 'Tugas Praktik',
      'Pertemuan': tsk ? `Pertemuan ${tsk.pertemuan || 1}` : '-',
      'Judul Tugas': tsk ? tsk.judul : 'Tugas',
      'Topik Pembelajaran': top ? top.nama_topik : sub.topic_id,
      'Link Pengumpulan Tugas (Spreadsheet / Drive / File)': sub.link || '-',
      'Catatan Siswa': sub.catatan_siswa || '-',
      'Status Pemeriksaan': sub.status || 'sudah_dikumpulkan',
      'Nilai / Skor Guru': sub.score !== undefined ? sub.score : '-',
      'Catatan / Feedback Guru': sub.feedback || '-',
      'Waktu Pengumpulan': sub.submitted_at || '-'
    };
  });

  // 3. Sheet 3: Hasil Ujian Teori (Nilai, Middle, HOTS, Remedial)
  const rowsQuiz = quizResults.map(q => {
    const st = studentMap.get(q.student_id);
    const top = topicMap.get(q.topic_id);

    return {
      'ID Hasil Ujian': q.result_id,
      'ID Siswa': q.student_id,
      'Nama Siswa': st ? st.nama : q.student_id,
      'Kelas': st ? st.kelas : '-',
      'Topik Ujian': top ? top.nama_topik : q.topic_id,
      'Nilai Akhir (Skor)': q.score,
      'Jumlah Benar': q.correct,
      'Jumlah Salah': q.wrong,
      'Total Soal': q.total_questions,
      'Skor Soal Middle': q.middle_score,
      'Skor Soal HOTS': q.hots_score,
      'Status Remedial': q.remedial_required ? 'REMEDIAL' : 'LULUS',
      'Durasi Pengerjaan (Detik)': q.duration_seconds || '-',
      'Waktu Pengerjaan': q.submitted_at || '-'
    };
  });

  // 4. Sheet 4: Wawancara Oral & Video Presentasi
  const rowsOral = oralSubmissions.map(o => {
    const st = studentMap.get(o.student_id);
    const top = topicMap.get(o.topic_id);

    return {
      'Kategori': 'Wawancara Oral (Audio)',
      'ID Submisi': o.oral_submission_id,
      'ID Siswa': o.student_id,
      'Nama Siswa': st ? st.nama : o.student_id,
      'Kelas': st ? st.kelas : '-',
      'Topik Kasus': top ? top.nama_topik : o.topic_id,
      'Link Video / Audio Rekaman': o.audio_url || '-',
      'Transkrip / Jawaban Siswa': o.transcript || '-',
      'Catatan / Penjelasan Tambahan': '-',
      'Skor Evaluasi AI': o.ai_score !== undefined ? o.ai_score : '-',
      'Nilai Guru / Juri': o.teacher_score !== undefined ? o.teacher_score : '-',
      'Feedback & Review Guru': o.feedback || '-',
      'Status': o.status || 'reviewed',
      'Waktu Pengumpulan': o.submitted_at || '-'
    };
  });

  const rowsPresentation = presentationSubmissions.map(p => {
    const st = studentMap.get(p.student_id);
    const top = topicMap.get(p.topic_id);

    return {
      'Kategori': 'Presentasi Kasus (Video)',
      'ID Submisi': p.presentation_id,
      'ID Siswa': p.student_id,
      'Nama Siswa': st ? st.nama : p.student_id,
      'Kelas': st ? st.kelas : '-',
      'Topik Kasus': top ? top.nama_topik : p.topic_id,
      'Link Video / Audio Rekaman': p.video_url || p.audio_url || '-',
      'Transkrip / Jawaban Siswa': '-',
      'Catatan / Penjelasan Tambahan': p.catatan || '-',
      'Skor Evaluasi AI': '-',
      'Nilai Guru / Juri': p.score !== undefined ? p.score : '-',
      'Feedback & Review Guru': p.feedback || '-',
      'Status': p.status || 'reviewed',
      'Waktu Pengumpulan': p.submitted_at || '-'
    };
  });

  const rowsWawancaraPresentasi = [...rowsOral, ...rowsPresentation];

  // 5. Sheet 5: Catatan Kemajuan, Kekuatan, Kelemahan & Rekomendasi Siswa
  const rowsCatatan = progressList.map(prog => {
    const st = studentMap.get(prog.student_id);

    return {
      'ID Siswa': prog.student_id,
      'Nama Siswa': st ? st.nama : prog.student_id,
      'Kelas': st ? st.kelas : '-',
      'Progres Keseluruhan (%)': `${prog.overall_progress || 0}%`,
      'Progres Teori (%)': `${prog.theory_progress || 0}%`,
      'Progres PJDM (%)': `${prog.pjdm_progress || 0}%`,
      'Progres AOL (%)': `${prog.aol_progress || 0}%`,
      'Progres Presentasi (%)': `${prog.presentation_progress || 0}%`,
      'Progres Wawancara Oral (%)': `${prog.oral_progress || 0}%`,
      'Jumlah Remedial': prog.remedial_count || 0,
      'Catatan Kekuatan Siswa': (prog.strengths || []).join('; ') || 'Pemahaman dasar akuntansi baik',
      'Catatan Kelemahan Siswa': (prog.weaknesses || []).join('; ') || 'Perlu latihan rekonsiliasi dan analisis studi kasus',
      'Rekomendasi Pembelajaran Guru': (prog.recommendations || []).join('; ') || 'Lanjutkan latihan tugas terstruktur pertemuan berikutnya'
    };
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create worksheets
  const ws1 = XLSX.utils.json_to_sheet(rowsSiswa.length > 0 ? rowsSiswa : [{ 'Info': 'Tidak ada data siswa' }]);
  const ws2 = XLSX.utils.json_to_sheet(rowsTugas.length > 0 ? rowsTugas : [{ 'Info': 'Tidak ada riwayat pengumpulan tugas' }]);
  const ws3 = XLSX.utils.json_to_sheet(rowsQuiz.length > 0 ? rowsQuiz : [{ 'Info': 'Tidak ada hasil kuis' }]);
  const ws4 = XLSX.utils.json_to_sheet(rowsWawancaraPresentasi.length > 0 ? rowsWawancaraPresentasi : [{ 'Info': 'Tidak ada riwayat wawancara/presentasi' }]);
  const ws5 = XLSX.utils.json_to_sheet(rowsCatatan.length > 0 ? rowsCatatan : [{ 'Info': 'Tidak ada catatan kemajuan siswa' }]);

  // Append sheets
  XLSX.utils.book_append_sheet(wb, ws1, '1_Data_Siswa');
  XLSX.utils.book_append_sheet(wb, ws2, '2_Link_Pengumpulan_Tugas');
  XLSX.utils.book_append_sheet(wb, ws3, '3_Hasil_Ujian_Teori');
  XLSX.utils.book_append_sheet(wb, ws4, '4_Wawancara_&_Presentasi');
  XLSX.utils.book_append_sheet(wb, ws5, '5_Catatan_Kemajuan_Siswa');

  // Format file name with timestamp
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `Backup_LMS_Akuntansi_SMK_${dateStr}.xls`;

  // Write and trigger download (.xls)
  XLSX.writeFile(wb, filename, { bookType: 'xls' });

  return filename;
}
