export type Role = 'teacher' | 'student';

export interface User {
  user_id: string;
  username: string;
  nama: string;
  email: string;
  role: Role;
  avatar?: string;
  kelas?: string;
}

export interface Student {
  student_id: string;
  user_id: string;
  nama: string;
  kelas: string;
  nomor_absen: number;
  email: string;
  password?: string; // Kata sandi mandiri yang dibuat/ditentukan oleh siswa
  password_updated_at?: string;
  status: 'aktif' | 'nonaktif' | 'remedial';
  avatar?: string;
  level: number;
  xp: number;
  badges: string[];
}

export interface Teacher {
  teacher_id: string;
  nama: string;
  email: string;
  nip?: string;
  sekolah?: string;
  avatar?: string;
}

export interface ClassRoom {
  class_id: string;
  nama_kelas: string;
  tahun_ajaran: string;
  teacher_id: string;
  total_siswa: number;
}

export interface Topic {
  topic_id: string;
  nama_topik: string;
  deskripsi: string;
  urutan: number;
  status: 'aktif' | 'draft';
  passing_grade: number;
}

export interface Material {
  material_id: string;
  topic_id: string;
  judul: string;
  link_materi?: string;
  link_video?: string;
  deskripsi: string;
  ringkasan: string;
}

export interface PracticalExercise {
  id: string;
  topic_id: string;
  judul: string;
  tipe_praktik: 'PJDM' | 'AOL' | 'Kas Kecil' | 'Persediaan' | 'Kertas Kerja';
  deskripsi: string;
  link_spreadsheet: string;
  link_petunjuk?: string;
  deadline?: string;
  max_score?: number;
  kompetensi?: string;
}

export interface PresentationTopicItem {
  id: string;
  topic_id: string;
  judul_topik: string;
  deskripsi: string;
  required_points?: string[];
  middle_hots_case_study?: string;
  poin_utama?: string[];
  soal_studi_kasus?: string;
  tipe_soal?: 'MIDDLE' | 'HOTS';
  link_template_slide?: string;
  link_panduan?: string;
  target_durasi?: string;
  rubrik?: RubricItem[];
}

export type TaskType = 'PJDM' | 'AOL' | 'Teori' | 'Presentasi' | 'Oral';

export interface Task {
  task_id: string;
  topic_id: string;
  task_type: TaskType;
  judul: string;
  deskripsi: string;
  link_materi?: string;
  link_tugas?: string;
  deadline: string;
  urutan: number;
  wajib: boolean;
  status: 'belum_mulai' | 'sedang_dikerjakan' | 'selesai' | 'terlambat';
  prerequisite_task_id?: string;
  rubrik?: RubricItem[];
  max_score: number;
}

export interface RubricItem {
  aspek: string;
  bobot: number; // percentage e.g. 30
  deskripsi?: string;
}

export type Difficulty = 'MIDDLE' | 'HOTS';

export interface Question {
  question_id: string;
  topic_id: string;
  difficulty: Difficulty;
  pertanyaan_id: string;
  question_en: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation_id: string;
  explanation_en: string;
  kompetensi?: string;
}

export interface Submission {
  submission_id: string;
  student_id: string;
  task_id: string;
  topic_id: string;
  link?: string;
  catatan_siswa?: string;
  submitted_at: string;
  status: 'belum_dikumpulkan' | 'sudah_dikumpulkan' | 'sudah_dinilai' | 'terlambat';
  score?: number;
  feedback?: string;
}

export interface QuizResult {
  result_id: string;
  student_id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  correct: number;
  wrong: number;
  duration_seconds: number;
  submitted_at: string;
  middle_score: number;
  hots_score: number;
  remedial_required: boolean;
  user_answers?: Record<string, string>;
}

export interface OralQuestion {
  oral_question_id: string;
  topic_id: string;
  difficulty: Difficulty;
  question_id: string;
  question_en: string;
}

export interface AIEvalDetail {
  concept_accuracy: number;
  reasoning: number;
  completeness: number;
  communication: number;
  recommended_score: number;
  summary_feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface OralSubmission {
  oral_submission_id: string;
  student_id: string;
  topic_id: string;
  oral_question_id: string;
  audio_url?: string;
  transcript?: string;
  duration_seconds: number;
  submitted_at: string;
  ai_score?: number;
  teacher_score?: number;
  ai_eval?: AIEvalDetail;
  feedback?: string;
  status: 'pending' | 'reviewed';
}

export interface PresentationSubmission {
  presentation_id: string;
  student_id: string;
  topic_id: string;
  video_url: string;
  audio_url?: string;
  catatan?: string;
  submitted_at: string;
  score?: number;
  feedback?: string;
  rubric_scores?: Record<string, number>;
  status: 'pending' | 'reviewed';
}

export interface StudentProgress {
  student_id: string;
  pjdm_progress: number; // percentage
  aol_progress: number;
  theory_progress: number;
  presentation_progress: number;
  oral_progress: number;
  overall_progress: number;
  remedial_count: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface AuditLog {
  log_id: string;
  user_id: string;
  user_name: string;
  aktivitas: string;
  waktu: string;
  detail?: string;
}

export interface AppSettings {
  spreadsheet_id: string;
  google_api_key?: string;
  webhook_url?: string;
  auto_ai_eval: boolean;
  bilingual_default: boolean;
  enable_gamification: boolean;
  enable_socratic_tutor: boolean;
  passing_grade_default: number;
}

export interface ReflectionJournal {
  id: string;
  student_id: string;
  topic_id: string;
  refleksi_hari_ini: string;
  bagian_tersekat: string;
  rencana_perbaikan: string;
  created_at: string;
}
