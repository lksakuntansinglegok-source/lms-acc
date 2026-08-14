import { StudentProgress, Topic } from '../types';

export interface StudyScheduleSession {
  id: string;
  day: string; // "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  timeSlot: string; // e.g. "15:30 - 16:15 (45 Mins)"
  topicName: string;
  focusArea: string; // Specific weakness or topic title
  activityType: 'Teori' | 'Latihan Soal' | 'Praktik Spreadsheet' | 'Tanya AI / Socratic' | 'Refleksi';
  description: string;
  priority: 'Tinggi' | 'Sedang' | 'Rutin';
  isWeaknessFocus: boolean;
  recommendedActionView?: 'questions' | 'socratic_tutor' | 'reflection' | 'quiz_runner' | 'practice';
}

export interface StudySchedulePlan {
  studentId?: string;
  generatedDate: string;
  weaknessCount: number;
  totalWeeklyHours: string;
  summary: string;
  sessions: StudyScheduleSession[];
}

/**
 * Helper function that generates a suggested study schedule for a student
 * based on their current 'weaknesses' list from progress data.
 */
export function generateStudySchedule(
  weaknesses: string[] = [],
  progress?: StudentProgress,
  topics: Topic[] = []
): StudySchedulePlan {
  const generatedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const validWeaknesses = Array.isArray(weaknesses)
    ? weaknesses.filter(w => typeof w === 'string' && w.trim().length > 0)
    : [];

  const weaknessCount = validWeaknesses.length;

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const timeSlots = [
    '15:30 - 16:15 (45 Mins)',
    '16:30 - 17:15 (45 Mins)',
    '19:00 - 19:45 (45 Mins)',
    '15:30 - 16:30 (60 Mins)',
    '16:30 - 17:30 (60 Mins)',
    '09:00 - 10:00 (60 Mins)'
  ];

  const sessions: StudyScheduleSession[] = [];

  if (weaknessCount > 0) {
    // Generate targeted schedule focusing on weaknesses
    validWeaknesses.forEach((weakness, idx) => {
      const day1 = daysOfWeek[idx % daysOfWeek.length];
      const day2 = daysOfWeek[(idx + 2) % daysOfWeek.length];

      // Session 1: Socratic AI Tutor & Concept Review for weakness
      sessions.push({
        id: `sched_${idx}_a`,
        day: day1,
        timeSlot: timeSlots[idx % timeSlots.length],
        topicName: weakness,
        focusArea: `Penguatan Konsep: ${weakness}`,
        activityType: 'Tanya AI / Socratic',
        description: `Diskusi interaktif konsep ${weakness} dengan Pak Guru AI untuk mengidentifikasi miskonsepsi dasar.`,
        priority: 'Tinggi',
        isWeaknessFocus: true,
        recommendedActionView: 'socratic_tutor'
      });

      // Session 2: Practice & HOTS Test for weakness
      sessions.push({
        id: `sched_${idx}_b`,
        day: day2,
        timeSlot: timeSlots[(idx + 1) % timeSlots.length],
        topicName: weakness,
        focusArea: `Latihan Soal HOTS: ${weakness}`,
        activityType: 'Latihan Soal',
        description: `Mengerjakan 5-10 soal tingkat Middle & HOTS untuk materi ${weakness} di Bank Soal.`,
        priority: 'Tinggi',
        isWeaknessFocus: true,
        recommendedActionView: 'questions'
      });
    });

    // Fill remaining days with practical spreadsheet exercises & reflection
    if (sessions.length < 5) {
      sessions.push({
        id: 'sched_practical',
        day: 'Jumat',
        timeSlot: '16:00 - 17:00 (60 Mins)',
        topicName: 'Praktik Keahlian Akuntansi',
        focusArea: 'Pengelolaan Lembar Kerja & Spreadsheet',
        activityType: 'Praktik Spreadsheet',
        description: 'Pengerjaan modul praktik PJDM / Kas Kecil / Persediaan pada Google Sheets.',
        priority: 'Sedang',
        isWeaknessFocus: false,
        recommendedActionView: 'questions'
      });

      sessions.push({
        id: 'sched_reflection',
        day: 'Sabtu',
        timeSlot: '09:30 - 10:15 (45 Mins)',
        topicName: 'Jurnal Refleksi Belajar',
        focusArea: 'Evaluasi Mandiri & Rencana Perbaikan',
        activityType: 'Refleksi',
        description: 'Menuliskan poin kemajuan dan rencana tindak lanjut di Jurnal Refleksi Harian.',
        priority: 'Rutin',
        isWeaknessFocus: false,
        recommendedActionView: 'reflection'
      });
    }
  } else {
    // Default schedule for well-performing students or full mastery maintenance
    const defaultTopics = [
      'Persamaan Dasar & Siklus Akuntansi',
      'Jurnal Penyesuaian & Kertas Kerja',
      'Persediaan Barang Dagang & HPP',
      'Rasio Keuangan & Analisis Laporan',
      'Akuntansi Biaya & Manufaktur'
    ];

    defaultTopics.forEach((top, idx) => {
      sessions.push({
        id: `sched_def_${idx}`,
        day: daysOfWeek[idx],
        timeSlot: timeSlots[idx],
        topicName: top,
        focusArea: `Mastery & Penguatan HOTS: ${top}`,
        activityType: idx % 2 === 0 ? 'Latihan Soal' : 'Praktik Spreadsheet',
        description: `Sesi latihan mandiri dan penguasaan kasus analitis untuk topik ${top}.`,
        priority: 'Sedang',
        isWeaknessFocus: false,
        recommendedActionView: 'questions'
      });
    });

    sessions.push({
      id: 'sched_def_reflection',
      day: 'Sabtu',
      timeSlot: '09:00 - 10:00 (60 Mins)',
      topicName: 'Evaluasi & Refleksi Pekanan',
      focusArea: 'Pencapaian Belajar Mingguan',
      activityType: 'Refleksi',
      description: 'Review performa mingguan dan pengisian jurnal refleksi belajar.',
      priority: 'Rutin',
      isWeaknessFocus: false,
      recommendedActionView: 'reflection'
    });
  }

  // Sort sessions by day order
  const dayOrder: Record<string, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 7
  };

  sessions.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));

  const summary = weaknessCount > 0
    ? `Rekomendasi jadwal dirancang khusus untuk mengatasi ${weaknessCount} area kelemahan Anda (${validWeaknesses.join(', ')}). Fokus utama adalah pemahaman konsep mendalam dan penuntasan soal HOTS.`
    : `Selamat! Tidak ada area kelemahan kritis terdeteksi. Jadwal ini berfokus pada pemeliharaan kompetensi, penguatan kasus HOTS, dan latihan praktikum harian.`;

  return {
    studentId: progress?.student_id,
    generatedDate,
    weaknessCount,
    totalWeeklyHours: `${(sessions.length * 0.8).toFixed(1)} Jam/Minggu`,
    summary,
    sessions
  };
}
