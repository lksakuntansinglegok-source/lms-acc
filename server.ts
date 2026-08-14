import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_TOPICS,
  INITIAL_MATERIALS,
  INITIAL_TASKS,
  INITIAL_QUESTIONS,
  INITIAL_ORAL_QUESTIONS,
  INITIAL_STUDENT_PROGRESS,
  INITIAL_QUIZ_RESULTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ORAL_SUBMISSIONS,
  INITIAL_PRESENTATION_SUBMISSIONS,
  INITIAL_SETTINGS
} from './src/data/initialData';
import {
  Student,
  Question,
  Task,
  Topic,
  QuizResult,
  OralSubmission,
  PresentationSubmission,
  Submission,
  StudentProgress,
  AppSettings,
  AuditLog
} from './src/types';

// In-Memory Data Store (Initialized with defaults)
let dbStudents: Student[] = [...INITIAL_STUDENTS];
let dbTeachers = [...INITIAL_TEACHERS];
let dbClasses = [...INITIAL_CLASSES];
let dbTopics: Topic[] = [...INITIAL_TOPICS];
let dbMaterials = [...INITIAL_MATERIALS];
let dbTasks: Task[] = [...INITIAL_TASKS];
let dbQuestions: Question[] = [...INITIAL_QUESTIONS];
let dbOralQuestions = [...INITIAL_ORAL_QUESTIONS];
let dbProgress: StudentProgress[] = [...INITIAL_STUDENT_PROGRESS];
let dbQuizResults: QuizResult[] = [...INITIAL_QUIZ_RESULTS];
let dbSubmissions: Submission[] = [...INITIAL_SUBMISSIONS];
let dbOralSubmissions: OralSubmission[] = [...INITIAL_ORAL_SUBMISSIONS];
let dbPresentationSubmissions: PresentationSubmission[] = [...INITIAL_PRESENTATION_SUBMISSIONS];
let dbSettings: AppSettings = { ...INITIAL_SETTINGS };
let dbAuditLogs: AuditLog[] = [
  {
    log_id: 'log_01',
    user_id: 'tch_01',
    user_name: 'Dra. Endang Rahayu, M.Pd.',
    aktivitas: 'Inisialisasi Sistem LMS Akuntansi SMK',
    waktu: new Date().toISOString(),
    detail: 'Sistem berhasil dinyalakan dengan 10 siswa dan 30 topik akuntansi.'
  }
];

function logActivity(userName: string, userId: string, activity: string, detail?: string) {
  dbAuditLogs.unshift({
    log_id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    user_id: userId,
    user_name: userName,
    aktivitas: activity,
    waktu: new Date().toISOString(),
    detail
  });
  if (dbAuditLogs.length > 100) dbAuditLogs.pop();
}

// Server-side Gemini AI Client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API ROUTES ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. STUDENTS
  app.get('/api/students', (req: Request, res: Response) => {
    res.json(dbStudents);
  });

  app.get('/api/students/:id', (req: Request, res: Response) => {
    const student = dbStudents.find(s => s.student_id === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  });

  app.post('/api/students', (req: Request, res: Response) => {
    const newStudent: Student = {
      student_id: 'std_' + (dbStudents.length + 1).toString().padStart(2, '0'),
      user_id: 'usr_std_' + Date.now(),
      nama: req.body.nama || 'Siswa Baru',
      kelas: req.body.kelas || 'XI AKL 1',
      nomor_absen: req.body.nomor_absen || dbStudents.length + 1,
      email: req.body.email || `siswa${dbStudents.length + 1}@student.smk.id`,
      password: req.body.password || 'siswa123',
      password_updated_at: new Date().toISOString(),
      status: 'aktif',
      level: 1,
      xp: 100,
      badges: ['First Submission']
    };
    dbStudents.push(newStudent);

    // Initial progress record
    dbProgress.push({
      student_id: newStudent.student_id,
      pjdm_progress: 0,
      aol_progress: 0,
      theory_progress: 0,
      presentation_progress: 0,
      oral_progress: 0,
      overall_progress: 0,
      remedial_count: 0,
      strengths: ['Memulai Pembelajaran'],
      weaknesses: ['Perlu Pengerjaan Tugas'],
      recommendations: ['Kerjakan tugas PJDM Topik 1']
    });

    logActivity('Admin/Guru', 'tch_01', 'Menambah Siswa Baru', `${newStudent.nama} (Akses Sandi: ${newStudent.password})`);
    res.json(newStudent);
  });

  app.put('/api/students/:id', (req: Request, res: Response) => {
    const idx = dbStudents.findIndex(s => s.student_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    
    const wasPasswordUpdated = req.body.password && req.body.password !== dbStudents[idx].password;
    dbStudents[idx] = {
      ...dbStudents[idx],
      ...req.body,
      ...(wasPasswordUpdated ? { password_updated_at: new Date().toISOString() } : {})
    };
    logActivity('Admin/Guru', 'tch_01', 'Mengubah Data Siswa', `${dbStudents[idx].nama}${wasPasswordUpdated ? ' (Sandi diperbarui)' : ''}`);
    res.json(dbStudents[idx]);
  });

  // Dedicated endpoint for student to set/change their own password & update profile avatar
  app.post('/api/students/:id/set-password', (req: Request, res: Response) => {
    const idx = dbStudents.findIndex(s => s.student_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    
    const { password, avatar } = req.body;
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'Kata sandi tidak boleh kosong' });
    }

    const cleanPassword = password.trim();
    dbStudents[idx].password = cleanPassword;
    dbStudents[idx].password_updated_at = new Date().toISOString();

    if (avatar && typeof avatar === 'string' && avatar.trim().length > 0) {
      dbStudents[idx].avatar = avatar.trim();
    }

    const avatarNote = (avatar && typeof avatar === 'string' && avatar.trim().length > 0) ? ' dan foto profil diperbarui' : '';

    logActivity(
      dbStudents[idx].nama,
      dbStudents[idx].student_id,
      'Siswa Menentukan Kata Sandi & Profil Mandiri',
      `Kata sandi akses masuk siswa "${dbStudents[idx].nama}" berhasil diatur${avatarNote}, terekam dan tersimpan di sistem manajemen siswa panel guru.`
    );

    res.json({
      success: true,
      message: 'Kata sandi dan profil berhasil disimpan dan terekam di sistem.',
      student: dbStudents[idx]
    });
  });

  app.post('/api/students/:id/reset-password', (req: Request, res: Response) => {
    const idx = dbStudents.findIndex(s => s.student_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    
    const newPassword = (req.body.password && req.body.password.trim()) || 'siswa123';
    dbStudents[idx].password = newPassword;
    dbStudents[idx].password_updated_at = new Date().toISOString();

    logActivity(
      'Admin/Guru',
      'tch_01',
      'Guru Mereset Kata Sandi Siswa',
      `Kata sandi akses masuk untuk "${dbStudents[idx].nama}" diatur ke "${newPassword}".`
    );

    res.json({
      success: true,
      message: 'Kata sandi siswa berhasil diatur ulang oleh Guru.',
      student: dbStudents[idx]
    });
  });

  app.delete('/api/students/:id', (req: Request, res: Response) => {
    const idx = dbStudents.findIndex(s => s.student_id === req.params.id);
    if (idx !== -1) {
      const removed = dbStudents.splice(idx, 1)[0];
      logActivity('Admin/Guru', 'tch_01', 'Menghapus Siswa', removed.nama);
    }
    res.json({ success: true });
  });

  // 2. TOPICS & MATERIALS
  app.get('/api/topics', (req: Request, res: Response) => {
    res.json(dbTopics);
  });

  app.post('/api/topics', (req: Request, res: Response) => {
    const newTopic: Topic = {
      topic_id: 'top_' + (dbTopics.length + 1).toString().padStart(2, '0'),
      nama_topik: req.body.nama_topik,
      deskripsi: req.body.deskripsi || '',
      urutan: req.body.urutan || dbTopics.length + 1,
      status: 'aktif',
      passing_grade: req.body.passing_grade || 75
    };
    dbTopics.push(newTopic);
    logActivity('Admin/Guru', 'tch_01', 'Membuat Topik Baru', newTopic.nama_topik);
    res.json(newTopic);
  });

  app.get('/api/materials', (req: Request, res: Response) => {
    res.json(dbMaterials);
  });

  // 3. TASKS & LEARNING PATH
  app.get('/api/tasks', (req: Request, res: Response) => {
    res.json(dbTasks);
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const newTask: Task = {
      task_id: 'tsk_' + Date.now(),
      topic_id: req.body.topic_id,
      task_type: req.body.task_type || 'Teori',
      judul: req.body.judul,
      deskripsi: req.body.deskripsi || '',
      link_materi: req.body.link_materi,
      link_tugas: req.body.link_tugas,
      deadline: req.body.deadline || '2026-09-30',
      urutan: req.body.urutan || dbTasks.length + 1,
      wajib: req.body.wajib ?? true,
      status: 'belum_mulai',
      prerequisite_task_id: req.body.prerequisite_task_id,
      max_score: 100
    };
    dbTasks.push(newTask);
    logActivity('Admin/Guru', 'tch_01', 'Membuat Tugas Baru', newTask.judul);
    res.json(newTask);
  });

  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const idx = dbTasks.findIndex(t => t.task_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });
    dbTasks[idx] = { ...dbTasks[idx], ...req.body };
    logActivity('Admin/Guru', 'tch_01', 'Mengubah Tugas', dbTasks[idx].judul);
    res.json(dbTasks[idx]);
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const idx = dbTasks.findIndex(t => t.task_id === req.params.id);
    if (idx !== -1) {
      const removed = dbTasks.splice(idx, 1)[0];
      logActivity('Admin/Guru', 'tch_01', 'Menghapus Tugas', removed.judul);
    }
    res.json({ success: true });
  });

  app.post('/api/tasks/reorder', (req: Request, res: Response) => {
    const orderedTasks: Task[] = req.body.tasks;
    if (Array.isArray(orderedTasks)) {
      dbTasks = orderedTasks;
      logActivity('Admin/Guru', 'tch_01', 'Mengatur Urutan Learning Path');
    }
    res.json({ success: true, tasks: dbTasks });
  });

  // 4. QUESTIONS & BANK SOAL
  app.get('/api/questions', (req: Request, res: Response) => {
    const { topic_id, difficulty } = req.query;
    let list = dbQuestions;
    if (topic_id) list = list.filter(q => q.topic_id === topic_id);
    if (difficulty) list = list.filter(q => q.difficulty === difficulty);
    res.json(list);
  });

  app.post('/api/questions', (req: Request, res: Response) => {
    const newQ: Question = {
      question_id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      topic_id: req.body.topic_id || 'top_01',
      difficulty: req.body.difficulty || 'MIDDLE',
      pertanyaan_id: req.body.pertanyaan_id,
      question_en: req.body.question_en || req.body.pertanyaan_id,
      option_a: req.body.option_a,
      option_b: req.body.option_b,
      option_c: req.body.option_c,
      option_d: req.body.option_d,
      correct_answer: req.body.correct_answer,
      explanation_id: req.body.explanation_id,
      explanation_en: req.body.explanation_en || req.body.explanation_id,
      kompetensi: req.body.kompetensi || 'Pemahaman Akuntansi'
    };
    dbQuestions.push(newQ);
    logActivity('Admin/Guru', 'tch_01', 'Menambah Soal Baru', newQ.question_id);
    res.json(newQ);
  });

  app.post('/api/questions/bulk', (req: Request, res: Response) => {
    const questionsToImport: Partial<Question>[] = req.body.questions || [];
    if (!Array.isArray(questionsToImport) || questionsToImport.length === 0) {
      return res.status(400).json({ error: 'Data questions tidak valid' });
    }
    const imported: Question[] = [];
    questionsToImport.forEach((q, idx) => {
      const newQ: Question = {
        question_id: q.question_id || ('q_bulk_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 5)),
        topic_id: q.topic_id || 'top_01',
        difficulty: (['MIDDLE', 'HOTS'].includes(q.difficulty as string) ? q.difficulty : 'MIDDLE') as 'MIDDLE' | 'HOTS',
        pertanyaan_id: q.pertanyaan_id || 'Pertanyaan Akuntansi',
        question_en: q.question_en || q.pertanyaan_id || 'Accounting Question',
        option_a: q.option_a || 'Opsi A',
        option_b: q.option_b || 'Opsi B',
        option_c: q.option_c || 'Opsi C',
        option_d: q.option_d || 'Opsi D',
        correct_answer: (['A', 'B', 'C', 'D'].includes(q.correct_answer as string) ? q.correct_answer : 'A') as 'A' | 'B' | 'C' | 'D',
        explanation_id: q.explanation_id || 'Pembahasan soal akuntansi.',
        explanation_en: q.explanation_en || q.explanation_id || 'Explanation of accounting question.',
        kompetensi: q.kompetensi || 'Pemahaman Akuntansi'
      };
      dbQuestions.push(newQ);
      imported.push(newQ);
    });
    logActivity('Admin/Guru', 'tch_01', `Bulk Import ${imported.length} Soal Akuntansi`, `Total Soal di Bank Soal: ${dbQuestions.length}`);
    res.json({ success: true, count: imported.length, questions: imported });
  });

  app.delete('/api/questions/:id', (req: Request, res: Response) => {
    const idx = dbQuestions.findIndex(q => q.question_id === req.params.id);
    if (idx !== -1) {
      const removed = dbQuestions.splice(idx, 1)[0];
      logActivity('Admin/Guru', 'tch_01', 'Menghapus Soal', removed.question_id);
    }
    res.json({ success: true });
  });

  app.get('/api/oral-questions', (req: Request, res: Response) => {
    res.json(dbOralQuestions);
  });

  // 5. QUIZ RESULTS & SUBMISSIONS
  app.get('/api/quiz-results', (req: Request, res: Response) => {
    res.json(dbQuizResults);
  });

  app.post('/api/quiz-results', (req: Request, res: Response) => {
    const result: QuizResult = {
      result_id: 'res_' + Date.now(),
      student_id: req.body.student_id,
      topic_id: req.body.topic_id,
      score: req.body.score,
      total_questions: req.body.total_questions,
      correct: req.body.correct,
      wrong: req.body.wrong,
      duration_seconds: req.body.duration_seconds || 600,
      submitted_at: new Date().toLocaleString('id-ID'),
      middle_score: req.body.middle_score || req.body.score,
      hots_score: req.body.hots_score || req.body.score,
      remedial_required: req.body.score < 75,
      user_answers: req.body.user_answers
    };
    dbQuizResults.push(result);

    // Update student progress & status
    const studentIdx = dbStudents.findIndex(s => s.student_id === req.body.student_id);
    if (studentIdx !== -1) {
      if (result.remedial_required) {
        dbStudents[studentIdx].status = 'remedial';
      } else {
        dbStudents[studentIdx].xp += 150;
        if (dbStudents[studentIdx].xp > dbStudents[studentIdx].level * 400) {
          dbStudents[studentIdx].level += 1;
        }
      }
    }

    // Update theory progress percentage
    const progIdx = dbProgress.findIndex(p => p.student_id === req.body.student_id);
    if (progIdx !== -1) {
      dbProgress[progIdx].theory_progress = Math.min(100, dbProgress[progIdx].theory_progress + 20);
      dbProgress[progIdx].overall_progress = Math.round(
        (dbProgress[progIdx].pjdm_progress +
          dbProgress[progIdx].aol_progress +
          dbProgress[progIdx].theory_progress +
          dbProgress[progIdx].presentation_progress +
          dbProgress[progIdx].oral_progress) / 5
      );
    }

    logActivity('Siswa', req.body.student_id, 'Menyelesaikan Ujian Teori', `Nilai: ${result.score}`);
    res.json(result);
  });

  app.get('/api/oral-submissions', (req: Request, res: Response) => {
    res.json(dbOralSubmissions);
  });

  app.post('/api/oral-submissions', (req: Request, res: Response) => {
    const newSubmission: OralSubmission = {
      oral_submission_id: 'oral_sub_' + Date.now(),
      student_id: req.body.student_id,
      topic_id: req.body.topic_id,
      oral_question_id: req.body.oral_question_id || 'oral_q_top01_m01',
      audio_url: req.body.audio_url || 'https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg',
      transcript: req.body.transcript || 'Jawaban audio direkam oleh siswa.',
      duration_seconds: req.body.duration_seconds || 30,
      submitted_at: new Date().toLocaleString('id-ID'),
      ai_score: req.body.ai_score,
      ai_eval: req.body.ai_eval,
      teacher_score: req.body.teacher_score || req.body.ai_score,
      feedback: req.body.feedback,
      status: req.body.teacher_score ? 'reviewed' : 'pending'
    };
    dbOralSubmissions.push(newSubmission);

    // Update student progress
    const progIdx = dbProgress.findIndex(p => p.student_id === req.body.student_id);
    if (progIdx !== -1) {
      dbProgress[progIdx].oral_progress = Math.min(100, dbProgress[progIdx].oral_progress + 25);
      dbProgress[progIdx].overall_progress = Math.round(
        (dbProgress[progIdx].pjdm_progress +
          dbProgress[progIdx].aol_progress +
          dbProgress[progIdx].theory_progress +
          dbProgress[progIdx].presentation_progress +
          dbProgress[progIdx].oral_progress) / 5
      );
    }

    logActivity('Siswa', req.body.student_id, 'Mengirim Rekaman Oral Interview', `Topic: ${req.body.topic_id}`);
    res.json(newSubmission);
  });

  app.put('/api/oral-submissions/:id', (req: Request, res: Response) => {
    const idx = dbOralSubmissions.findIndex(o => o.oral_submission_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Oral submission not found' });
    dbOralSubmissions[idx] = { ...dbOralSubmissions[idx], ...req.body, status: 'reviewed' };
    logActivity('Admin/Guru', 'tch_01', 'Menilai Wawancara Oral', `Nilai: ${req.body.teacher_score}`);
    res.json(dbOralSubmissions[idx]);
  });

  app.delete('/api/oral-submissions/:id', (req: Request, res: Response) => {
    const idx = dbOralSubmissions.findIndex(o => o.oral_submission_id === req.params.id);
    if (idx !== -1) {
      const removed = dbOralSubmissions.splice(idx, 1)[0];
      logActivity('Admin/Guru', 'tch_01', 'Menghapus Submission Oral', removed.oral_submission_id);
    }
    res.json({ success: true });
  });

  app.get('/api/presentation-submissions', (req: Request, res: Response) => {
    res.json(dbPresentationSubmissions);
  });

  app.post('/api/presentation-submissions', (req: Request, res: Response) => {
    const newPres: PresentationSubmission = {
      presentation_id: 'pres_sub_' + Date.now(),
      student_id: req.body.student_id,
      topic_id: req.body.topic_id,
      video_url: req.body.video_url || '',
      audio_url: req.body.audio_url || '',
      catatan: req.body.catatan || '',
      submitted_at: new Date().toLocaleString('id-ID'),
      status: 'pending'
    };
    dbPresentationSubmissions.push(newPres);

    // Update progress
    const progIdx = dbProgress.findIndex(p => p.student_id === req.body.student_id);
    if (progIdx !== -1) {
      dbProgress[progIdx].presentation_progress = Math.min(100, dbProgress[progIdx].presentation_progress + 35);
      dbProgress[progIdx].overall_progress = Math.round(
        (dbProgress[progIdx].pjdm_progress +
          dbProgress[progIdx].aol_progress +
          dbProgress[progIdx].theory_progress +
          dbProgress[progIdx].presentation_progress +
          dbProgress[progIdx].oral_progress) / 5
      );
    }

    logActivity('Siswa', req.body.student_id, 'Mengirim Video Presentasi', newPres.video_url);
    res.json(newPres);
  });

  app.put('/api/presentation-submissions/:id', (req: Request, res: Response) => {
    const idx = dbPresentationSubmissions.findIndex(p => p.presentation_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Submission not found' });
    dbPresentationSubmissions[idx] = {
      ...dbPresentationSubmissions[idx],
      score: req.body.score,
      feedback: req.body.feedback,
      rubric_scores: req.body.rubric_scores,
      status: 'reviewed'
    };
    logActivity('Admin/Guru', 'tch_01', 'Menilai Video Presentasi', `Score: ${req.body.score}`);
    res.json(dbPresentationSubmissions[idx]);
  });

  app.delete('/api/presentation-submissions/:id', (req: Request, res: Response) => {
    const idx = dbPresentationSubmissions.findIndex(p => p.presentation_id === req.params.id);
    if (idx !== -1) {
      const removed = dbPresentationSubmissions.splice(idx, 1)[0];
      logActivity('Admin/Guru', 'tch_01', 'Menghapus Submission Presentasi', removed.presentation_id);
    }
    res.json({ success: true });
  });

  app.get('/api/submissions', (req: Request, res: Response) => {
    res.json(dbSubmissions);
  });

  app.post('/api/submissions', (req: Request, res: Response) => {
    const newSub: Submission = {
      submission_id: 'sub_' + Date.now(),
      student_id: req.body.student_id,
      task_id: req.body.task_id,
      topic_id: req.body.topic_id,
      link: req.body.link,
      catatan_siswa: req.body.catatan_siswa,
      submitted_at: new Date().toLocaleString('id-ID'),
      status: 'sudah_dikumpulkan'
    };
    dbSubmissions.push(newSub);

    // Update task status in student context & progress
    const task = dbTasks.find(t => t.task_id === req.body.task_id);
    const progIdx = dbProgress.findIndex(p => p.student_id === req.body.student_id);
    if (progIdx !== -1 && task) {
      if (task.task_type === 'PJDM') dbProgress[progIdx].pjdm_progress = Math.min(100, dbProgress[progIdx].pjdm_progress + 25);
      if (task.task_type === 'AOL') dbProgress[progIdx].aol_progress = Math.min(100, dbProgress[progIdx].aol_progress + 25);
      dbProgress[progIdx].overall_progress = Math.round(
        (dbProgress[progIdx].pjdm_progress +
          dbProgress[progIdx].aol_progress +
          dbProgress[progIdx].theory_progress +
          dbProgress[progIdx].presentation_progress +
          dbProgress[progIdx].oral_progress) / 5
      );
    }

    logActivity('Siswa', req.body.student_id, `Mengumpulkan Tugas (${task?.task_type || 'Tugas'})`, newSub.link);
    res.json(newSub);
  });

  app.put('/api/submissions/:id', (req: Request, res: Response) => {
    const idx = dbSubmissions.findIndex(s => s.submission_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Submission not found' });
    dbSubmissions[idx] = {
      ...dbSubmissions[idx],
      score: req.body.score,
      feedback: req.body.feedback,
      status: 'sudah_dinilai'
    };
    logActivity('Admin/Guru', 'tch_01', 'Menilai Tugas Siswa', `Score: ${req.body.score}`);
    res.json(dbSubmissions[idx]);
  });

  app.delete('/api/submissions/:id', (req: Request, res: Response) => {
    const idx = dbSubmissions.findIndex(s => s.submission_id === req.params.id);
    if (idx !== -1) {
      const removed = dbSubmissions.splice(idx, 1)[0];
      logActivity('Admin/Guru', 'tch_01', 'Menghapus Submission Task', removed.submission_id);
    }
    res.json({ success: true });
  });

  // 6. PROGRESS & STATS
  app.get('/api/progress', (req: Request, res: Response) => {
    res.json(dbProgress);
  });

  app.get('/api/progress/:student_id', (req: Request, res: Response) => {
    const prog = dbProgress.find(p => p.student_id === req.params.student_id);
    if (!prog) {
      return res.json({
        student_id: req.params.student_id,
        pjdm_progress: 0,
        aol_progress: 0,
        theory_progress: 0,
        presentation_progress: 0,
        oral_progress: 0,
        overall_progress: 0,
        remedial_count: 0,
        strengths: [],
        weaknesses: [],
        recommendations: []
      });
    }
    res.json(prog);
  });

  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json(dbAuditLogs);
  });

  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(dbSettings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    dbSettings = { ...dbSettings, ...req.body };
    logActivity('Admin/Guru', 'tch_01', 'Mengubah Pengaturan Sistem LMS');
    res.json(dbSettings);
  });

  // GOOGLE SHEETS SYNC SIMULATION
  app.post('/api/sheets/sync', (req: Request, res: Response) => {
    logActivity('Admin/Guru', 'tch_01', 'Sinkronisasi Data ke Google Spreadsheet', dbSettings.spreadsheet_id);
    res.json({
      success: true,
      message: 'Berhasil menyinkronkan 10 tabel database LMS ke Google Spreadsheet',
      timestamp: new Date().toISOString(),
      syncedRows: {
        STUDENTS: dbStudents.length,
        TOPICS: dbTopics.length,
        TASKS: dbTasks.length,
        QUESTIONS: dbQuestions.length,
        SUBMISSIONS: dbSubmissions.length + dbOralSubmissions.length + dbPresentationSubmissions.length
      }
    });
  });

  // ==========================================
  // GEMINI AI INTEGRATIONS (SERVER-SIDE)
  // ==========================================

  // A. AI QUESTION GENERATOR (Bilingual ID + EN)
  app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
    try {
      const { topic_name, difficulty, count = 5, bilingual = true } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality fallback mock questions if GEMINI_API_KEY is missing
        const mockQuestions: Question[] = Array.from({ length: Number(count) }, (_, i) => ({
          question_id: 'q_gen_' + Date.now() + '_' + i,
          topic_id: req.body.topic_id || 'top_01',
          difficulty: difficulty || (i % 2 === 0 ? 'MIDDLE' : 'HOTS'),
          pertanyaan_id: `[AI Mock Soal ${i + 1}] Bagaimana analisis transaksi akuntansi pada topik "${topic_name || 'Persamaan Dasar'}" untuk jurnal penyesuaian?`,
          question_en: `[AI Mock Q ${i + 1}] How do you analyze the accounting transaction for topic "${topic_name || 'Accounting Equation'}" regarding adjusting entries?`,
          option_a: 'Debit Beban dan Kredit Utang/Akumulasi',
          option_b: 'Debit Kas dan Kredit Penjualan',
          option_c: 'Debit Peralatan dan Kredit Modal',
          option_d: 'Debit Prive dan Kredit Kas',
          correct_answer: 'A',
          explanation_id: 'Jurnal penyesuaian mencatat pengakuan beban yang sudah terjadi dan kewajiban/penyusutan terkait.',
          explanation_en: 'Adjusting entries record recognized expenses and related liabilities/depreciation.',
          kompetensi: 'Analisis Jurnal Penyesuaian'
        }));
        return res.json({ questions: mockQuestions, isMock: true });
      }

      const prompt = `Anda adalah AI Educational Expert Akuntansi SMK di Indonesia.
Buatkan ${count} soal pilihan ganda ${difficulty || 'MIDDLE'} untuk topik Akuntansi SMK: "${topic_name || 'Persamaan Dasar Akuntansi'}".
Setiap soal harus bilingual (Bahasa Indonesia & English) dan menyertakan pembahasan rinci dalam kedua bahasa serta kompetensi yang diuji.

Format JSON yang diwajibkan:
[
  {
    "pertanyaan_id": "Pertanyaan dalam Bahasa Indonesia...",
    "question_en": "Question in English...",
    "option_a": "Pilihan A...",
    "option_b": "Pilihan B...",
    "option_c": "Pilihan C...",
    "option_d": "Pilihan D...",
    "correct_answer": "A", // harus salah satu "A", "B", "C", atau "D"
    "explanation_id": "Pembahasan lengkap Bahasa Indonesia...",
    "explanation_en": "Detailed explanation in English...",
    "kompetensi": "Kompetensi dasar akuntansi yang diuji..."
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pertanyaan_id: { type: Type.STRING },
                question_en: { type: Type.STRING },
                option_a: { type: Type.STRING },
                option_b: { type: Type.STRING },
                option_c: { type: Type.STRING },
                option_d: { type: Type.STRING },
                correct_answer: { type: Type.STRING },
                explanation_id: { type: Type.STRING },
                explanation_en: { type: Type.STRING },
                kompetensi: { type: Type.STRING }
              },
              required: [
                'pertanyaan_id',
                'question_en',
                'option_a',
                'option_b',
                'option_c',
                'option_d',
                'correct_answer',
                'explanation_id',
                'explanation_en'
              ]
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '[]');
      const generatedQuestions: Question[] = parsed.map((item: any, idx: number) => ({
        question_id: 'q_gen_' + Date.now() + '_' + idx,
        topic_id: req.body.topic_id || 'top_01',
        difficulty: difficulty || 'MIDDLE',
        pertanyaan_id: item.pertanyaan_id,
        question_en: item.question_en,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
        correct_answer: (['A', 'B', 'C', 'D'].includes(item.correct_answer) ? item.correct_answer : 'A') as 'A' | 'B' | 'C' | 'D',
        explanation_id: item.explanation_id,
        explanation_en: item.explanation_en,
        kompetensi: item.kompetensi || 'Pemahaman Konsep Akuntansi'
      }));

      logActivity('AI System', 'gemini', `Generate ${generatedQuestions.length} Soal AI`, topic_name);
      res.json({ questions: generatedQuestions, isMock: false });
    } catch (err: any) {
      console.error('Error generating AI questions:', err);
      res.status(500).json({ error: 'Gagal membuat soal AI: ' + err.message });
    }
  });

  // A2. AI BULK QUESTION GENERATOR (40 Questions across 30 Topics)
  app.post('/api/ai/generate-bulk-questions', async (req: Request, res: Response) => {
    try {
      const { count = 40, difficulty = 'MIDDLE_AND_HOTS' } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality comprehensive fallback 40 Middle & HOTS questions across 30 accounting topics
        const fallbackTopics = dbTopics.length >= 30 ? dbTopics : INITIAL_TOPICS;
        const generateFallback40 = (): Question[] => {
          const list: Question[] = [];
          const rawSpecs = [
            { topIdx: 0, diff: 'HOTS', topicName: 'Persamaan Dasar Akuntansi', qId: 'Perusahaan membeli peralatan kantor Rp10.000.000 dibayar tunai Rp3.000.000 dan sisanya dibayar bulan depan. Bagaimanakah dampak transaksi ini terhadap unsur Persamaan Dasar Akuntansi?', qEn: 'A company purchases office equipment for IDR 10,000,000, paying IDR 3,000,000 in cash and the remainder next month. How does this transaction affect the Accounting Equation?', a: 'Aset (Kas) berkurang Rp3.000.000, Aset (Peralatan) bertambah Rp10.000.000, Liabilitas bertambah Rp7.000.000', b: 'Aset (Peralatan) bertambah Rp10.000.000 dan Liabilitas bertambah Rp10.000.000', c: 'Aset (Kas) berkurang Rp10.000.000 dan Ekuitas berkurang Rp10.000.000', d: 'Liabilitas bertambah Rp3.000.000 dan Ekuitas bertambah Rp7.000.000', ans: 'A', expId: 'Kas berkurang Rp3jt (kredit), Peralatan bertambah Rp10jt (debit), Utang Usaha bertambah Rp7jt (kredit). Keseimbangan Aset (net +7jt) = Liabilitas (+7jt) terjaga.', expEn: 'Cash decreases by 3M, Equipment increases by 10M, Accounts Payable increases by 7M. Balance maintained (+7M net asset = +7M liability).', kom: 'Analisis Persamaan Dasar Akuntansi' },
            { topIdx: 1, diff: 'MIDDLE', topicName: 'Konsep Dasar Akuntansi', qId: 'Manakah dari pernyataan berikut yang menggambarkan penerapan matching principle (prinsip penandingan) dalam akuntansi?', qEn: 'Which statement describes the application of the matching principle in accounting?', a: 'Pendapatan dan beban yang terkait diakui pada periode terjadinya, bukan saat kas diterima/dikeluarkan', b: 'Aset dicatat sebesar harga perolehan historis saat transaksi', c: 'Pemilik perusahaan dan entitas bisnis dianggap sebagai unit hukum terpisah', d: 'Laporan keuangan disajikan secara berkala tiap akhir bulan', ans: 'A', expId: 'Prinsip penandingan mempertemukan pendapatan dengan beban yang dikeluarkan untuk memperoleh pendapatan tersebut dalam periode yang sama.', expEn: 'Matching principle matches revenues earned with expenses incurred to generate that revenue in the same accounting period.', kom: 'Prinsip Penandingan & Akrual' },
            { topIdx: 2, diff: 'MIDDLE', topicName: 'Transaksi Bisnis & Bukti Transaksi', qId: 'Perusahaan mengembalikan barang dagang yang rusak kepada pemasok sebesar Rp1.500.000. Dokumen transaksi yang dikirimkan oleh perusahaan adalah...', qEn: 'A company returns damaged goods worth IDR 1,500,000 to the supplier. The transaction document sent by the company is...', a: 'Nota Debet', b: 'Nota Kredit', c: 'Faktur Penjualan', d: 'Kuitansi', ans: 'A', expId: 'Nota Debet dibuat oleh pembeli untuk memberitahukan pengembalian barang dan mendebet akun Utang Dagang pemasok.', expEn: 'Debit Note is issued by the buyer to inform return of goods and debit the supplier\'s Accounts Payable.', kom: 'Analisis Dokumen Transaksi' },
            { topIdx: 3, diff: 'MIDDLE', topicName: 'Akun & Klasifikasi Akun', qId: 'Akun Akumulasi Penyusutan Peralatan dalam Laporan Posisi Keuangan diklasifikasikan sebagai...', qEn: 'The Accumulated Depreciation - Equipment account in the Balance Sheet is classified as...', a: 'Kontra Aset (Contra-Asset Account) dengan saldo normal Kredit', b: 'Beban Operasional dengan saldo normal Debit', c: 'Liabilitas Jangka Pendek dengan saldo normal Kredit', d: 'Ekuitas Pemilik dengan saldo normal Debit', ans: 'A', expId: 'Akumulasi penyusutan adalah akun kontra aset yang mengurangi nilai tercatat (book value) aset tetap terkait di Neraca.', expEn: 'Accumulated depreciation is a contra-asset account that reduces the carrying amount of fixed assets on the balance sheet.', kom: 'Klasifikasi Kontra Aset' },
            { topIdx: 4, diff: 'HOTS', topicName: 'Aturan Debit dan Kredit', qId: 'Seorang staf akuntansi keliru mencatat pembayaran utang usaha Rp2.500.000 secara tunai sebagai debit Kas Rp2.500.000 dan kredit Utang Usaha Rp2.500.000. Dampak kesalahan ini terhadap Neraca Saldo adalah...', qEn: 'An accounting staff mistakenly recorded a cash payment of accounts payable for IDR 2,500,000 as debit Cash IDR 2,500,000 and credit Accounts Payable IDR 2,500,000. The effect on Trial Balance is...', a: 'Neraca Saldo tetap seimbang, namun Kas overstated Rp5.000.000 dan Utang Usaha overstated Rp5.000.000', b: 'Neraca Saldo tidak seimbang sebesar Rp2.500.000', c: 'Total debit lebih besar Rp5.000.000 dari total kredit', d: 'Ekuitas berkurang sebesar Rp2.500.000', ans: 'A', expId: 'Karena pencatatan terbalik (posisi debit-kredit tertukar), saldo Neraca Saldo tetap seimbang namun saldo Kas dan Utang Usaha keduanya salah sebesar 2x Rp2.500.000 = Rp5.000.000.', expEn: 'Because of reverse entry, trial balance remains balanced in total, but both Cash and Accounts Payable balances are overstated by 5,000,000.', kom: 'Evaluasi Kesalahan Posting Debit Kredit' },
            { topIdx: 5, diff: 'HOTS', topicName: 'Jurnal Umum (General Journal)', qId: 'Diterima pelunasan piutang dagang sebesar Rp8.000.000 atas penjualan 5 hari lalu dengan syarat pembayaran 2/10, n/30. Ayat jurnal umum yang tepat adalah...', qEn: 'Received payment of trade receivables of IDR 8,000,000 for sales 5 days ago with terms 2/10, n/30. The correct general journal entry is...', a: 'Debit Kas Rp7.840.000, Debit Potongan Penjualan Rp160.000, Kredit Piutang Dagang Rp8.000.000', b: 'Debit Kas Rp8.000.000, Kredit Piutang Dagang Rp8.000.000', c: 'Debit Kas Rp7.840.000, Kredit Piutang Dagang Rp7.840.000', d: 'Debit Kas Rp8.000.000, Kredit Penjualan Rp7.840.000, Kredit Potongan Rp160.000', ans: 'A', expId: 'Potongan 2% dari Rp8.000.000 = Rp160.000. Kas diterima = Rp7.840.000. Piutang berkurang penuh sebesar Rp8.000.000.', expEn: 'Discount 2% of 8M = 160K. Cash received = 7,840K. Accounts receivable credited for full 8M.', kom: 'Jurnal Pelunasan Piutang & Potongan' },
            { topIdx: 6, diff: 'MIDDLE', topicName: 'Buku Besar (General Ledger)', qId: 'Manakah bentuk Buku Besar yang paling umum digunakan dalam praktik akuntansi perusahaan karena langsung menyajikan saldo terkini setiap saat?', qEn: 'Which General Ledger format is most commonly used in practice because it continuously displays the running balance?', a: 'Bentuk Stafel 4 Kolom (Saldo Rangkap)', b: 'Bentuk Skontro (T-Account 2 Kolom)', c: 'Bentuk Sederhana 3 Kolom', d: 'Bentuk Single Entry', ans: 'A', expId: 'Bentuk stafel 4 kolom mencatat kolom Debit, Kredit, Saldo Debit, dan Saldo Kredit secara rinci sehingga saldo dapat diketahui setiap ada posting.', expEn: 'The 4-column running balance ledger format maintains debit, credit, and running balance columns.', kom: 'Posting & Bentuk Buku Besar' },
            { topIdx: 7, diff: 'HOTS', topicName: 'Neraca Saldo (Trial Balance)', qId: 'Apabila terjadi kesalahan pencatatan angka sebesar Rp4.500.000 tertulis Rp5.400.000 (transposition error), selisih angka pada Neraca Saldo adalah Rp900.000. Ciri khas kesalahan transposisi ini adalah...', qEn: 'If a transposition error occurs writing IDR 4,500,000 as IDR 5,400,000, the difference in Trial Balance is IDR 900,000. A characteristic of a transposition error is...', a: 'Jumlah selisih angka selalu habis dibagi 9 (900.000 / 9 = 100.000)', b: 'Total debit dan kredit Neraca Saldo langsung nol', c: 'Neraca Saldo otomatis menolak posting transaksi', d: 'Selisih angka selalu bernilai genap kelipatan 10', ans: 'A', expId: 'Ciri khas transposition error (angka tertukar seperti 45 vs 54) adalah selisihnya selalu merupakan kelipatan angka 9.', expEn: 'A key characteristic of a transposition error (e.g. 45 vs 54) is that the difference is always divisible by 9.', kom: 'Deteksi Error Transposisi Neraca Saldo' },
            { topIdx: 8, diff: 'HOTS', topicName: 'Jurnal Penyesuaian (Adjusting Entries)', qId: 'Pada 1 Oktober 2026 dibayar sewa gedung Rp24.000.000 untuk masa 1 tahun dan dicatat mendebit Beban Sewa. Jurnal penyesuaian per 31 Desember 2026 adalah...', qEn: 'On October 1, 2026, rent of IDR 24,000,000 was paid for 1 year and recorded as debit Rent Expense. The adjusting entry as of December 31, 2026 is...', a: 'Debit Sewa Dibayar Dimuka Rp18.000.000, Kredit Beban Sewa Rp18.000.000', b: 'Debit Beban Sewa Rp6.000.000, Kredit Sewa Dibayar Dimuka Rp6.000.000', c: 'Debit Sewa Dibayar Dimuka Rp6.000.000, Kredit Beban Sewa Rp6.000.000', d: 'Debit Beban Sewa Rp18.000.000, Kredit Kas Rp18.000.000', ans: 'A', expId: 'Dicatat pendekatan beban: yang sudah menjadi beban (Okt-Des = 3 bulan) Rp6jt, yang belum menjadi beban (9 bulan = Rp18jt) dipindahkan ke Sewa Dibayar Dimuka.', expEn: 'Recorded as expense approach: 3 months used (6M), remaining 9 months (18M) transferred to Prepaid Rent.', kom: 'Jurnal Penyesuaian Beban Dibayar Dimuka' },
            { topIdx: 9, diff: 'HOTS', topicName: 'Kertas Kerja / Neraca Lajur (Worksheet)', qId: 'Dalam Kertas Kerja 10 Kolom, kolom Laba Rugi menunjukkan total Kredit Rp85.000.000 dan total Debit Rp60.000.000. Kesimpulan dan posisi pencatatan selisih Rp25.000.000 yang tepat adalah...', qEn: 'In a 10-column worksheet, the Income Statement columns show total Credit IDR 85,000,000 and total Debit IDR 60,000,000. The conclusion and placement of the IDR 25,000,000 difference is...', a: 'Perusahaan memperoleh Laba Bersih Rp25.000.000; dicatat di Laba Rugi (Debit) dan Neraca (Kredit)', b: 'Perusahaan mengalami Rugi Bersih Rp25.000.000; dicatat di Laba Rugi (Kredit) dan Neraca (Debit)', c: 'Perusahaan memperoleh Laba Bersih Rp25.000.000; dicatat di Laba Rugi (Kredit) dan Neraca (Debit)', d: 'Modal perusahaan berkurang Rp25.000.000; dicatat di Neraca Saldo', ans: 'A', expId: 'Kredit Laba Rugi (Pendapatan 85jt) > Debit Laba Rugi (Beban 60jt) = Laba Bersih 25jt. Selisih dicatat di Laba Rugi (Debit) untuk menyeimbangkan, dan di Neraca (Kredit) menambah Ekuitas.', expEn: 'Revenues (85M) > Expenses (60M) = Net Income 25M. Debit Income Statement column and Credit Balance Sheet column.', kom: 'Analisis Neraca Lajur 10 Kolom' },
            { topIdx: 10, diff: 'MIDDLE', topicName: 'Laporan Laba Rugi (Income Statement)', qId: 'PT Serba Ada mencatat Penjualan Bersih Rp120.000.000, HPP Rp70.000.000, dan Beban Operasional Rp25.000.000. Berapakah Laba Operasional perusahaan?', qEn: 'PT Serba Ada recorded Net Sales IDR 120,000,000, COGS IDR 70,000,000, and Operating Expenses IDR 25,000,000. What is the Operating Income?', a: 'Rp25.000.000', b: 'Rp50.000.000', c: 'Rp75.000.000', d: 'Rp95.000.000', ans: 'A', expId: 'Laba Kotor = Penjualan - HPP = 120jt - 70jt = 50jt. Laba Operasional = Laba Kotor - Beban Operasional = 50jt - 25jt = Rp25.000.000.', expEn: 'Gross Profit = Sales - COGS = 50M. Operating Income = Gross Profit - Operating Expenses = 50M - 25M = 25M.', kom: 'Perhitungan Laporan Laba Rugi' },
            { topIdx: 11, diff: 'MIDDLE', topicName: 'Laporan Perubahan Modal', qId: 'Modal awal Bengkel Rapi Rp40.000.000, selama periode berjalan Laba Bersih Rp15.000.000, dan pemilik mengambil Prive Rp3.000.000. Berapakah Modal Akhir perusahaan?', qEn: 'Initial Capital of Bengkel Rapi is IDR 40,000,000, Net Income for the period is IDR 15,000,000, and Drawing is IDR 3,000,000. What is the Ending Capital?', a: 'Rp52.000.000', b: 'Rp55.000.000', c: 'Rp58.000.000', d: 'Rp38.000.000', ans: 'A', expId: 'Modal Akhir = Modal Awal + Laba Bersih - Prive = 40.000.000 + 15.000.000 - 3.000.000 = Rp52.000.000.', expEn: 'Ending Capital = Beginning Capital + Net Income - Drawing = 40M + 15M - 3M = 52M.', kom: 'Penyusunan Perubahan Modal' },
            { topIdx: 12, diff: 'HOTS', topicName: 'Neraca (Balance Sheet)', qId: 'Manakah pengelompokan Aset dan Liabilitas yang paling tepat sesuai urutan likuiditas dan jatuh tempo pada Neraca per 31 Desember?', qEn: 'Which grouping of Assets and Liabilities is most appropriate in order of liquidity and maturity on the December 31 Balance Sheet?', a: 'Kas, Piutang Usaha, Persediaan, Peralatan (Aset) & Utang Dagang, Utang Bank Jangka Panjang (Liabilitas)', b: 'Peralatan, Kas, Persediaan (Aset) & Utang Bank Jangka Panjang, Utang Dagang (Liabilitas)', c: 'Gedung, Kas, Perlengkapan (Aset) & Utang Hipotek, Utang Gaji (Liabilitas)', d: 'Kendaraan, Piutang, Kas (Aset) & Utang Wesel, Modal Pemilik (Liabilitas)', ans: 'A', expId: 'Aset disajikan urut tingkat likuiditas (Kas -> Piutang -> Persediaan -> Peralatan). Liabilitas disajikan urut jatuh tempo (Lancar -> Jangka Panjang).', expEn: 'Assets are ordered by liquidity (Cash -> A/R -> Inventory -> Equipment). Liabilities are ordered by maturity.', kom: 'Sistematika Neraca / Posisi Keuangan' },
            { topIdx: 13, diff: 'HOTS', topicName: 'Laporan Arus Kas (Cash Flow)', qId: 'Pembelian mesin pabrik secara tunai Rp50.000.000 dan penerimaan pinjaman kredit bank Rp100.000.000 masing-masing diklasifikasikan dalam Laporan Arus Kas sebagai...', qEn: 'Cash purchase of factory machinery IDR 50,000,000 and receipt of bank loan IDR 100,000,000 are classified in Cash Flow Statement as...', a: 'Aktivitas Investasi (Kas Keluar) & Aktivitas Pendanaan (Kas Masuk)', b: 'Aktivitas Operasi (Kas Keluar) & Aktivitas Investasi (Kas Masuk)', c: 'Aktivitas Investasi (Kas Masuk) & Aktivitas Pendanaan (Kas Keluar)', d: 'Aktivitas Operasi (Kas Keluar) & Aktivitas Operasi (Kas Masuk)', ans: 'A', expId: 'Pembelian aset tetap (mesin) = Aktivitas Investasi (keluar). Penerimaan utang jangka panjang (bank) = Aktivitas Pendanaan (masuk).', expEn: 'Purchase of fixed assets = Investing activity (outflow). Bank loan received = Financing activity (inflow).', kom: 'Klasifikasi Aktivitas Laporan Arus Kas' },
            { topIdx: 14, diff: 'MIDDLE', topicName: 'Jurnal Penutup (Closing Entries)', qId: 'Akun manakah di bawah ini yang TIDAK ditutup pada akhir periode akuntansi (bukan akun nominal)?', qEn: 'Which account is NOT closed at the end of the accounting period (not a nominal account)?', a: 'Sewa Dibayar Dimuka (Prepaid Rent)', b: 'Beban Gaji (Salaries Expense)', c: 'Pendapatan Jasa (Service Revenue)', d: 'Prive Pemilik (Owner\'s Drawings)', ans: 'A', expId: 'Sewa Dibayar Dimuka adalah akun riil (Aset Lancar) yang saldonya berlanjut ke periode berikutnya, bukan akun nominal.', expEn: 'Prepaid Rent is a real account (Current Asset) carried forward to next period, not a nominal account.', kom: 'Identifikasi Akun Riil & Nominal' },
            { topIdx: 15, diff: 'HOTS', topicName: 'Jurnal Pembalik (Reversing Entries)', qId: 'Pada akhir periode dibuat penyesuaian untuk Gaji Karyawan yang belum dibayar Rp4.000.000. Mengapa jurnal pembalik perlu dibuat di awal periode berikutnya?', qEn: 'An adjustment for unpaid Salaries of IDR 4,000,000 was made at year end. Why should a reversing entry be created at the start of the next period?', a: 'Untuk menyederhanakan pencatatan saat pembayaran gaji rutin berikutnya dilakukan tanpa perlu memisah utang gaji', b: 'Untuk membatalkan seluruh transaksi beban gaji tahun lalu', c: 'Karena diwajibkan oleh Standar Akuntansi Keuangan (SAK)', d: 'Agar total ekuitas awal periode menjadi nol', ans: 'A', expId: 'Jurnal pembalik bersifat opsional tetapi berguna mencegah pencatatan ganda dan memudahkan jurnal pembayaran gaji rutin periode baru.', expEn: 'Reversing entries simplify recording subsequent routine cash payments without splitting accrued liabilities.', kom: 'Tujuan & Mekanisme Jurnal Pembalik' },
            { topIdx: 16, diff: 'HOTS', topicName: 'Kas & Kas Kecil (Petty Cash)', qId: 'Dalam sistem dana tetap (Imprest Fund System), manakah prosedur yang BENAR saat terjadi pengeluaran kas kecil sehari-hari?', qEn: 'In an Imprest Petty Cash System, which procedure is CORRECT when daily petty cash expenses occur?', a: 'Petugas kas kecil mencatat pengeluaran di bukti kas kecil tanpa membuat jurnal umum di Buku Besar saat itu', b: 'Kasir langsung mendebit akun beban terkait dan mengkredit akun Kas Kecil tiap ada transaksi', c: 'Akun Kas Kecil bertambah saldo debitnya setiap pengisian ulang', d: 'Beban kas kecil diakumulasi dan ditutup ke Laporan Laba Rugi tanpa bukti voucher', ans: 'A', expId: 'Pada sistem Imprest, saat terjadi pengeluaran HANYA dibuat voucher bukti kas kecil. Jurnal debit Beban dan kredit Kas baru dicatat saat pengisian kembali (replenishment).', expEn: 'In Imprest system, daily expenses are recorded on vouchers only. Journal entries are made upon replenishment.', kom: 'Mekanisme Kas Kecil Imprest System' },
            { topIdx: 17, diff: 'HOTS', topicName: 'Piutang Dagang & Cadangan Kerugian', qId: 'Saldo Piutang Dagang Rp100.000.000 dan saldo Cadangan Kerugian Piutang (kredit) Rp2.000.000. Perusahaan menetapkan taksiran piutang tak tertagih 5% dari saldo piutang. Beban Cadangan Piutang yang dicatat pada penyesuaian adalah...', qEn: 'Accounts Receivable balance IDR 100,000,000 and Allowance for Uncollectible Accounts (credit) IDR 2,000,000. Company estimates bad debt at 5% of AR balance. Bad Debt Expense in adjustment is...', a: 'Rp3.000.000', b: 'Rp5.000.000', c: 'Rp7.000.000', d: 'Rp2.000.000', ans: 'A', expId: 'Taksiran total cadangan = 5% x 100jt = Rp5jt. Karena sudah ada saldo kredit Rp2jt, maka penyesuaian yang perlu ditambah adalah 5jt - 2jt = Rp3.000.000.', expEn: 'Estimated total allowance = 5% x 100M = 5M. Adjusted amount needed = 5M - existing 2M credit = 3M.', kom: 'Penyesuaian Cadangan Kerugian Piutang' },
            { topIdx: 18, diff: 'HOTS', topicName: 'Persediaan Barang Dagang (Inventory)', qId: 'Dalam periode terjadinya kenaikan harga barang (inflasi), penerapan metode FIFO Perpetual dibandingkan metode Average akan menghasilkan...', qEn: 'During a period of rising prices (inflation), applying FIFO Perpetual compared to Average method will result in...', a: 'HPP lebih rendah, Laba Bersih lebih tinggi, dan Nilai Persediaan Akhir lebih tinggi', b: 'HPP lebih tinggi dan Laba Bersih lebih rendah', c: 'Nilai Persediaan Akhir lebih rendah dan HPP lebih tinggi', d: 'Laba Bersih dan Persediaan Akhir yang sama persis', ans: 'A', expId: 'Metode FIFO mengalokasikan harga lama yang lebih murah ke HPP (sehingga HPP rendah) dan harga baru yang mahal ke Persediaan Akhir (sehingga laba & persediaan tinggi).', expEn: 'FIFO assigns older lower costs to COGS (lower COGS) and recent higher costs to Ending Inventory (higher net income & inventory).', kom: 'Evaluasi Dampak Inflasi pada FIFO vs Average' },
            { topIdx: 19, diff: 'MIDDLE', topicName: 'Harga Pokok Penjualan (HPP / COGS)', qId: 'Persediaan awal Rp15.000.000, Pembelian Rp45.000.000, Beban angkut pembelian Rp2.000.000, Retur pembelian Rp3.000.000, dan Persediaan akhir Rp18.000.000. Berapakah HPP?', qEn: 'Beginning inventory IDR 15,000,000, Purchases IDR 45,000,000, Freight-in IDR 2,000,000, Purchase returns IDR 3,000,000, and Ending inventory IDR 18,000,000. What is COGS?', a: 'Rp41.000.000', b: 'Rp44.000.000', c: 'Rp47.000.000', d: 'Rp39.000.000', ans: 'A', expId: 'Pembelian Bersih = 45jt + 2jt - 3jt = 44jt. Barang Tersedia Dijual = 15jt + 44jt = 59jt. HPP = 59jt - 18jt = Rp41.000.000.', expEn: 'Net Purchases = 44M. Goods Available = 59M. COGS = Goods Available - Ending Inventory = 41M.', kom: 'Perhitungan Komponen HPP' },
            { topIdx: 20, diff: 'MIDDLE', topicName: 'Aset Tetap (Fixed Assets)', qId: 'PT Mulia membeli mesin produksi Rp80.000.000, biaya pengiriman Rp3.000.000, dan biaya instalasi/uji coba Rp2.000.000. Harga perolehan (cost) mesin dicatat sebesar...', qEn: 'PT Mulia buys production machinery for IDR 80,000,000, freight cost IDR 3,000,000, and installation/test cost IDR 2,000,000. Capitalized acquisition cost is...', a: 'Rp85.000.000', b: 'Rp80.000.000', c: 'Rp83.000.000', d: 'Rp82.000.000', ans: 'A', expId: 'Seluruh biaya yang dikeluarkan hingga aset siap digunakan (harga beli + ongkos kirim + instalasi) dikapitalisasi ke harga perolehan: 80 + 3 + 2 = Rp85.000.000.', expEn: 'All expenditures necessary to prepare asset for intended use are capitalized: 80 + 3 + 2 = 85,000,000.', kom: 'Kapitalisasi Harga Perolehan Aset' },
            { topIdx: 21, diff: 'HOTS', topicName: 'Penyusutan Aset Tetap (Depreciation)', qId: 'Mesin dengan harga perolehan Rp100.000.000 dan nilai residu Rp10.000.000 memiliki umur ekonomis 5 tahun. Jika menggunakan metode Garis Lurus dan dibeli per 1 April 2026, akumulasi penyusutan per 31 Desember 2026 adalah...', qEn: 'Machinery with cost IDR 100,000,000 and residual value IDR 10,000,000 has 5 years useful life. Using Straight Line method purchased April 1, 2026, accumulated depreciation on Dec 31, 2026 is...', a: 'Rp13.500.000', b: 'Rp18.000.000', c: 'Rp20.000.000', d: 'Rp15.000.000', ans: 'A', expId: 'Depresiasi per tahun = (100jt - 10jt) / 5 = Rp18jt/tahun. Masa pemakaian 2026 (April - Des) = 9 bulan. Beban 2026 = (9/12) x 18jt = Rp13.500.000.', expEn: 'Annual dep = (100M - 10M)/5 = 18M/yr. 9 months in 2026 = (9/12) x 18M = 13.5M.', kom: 'Penyusutan Garis Lurus Proporsional Bulan' },
            { topIdx: 22, diff: 'MIDDLE', topicName: 'Utang Lancar & Utang Jangka Panjang', qId: 'Pada 1 November 2026 diterbitkan Wesel Bayar Rp30.000.000 dengan bunga 12% per tahun jangka waktu 6 bulan. Beban Bunga akrual yang harus diakui per 31 Desember 2026 adalah...', qEn: 'On November 1, 2026, a 6-month 12% Note Payable of IDR 30,000,000 was issued. Accrued Interest Expense recognized on December 31, 2026 is...', a: 'Rp600.000', b: 'Rp3.600.000', c: 'Rp1.200.000', d: 'Rp300.000', ans: 'A', expId: 'Bunga 2 bulan (Nov-Des) = 30.000.000 x 12% x (2/12) = Rp600.000.', expEn: 'Accrued interest for 2 months = 30M x 12% x (2/12) = 600,000.', kom: 'Pencatatan Akrual Bunga Utang Wesel' },
            { topIdx: 23, diff: 'HOTS', topicName: 'Ekuitas & Modal Perusahaan', qId: 'PT Jayakarta mengumumkan pembagian dividen kas sebesar Rp50.000.000 pada tanggal 10 Desember dan dibayarkan pada 20 Januari tahun berikutnya. Ayat jurnal pada tanggal pengumuman (10 Des) adalah...', qEn: 'PT Jayakarta declared a cash dividend of IDR 50,000,000 on Dec 10, payable on Jan 20 next year. The journal entry on declaration date (Dec 10) is...', a: 'Debit Saldo Laba (Retained Earnings) Rp50.000.000, Kredit Utang Dividen Rp50.000.000', b: 'Debit Beban Dividen Rp50.000.000, Kredit Kas Rp50.000.000', c: 'Debit Utang Dividen Rp50.000.000, Kredit Kas Rp50.000.000', d: 'Tidak ada jurnal transaksi sampai hari pembayaran', ans: 'A', expId: 'Pada tanggal pengumuman, timbul kewajiban sah bagi perusahaan. Saldo Laba berkurang (debit) dan Utang Dividen bertambah (kredit).', expEn: 'On declaration date, a legal liability is created. Retained Earnings debited and Dividends Payable credited.', kom: 'Jurnal Pengumuman Dividen Kas' },
            { topIdx: 24, diff: 'MIDDLE', topicName: 'Pendapatan Usaha & Luar Usaha', qId: 'Perusahaan jasa menyelesaikan perbaikan mesin pelanggan senilai Rp5.000.000, namun pembayaran baru akan diterima bulan depan. Sesuai accrual basis, jurnalnya adalah...', qEn: 'A service company completes customer machinery repair worth IDR 5,000,000, payment to be received next month. Under accrual basis, journal is...', a: 'Debit Piutang Usaha Rp5.000.000, Kredit Pendapatan Jasa Rp5.000.000', b: 'Debit Kas Rp5.000.000, Kredit Pendapatan Jasa Rp5.000.000', c: 'Debit Utang Usaha Rp5.000.000, Kredit Kas Rp5.000.000', d: 'Tidak dijurnal sampai kas diterima', ans: 'A', expId: 'Pendapatan diakui saat jasa selesai diserahkan (earned), meskipun belum menerima tunai (debit Piutang Usaha).', expEn: 'Revenue is recognized when service is performed (earned), debiting Accounts Receivable.', kom: 'Pengakuan Pendapatan Akrual' },
            { topIdx: 25, diff: 'MIDDLE', topicName: 'Beban Operasional & Beban Lainnya', qId: 'Pengeluaran kas untuk biaya iklan di media cetak dan komisi salesmen termasuk dalam kelompok beban...', qEn: 'Cash disbursements for print media advertising and salesmen commission belong to...', a: 'Beban Pemasaran / Penjualan (Selling Expenses)', b: 'Beban Administrasi & Umum', c: 'Beban Luar Usaha', d: 'Beban Hak Paten', ans: 'A', expId: 'Biaya iklan dan komisi penjualan merupakan bagian langsung dari kegiatan pemasaran barang/jasa.', expEn: 'Advertising and sales commissions are direct components of selling/marketing expenses.', kom: 'Pengelompokan Beban Operasional' },
            { topIdx: 26, diff: 'HOTS', topicName: 'Rasio Keuangan (Financial Ratios)', qId: 'Perusahaan memiliki Aset Lancar Rp200.000.000 (termasuk Persediaan Rp80.000.000) dan Liabilitas Jangka Pendek Rp100.000.000. Berapakah nilai Quick Ratio (Rasio Cepat) perusahaan?', qEn: 'A firm has Current Assets IDR 200,000,000 (including Inventory IDR 80,000,000) and Current Liabilities IDR 100,000,000. What is the Quick Ratio?', a: '1,2 : 1 (atau 120%)', b: '2,0 : 1 (atau 200%)', c: '0,8 : 1 (atau 80%)', d: '1,5 : 1 (atau 150%)', ans: 'A', expId: 'Quick Ratio = (Aset Lancar - Persediaan) / Liabilitas Jangka Pendek = (200jt - 80jt) / 100jt = 120jt / 100jt = 1,2.', expEn: 'Quick Ratio = (Current Assets - Inventory) / Current Liabilities = (200M - 80M)/100M = 1.2.', kom: 'Perhitungan & Analisis Quick Ratio' },
            { topIdx: 27, diff: 'HOTS', topicName: 'Analisis Laporan Keuangan', qId: 'Metode analisis laporan keuangan dengan membandingkan tiap pos komponen Laporan Laba Rugi terhadap total Penjualan Bersih sebagai basis 100% disebut...', qEn: 'The financial statement analysis method comparing each line item in Income Statement against total Net Sales as a 100% base is called...', a: 'Analisis Vertikal / Common-Size Statement', b: 'Analisis Horizontal / Trend Analysis', c: 'Analisis Rasio Solvabilitas', d: 'Analisis Break Even Point', ans: 'A', expId: 'Analisis Vertikal (Common Size) menghitung persentase tiap komponen relatif terhadap total Penjualan Bersih (Laba Rugi) atau Total Aset (Neraca).', expEn: 'Vertical (Common-Size) analysis calculates each line item as a percentage of total sales or total assets.', kom: 'Metodologi Analisis Vertikal Common Size' },
            { topIdx: 28, diff: 'MIDDLE', topicName: 'Akuntansi Perusahaan Dagang', qId: 'Syarat penyerahan barang "FOB Destination Point" berarti bahwa...', qEn: 'The terms of delivery "FOB Destination Point" implies that...', a: 'Beban angkut ditanggung oleh penjual dan hak kepemilikan berpindah saat barang sampai di gudang pembeli', b: 'Beban angkut ditanggung oleh pembeli sejak barang keluar dari gudang penjual', c: 'Barang yang rusak di perjalanan menjadi tanggung jawab penuh pembeli', d: 'Pembeli mendapat potongan tunai saat transaksi', ans: 'A', expId: 'FOB Destination: Ongkos kirim dibayar penjual dan kepemilikan barang baru beralih ketika barang secara fisik tiba di tujuan pembeli.', expEn: 'FOB Destination: Seller pays freight and retains title until goods reach buyer destination.', kom: 'Syarat Penyerahan Barang Dagang' },
            { topIdx: 29, diff: 'MIDDLE', topicName: 'Akuntansi Perusahaan Jasa', qId: 'Urutan tahapan siklus akuntansi perusahaan jasa sesudah penyusunan Kertas Kerja (Neraca Lajur) adalah...', qEn: 'The correct sequence of the accounting cycle for a service company after completing the Worksheet is...', a: 'Penyusunan Laporan Keuangan -> Jurnal Penutup -> Neraca Saldo Setelah Penutupan', b: 'Jurnal Penutup -> Laporan Keuangan -> Jurnal Pembalik', c: 'Jurnal Penyesuaian -> Jurnal Penutup -> Laporan Keuangan', d: 'Neraca Saldo Setelah Penutupan -> Laporan Keuangan', ans: 'A', expId: 'Urutan siklus akuntansi: Kertas Kerja -> Laporan Keuangan -> Jurnal Penutup -> Buku Besar Penutup -> Neraca Saldo Setelah Penutupan.', expEn: 'Accounting cycle order: Worksheet -> Financial Statements -> Closing Entries -> Post-Closing Trial Balance.', kom: 'Sistematika Siklus Akuntansi Jasa' },
            { topIdx: 30, diff: 'MIDDLE', topicName: 'Pengantar Akuntansi Biaya', qId: 'Manakah di bawah ini yang merupakan perbedaan utama antara Akuntansi Keuangan dengan Akuntansi Biaya/Manajemen?', qEn: 'Which of the following is a primary difference between Financial Accounting and Cost/Management Accounting?', a: 'Akuntansi Keuangan berfokus pada pihak eksternal dengan standar SAK, sedangkan Akuntansi Biaya berfokus pada keputusan internal manajerial', b: 'Akuntansi Keuangan tidak menggunakan satuan uang', c: 'Akuntansi Biaya hanya menyajikan data historis tanpa estimasi', d: 'Akuntansi Keuangan tidak wajib menyusun Neraca', ans: 'A', expId: 'Akuntansi Keuangan diperuntukkan bagi eksternal (investor, bank, pajak) berbasis SAK. Akuntansi Biaya untuk efisiensi biaya & keputusan manajemen internal.', expEn: 'Financial accounting serves external users following GAAP/IFRS; Cost accounting aids internal decision-making.', kom: 'Perbandingan Akuntansi Keuangan vs Biaya' },
            { topIdx: 31, diff: 'HOTS', topicName: 'Klasifikasi dan Perilaku Biaya', qId: 'Biaya sewa gedung pabrik Rp12.000.000 per bulan tergolong biaya tetap. Jika volume produksi meningkat dari 1.000 unit menjadi 2.000 unit, perilaku biaya sewa per unit barang adalah...', qEn: 'Factory rent expense IDR 12,000,000 per month is a fixed cost. If production volume increases from 1,000 to 2,000 units, the rent cost per unit will...', a: 'Turun dari Rp12.000 per unit menjadi Rp6.000 per unit', b: 'Naik dari Rp6.000 per unit menjadi Rp12.000 per unit', c: 'Tetap konstan Rp12.000 per unit', d: 'Menjadi nol rupiah per unit', ans: 'A', expId: 'Total Biaya Tetap konstan (Rp12jt). Saat unit naik 2x lipat (1.000 -> 2.000), biaya tetap per unit menurun setengahnya (12.000 -> 6.000).', expEn: 'Total fixed cost is fixed. As output doubles, fixed cost per unit decreases by half (12,000 to 6,000).', kom: 'Analisis Perilaku Biaya Tetap per Unit' },
            { topIdx: 32, diff: 'HOTS', topicName: 'Harga Pokok Produksi (COGM)', qId: 'PT Industri Cipta mencatat Biaya Bahan Baku Rp30.000.000, BTKL Rp20.000.000, BOP Rp15.000.000, Persediaan BDP Awal Rp8.000.000, dan BDP Akhir Rp5.000.000. Berapakah Harga Pokok Produksi (COGM)?', qEn: 'PT Industri Cipta records Direct Material IDR 30,000,000, Direct Labor IDR 20,000,000, MOH IDR 15,000,000, Beginning WIP IDR 8,000,000, and Ending WIP IDR 5,000,000. What is COGM?', a: 'Rp68.000.000', b: 'Rp65.000.000', c: 'Rp73.000.000', d: 'Rp60.000.000', ans: 'A', expId: 'Total Biaya Manufaktur = 30jt + 20jt + 15jt = 65jt. COGM = Total Biaya Manufaktur + BDP Awal - BDP Akhir = 65jt + 8jt - 5jt = Rp68.000.000.', expEn: 'Total Manufacturing Cost = 65M. COGM = Total Mfg Cost + Beg WIP - End WIP = 65M + 8M - 5M = 68M.', kom: 'Perhitungan Formula COGM Manufaktur' },
            { topIdx: 33, diff: 'MIDDLE', topicName: 'Biaya Bahan Baku (Direct Materials)', qId: 'Manakah biaya berikut yang dikategorikan sebagai Biaya Bahan Baku Langsung (Direct Materials) pada pabrik mebel kayu?', qEn: 'Which cost is categorized as Direct Materials in a wooden furniture factory?', a: 'Kayu jati dan papan Multiplek utama', b: 'Amplas dan lem kayu pelapis', c: 'Listrik mesin pemotong kayu', d: 'Paku dan cat pelindung', ans: 'A', expId: 'Bahan Baku Langsung adalah bahan utama yang secara fisik dapat ditelusuri secara ekonomis ke produk jadi (kayu jati). Amplas/lem masuk BOP.', expEn: 'Direct materials are primary physical materials directly traceable to finished product (teak wood).', kom: 'Identifikasi Bahan Baku Langsung' },
            { topIdx: 34, diff: 'MIDDLE', topicName: 'Biaya Tenaga Kerja (Direct Labor)', qId: 'Upah yang dibayarkan kepada operator mesin jahit di pabrik konveksi pakaian diklasifikasikan sebagai...', qEn: 'Wages paid to sewing machine operators in a garment factory are classified as...', a: 'Biaya Tenaga Kerja Langsung (Direct Labor)', b: 'Biaya Overhead Pabrik (BOP)', c: 'Beban Pemasaran', d: 'Biaya Administrasi Umum', ans: 'A', expId: 'Operator mesin jahit mengerjakan produk pakaian secara langsung sehingga upahnya tergolong BTKL.', expEn: 'Sewing machine operators directly handle garment production, classified as Direct Labor.', kom: 'Klasifikasi Tenaga Kerja Langsung' },
            { topIdx: 35, diff: 'HOTS', topicName: 'Biaya Overhead Pabrik (BOP)', qId: 'Tarif BOP ditentukan dimuka Rp5.000 per jam mesin. Selama periode berjalan digunakan 1.000 jam mesin, dan BOP sesungguhnya terjadi Rp5.200.000. Kesimpulan mengenai selisih BOP adalah...', qEn: 'Predetermined MOH rate is IDR 5,000 per machine hour. Actual usage is 1,000 hours, and actual MOH is IDR 5,200,000. The conclusion regarding MOH variance is...', a: 'Selisih Kurang Dibebankan (Underapplied MOH) sebesar Rp200.000', b: 'Selisih Lebih Dibebankan (Overapplied MOH) sebesar Rp200.000', c: 'BOP seimbang tidak ada selisih', d: 'Selisih Kurang Dibebankan sebesar Rp5.000.000', ans: 'A', expId: 'BOP Dibebankan = 1.000 jam x Rp5.000 = Rp5.000.000. BOP Sesungguhnya = Rp5.200.000. Karena dibebankan < sesungguhnya, maka Underapplied MOH Rp200.000.', expEn: 'Applied MOH = 1,000 x 5,000 = 5,000,000. Actual MOH = 5,200,000. Applied < Actual = Underapplied MOH of 200,000.', kom: 'Analisis Selisih BOP Dibebankan vs Sesungguhnya' },
            { topIdx: 36, diff: 'HOTS', topicName: 'Akuntansi Perusahaan Manufaktur', qId: 'Saat produk selesai dikerjakan di bagian produksi pabrik, jurnal umum yang dibuat untuk mencatat pemindahan nilai produk adalah...', qEn: 'When goods are completed in factory production, the general journal entry to record transfer of product value is...', a: 'Debit Persediaan Barang Jadi, Kredit Persediaan Barang Dalam Proses (BDP)', b: 'Debit Persediaan BDP, Kredit Biaya Bahan Baku', c: 'Debit Harga Pokok Penjualan, Kredit Persediaan Barang Jadi', d: 'Debit Persediaan Bahan Baku, Kredit Kas', ans: 'A', expId: 'Produk selesai berpindah dari akun Barang Dalam Proses (BDP) ke akun Persediaan Barang Jadi (Finished Goods Inventory).', expEn: 'Completed products are transferred from Work in Process (WIP) to Finished Goods Inventory.', kom: 'Jurnal Pemindahan Barang Jadi Manufaktur' },
            { topIdx: 18, diff: 'HOTS', topicName: 'Persediaan Barang Dagang (Inventory)', qId: 'Diterima kembali barang dagang yang dijual secara kredit senilai Rp2.000.000 dengan HPP Rp1.400.000 (metode Perpetual). Ayat jurnal untuk mencatat penerimaan kembali barang tersebut adalah...', qEn: 'Received returned merchandise sold on credit worth IDR 2,000,000 with COGS IDR 1,400,000 (Perpetual). The journal entries to record this return are...', a: 'Debit Retur Penjualan Rp2.000.000 (Kredit Piutang Rp2.000.000) & Debit Persediaan Barang Rp1.400.000 (Kredit HPP Rp1.400.000)', b: 'Debit Retur Penjualan Rp2.000.000 & Kredit Kas Rp2.000.000', c: 'Debit HPP Rp1.400.000 & Kredit Persediaan Barang Rp1.400.000', d: 'Debit Piutang Rp2.000.000 & Kredit Penjualan Rp2.000.000', ans: 'A', expId: 'Pada metode perpetual, retur penjualan mencatat 2 pasangan jurnal: membatalkan piutang/penjualan serta mengembalikan fisik persediaan & HPP.', expEn: 'Perpetual sales return requires 2 entries: adjust receivable/sales return and restore inventory/adjust COGS.', kom: 'Jurnal Retur Penjualan Perpetual Dual Entry' },
            { topIdx: 17, diff: 'HOTS', topicName: 'Piutang Dagang & Cadangan Kerugian', qId: 'Diterima kembali pembayaran piutang sebesar Rp1.000.000 dari pelanggan yang piutangnya telah dihapuskan bulan lalu (metode cadangan). Jurnal pertama untuk memulihkan akun piutang adalah...', qEn: 'Received payment of IDR 1,000,000 from a customer whose receivable was written off last month (allowance method). The first journal entry to reinstate the account is...', a: 'Debit Piutang Dagang Rp1.000.000, Kredit Cadangan Kerugian Piutang Rp1.000.000', b: 'Debit Kas Rp1.000.000, Kredit Pendapatan Piutang Rp1.000.000', c: 'Debit Beban Kerugian Piutang Rp1.000.000, Kredit Kas Rp1.000.000', d: 'Debit Cadangan Kerugian Piutang Rp1.000.000, Kredit Kas Rp1.000.000', ans: 'A', expId: 'Pemulihan piutang (reinstatement) membalik jurnal penghapusan awal: mendebit kembali Piutang Dagang dan mengkredit Cadangan Kerugian Piutang.', expEn: 'Recovery of written-off account under allowance method reverses write-off: debit A/R and credit Allowance.', kom: 'Pemulihan Piutang Dihapus Metode Cadangan' },
            { topIdx: 8, diff: 'HOTS', topicName: 'Jurnal Penyesuaian (Adjusting Entries)', qId: 'Diterima pendapatan sewa Rp12.000.000 untuk 1 tahun per 1 November 2026 dan dicatat pendekatan Utang (Pendapatan Diterima Dimuka). Penyesuaian per 31 Desember 2026 adalah...', qEn: 'Unearned rent revenue of IDR 12,000,000 received Nov 1, 2026 for 1 year, recorded as liability. Adjustment as of December 31, 2026 is...', a: 'Debit Pendapatan Sewa Diterima Dimuka Rp2.000.000, Kredit Pendapatan Sewa Rp2.000.000', b: 'Debit Pendapatan Sewa Rp10.000.000, Kredit Pendapatan Diterima Dimuka Rp10.000.000', c: 'Debit Kas Rp2.000.000, Kredit Pendapatan Sewa Rp2.000.000', d: 'Debit Beban Sewa Rp2.000.000, Kredit Sewa Dimuka Rp2.000.000', ans: 'A', expId: 'Masa 2 bulan (Nov-Des) sudah menjadi hak/pendapatan = 2/12 x 12jt = Rp2.000.000. Akun kewajiban dikurangi (debit) dan Pendapatan Sewa diakui (kredit).', expEn: '2 months earned = (2/12) x 12M = 2M. Liability debited 2M and Rent Revenue credited 2M.', kom: 'Penyesuaian Pendapatan Diterima Dimuka' }
          ];

          return rawSpecs.map((spec, i) => {
            const topicObj = fallbackTopics[spec.topIdx % fallbackTopics.length] || fallbackTopics[0];
            return {
              question_id: 'q_bulk_40_' + Date.now() + '_' + (i + 1),
              topic_id: topicObj.topic_id,
              difficulty: spec.diff as 'MIDDLE' | 'HOTS',
              pertanyaan_id: spec.qId,
              question_en: spec.qEn,
              option_a: spec.a,
              option_b: spec.b,
              option_c: spec.c,
              option_d: spec.d,
              correct_answer: spec.ans as 'A' | 'B' | 'C' | 'D',
              explanation_id: spec.expId,
              explanation_en: spec.expEn,
              kompetensi: spec.kom
            };
          });
        };

        const fallbackQuestions = generateFallback40();
        return res.json({ questions: fallbackQuestions, isMock: true });
      }

      const prompt = `Anda adalah AI Educational Expert Akuntansi SMK Senior di Indonesia.
Buatkan persis ${count} soal pilihan ganda berkualitas tinggi tingkat MIDDLE (20 soal) dan HOTS (20 soal) yang terdistribusi secara merata melingkupi 30 topik Akuntansi SMK.

Daftar Topik Akuntansi SMK (Gunakan topic_id yang tepat):
${dbTopics.slice(0, 30).map(t => `- ID: "${t.topic_id}", Nama: "${t.nama_topik}"`).join('\n')}

Setiap soal harus terstruktur bilingual (Bahasa Indonesia & Bahasa Inggris) dan menyertakan pembahasan rinci dalam kedua bahasa serta kompetensi yang diuji.
Pastikan:
1. difficulty bernilai "MIDDLE" atau "HOTS".
2. correct_answer bernilai salah satu dari "A", "B", "C", atau "D".
3. topic_id menggunakan ID topik yang relevan dari daftar di atas.

Format JSON yang diwajibkan:
[
  {
    "topic_id": "top_01",
    "difficulty": "HOTS",
    "pertanyaan_id": "Pertanyaan Bahasa Indonesia...",
    "question_en": "Question in English...",
    "option_a": "Opsi A...",
    "option_b": "Opsi B...",
    "option_c": "Opsi C...",
    "option_d": "Opsi D...",
    "correct_answer": "A",
    "explanation_id": "Pembahasan rinci Bahasa Indonesia...",
    "explanation_en": "Detailed explanation in English...",
    "kompetensi": "Kompetensi dasar akuntansi..."
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic_id: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                pertanyaan_id: { type: Type.STRING },
                question_en: { type: Type.STRING },
                option_a: { type: Type.STRING },
                option_b: { type: Type.STRING },
                option_c: { type: Type.STRING },
                option_d: { type: Type.STRING },
                correct_answer: { type: Type.STRING },
                explanation_id: { type: Type.STRING },
                explanation_en: { type: Type.STRING },
                kompetensi: { type: Type.STRING }
              },
              required: [
                'topic_id',
                'difficulty',
                'pertanyaan_id',
                'question_en',
                'option_a',
                'option_b',
                'option_c',
                'option_d',
                'correct_answer',
                'explanation_id',
                'explanation_en'
              ]
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '[]');
      const generatedQuestions: Question[] = parsed.map((item: any, idx: number) => ({
        question_id: 'q_bulk_gen_' + Date.now() + '_' + idx,
        topic_id: item.topic_id || 'top_01',
        difficulty: (['MIDDLE', 'HOTS'].includes(item.difficulty) ? item.difficulty : (idx % 2 === 0 ? 'MIDDLE' : 'HOTS')) as 'MIDDLE' | 'HOTS',
        pertanyaan_id: item.pertanyaan_id,
        question_en: item.question_en || item.pertanyaan_id,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
        correct_answer: (['A', 'B', 'C', 'D'].includes(item.correct_answer) ? item.correct_answer : 'A') as 'A' | 'B' | 'C' | 'D',
        explanation_id: item.explanation_id,
        explanation_en: item.explanation_en || item.explanation_id,
        kompetensi: item.kompetensi || 'Pemahaman Akuntansi'
      }));

      logActivity('AI System', 'gemini', `Generate ${generatedQuestions.length} Bulk Soal AI (Middle & HOTS)`);
      res.json({ questions: generatedQuestions, isMock: false });
    } catch (err: any) {
      console.error('Error generating bulk AI questions:', err);
      res.status(500).json({ error: 'Gagal membuat 40 soal AI: ' + err.message });
    }
  });

  // B. AI ORAL RESPONSE EVALUATOR
  app.post('/api/ai/evaluate-oral', async (req: Request, res: Response) => {
    try {
      const { question_text, student_transcript, topic_name } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Quality fallback evaluation
        const wordCount = (student_transcript || '').split(' ').length;
        const baseScore = Math.min(92, Math.max(65, 60 + Math.floor(wordCount * 1.2)));
        return res.json({
          eval: {
            concept_accuracy: Math.min(100, baseScore + 2),
            reasoning: Math.min(100, baseScore - 3),
            completeness: Math.min(100, baseScore - 1),
            communication: Math.min(100, baseScore + 4),
            recommended_score: baseScore,
            summary_feedback: `Jawaban siswa cukup terstruktur dengan ${wordCount} kata. Pemahaman dasar konsep ${topic_name || 'Akuntansi'} sudah memadai, namun uraian argumentasi perlu lebih diperdalam.`,
            strengths: ['Penggunaan istilah akuntansi baik', 'Artikulasi kalimat jelas'],
            improvements: ['Tambahkan ilustrasi kasus jurnal penyesuaian/transaksi riil']
          },
          isMock: true
        });
      }

      const prompt = `Anda adalah Assessor Pendidikan Akuntansi SMK Senior.
Evaluasi jawaban lisan siswa untuk pertanyaan wawancara akuntansi berikut:

TOPIK AKUNTANSI: "${topic_name || 'Akuntansi SMK'}"
PERTANYAAN WAWANCARA: "${question_text}"
TRANSKRIP JAWABAN LISAN SISWA: "${student_transcript}"

Analisis berdasarkan 4 kriteria rubrik (skala 0-100):
1. Concept Accuracy (Ketepatan Konsep Akuntansi)
2. Reasoning (Penalaran & Logika Hubungan Akun)
3. Completeness (Kelengkapan Jawaban)
4. Communication (Kelarasan & Penyampaian Bahasa)

Berikan skor rekomendasi (0-100), ringkasan feedback konstruktif, poin kekuatan, dan poin yang perlu diperbaiki.

Format JSON yang diwajibkan:
{
  "concept_accuracy": 85,
  "reasoning": 80,
  "completeness": 82,
  "communication": 88,
  "recommended_score": 84,
  "summary_feedback": "Penjelasan ringkas dan konstruktif...",
  "strengths": ["Poin 1...", "Poin 2..."],
  "improvements": ["Hal yang perlu diperbaiki 1...", "Hal yang perlu diperbaiki 2..."]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              concept_accuracy: { type: Type.NUMBER },
              reasoning: { type: Type.NUMBER },
              completeness: { type: Type.NUMBER },
              communication: { type: Type.NUMBER },
              recommended_score: { type: Type.NUMBER },
              summary_feedback: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              'concept_accuracy',
              'reasoning',
              'completeness',
              'communication',
              'recommended_score',
              'summary_feedback',
              'strengths',
              'improvements'
            ]
          }
        }
      });

      const evalData = JSON.parse(response.text || '{}');
      logActivity('AI Assessor', 'gemini', 'Evaluasi Jawaban Oral AI', `Recommended Score: ${evalData.recommended_score}`);
      res.json({ eval: evalData, isMock: false });
    } catch (err: any) {
      console.error('Error evaluating oral AI response:', err);
      res.status(500).json({ error: 'Gagal mengevaluasi jawaban oral AI: ' + err.message });
    }
  });

  // C. AI CLASS ANALYTICS & EARLY WARNING SYSTEM
  app.post('/api/ai/class-analytics', async (req: Request, res: Response) => {
    try {
      const ai = getGeminiClient();

      const summaryData = {
        total_students: dbStudents.length,
        remedial_students: dbStudents.filter(s => s.status === 'remedial').map(s => s.nama),
        avg_progress: Math.round(dbProgress.reduce((acc, p) => acc + p.overall_progress, 0) / (dbProgress.length || 1)),
        avg_quiz_score: Math.round(dbQuizResults.reduce((acc, r) => acc + r.score, 0) / (dbQuizResults.length || 1)),
        hardest_topics: ['Rasio Keuangan', 'Jurnal Penyesuaian', 'Persediaan Perpetual']
      };

      if (!ai) {
        return res.json({
          analysis: {
            summary: `Kelas menunjukkan rerata progress ${summaryData.avg_progress}% dengan rerata nilai ujian ${summaryData.avg_quiz_score}. Terdapat ${summaryData.remedial_students.length} siswa dalam status remedial (terutama pada topik Jurnal Penyesuaian dan Rasio Keuangan).`,
            early_warnings: [
              `Peringatan: ${summaryData.remedial_students.length} siswa membutuhkan pendampingan khusus remedial.`,
              'Tugas Presentasi Persediaan memiliki tingkat keterlambatan pengumpulan 25%.'
            ],
            difficult_topics: ['Rasio Keuangan (Rerata 58%)', 'Jurnal Penyesuaian (Rerata 62%)', 'Kertas Kerja 10 Kolom (Rerata 65%)'],
            teacher_recommendations: [
              'Adakan sesi pengayaan khusus (remedial clinic) untuk Jurnal Penyesuaian sebelum masuk ke Kertas Kerja.',
              'Gunakan simulasi spreadsheet interaktif pada modul PJDM untuk memperkuat penalaran debit-kredit.',
              'Gunakan fitur AI Socratic Tutor untuk membantu siswa yang terlambat berkonsultasi secara mandiri.'
            ]
          },
          isMock: true
        });
      }

      const prompt = `Anda adalah AI Educational Analytics Consultant untuk LMS Akuntansi SMK.
Analisis data kelas berikut:
${JSON.stringify(summaryData, null, 2)}

Berikan analisis mendalam, peringatan dini (early warning alerts), topik paling sulit, dan rekomendasi langkah nyata untuk guru.

Format JSON yang diwajibkan:
{
  "summary": "Ringkasan kondisi kelas...",
  "early_warnings": ["Peringatan 1...", "Peringatan 2..."],
  "difficult_topics": ["Topik 1...", "Topik 2..."],
  "teacher_recommendations": ["Rekomendasi 1...", "Rekomendasi 2...", "Rekomendasi 3..."]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              early_warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficult_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              teacher_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['summary', 'early_warnings', 'difficult_topics', 'teacher_recommendations']
          }
        }
      });

      const analysisData = JSON.parse(response.text || '{}');
      res.json({ analysis: analysisData, isMock: false });
    } catch (err: any) {
      console.error('Error generating class analytics AI:', err);
      res.status(500).json({ error: 'Gagal membuat analitik AI: ' + err.message });
    }
  });

  // D. SOCRATIC AI TUTOR FOR STUDENTS
  app.post('/api/ai/socratic-tutor', async (req: Request, res: Response) => {
    try {
      const { user_message, topic_name, history = [] } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: `[AI Tutor Socratic] Pertanyaan yang bagus mengenai ${topic_name || 'Akuntansi'}! Coba bayangkan transaksi ini: Jika kita membeli peralatan senilai Rp 5 juta secara kredit, akun manakah yang bertambah di sisi Aset, dan kewajiban apakah yang muncul di sisi Pasiva? Coba sebutkan dulu tebakanmu!`
        });
      }

      const systemInstruction = `Anda adalah AI Tutor Akuntansi SMK yang ramah dan bijak bernama "Pak Guru AI".
Anda menerapkan metode Socratic Learning:
- JANGAN langsung memberikan jawaban akhir secara mentah jika siswa menanyakan jawaban soal aktif.
- Berikan petunjuk langkah demi langkah, ajukan pertanyaan pancingan yang membimbing penalaran siswa, dan berikan analogi bisnis riil yang mudah dipahami anak SMK.
- Gunakan bahasa Indonesia yang santun, memotivasi, dan mudah dicerna.`;

      const contents = [
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        {
          role: 'user',
          parts: [{ text: `[Siswa bertanya seputar topik ${topic_name || 'Akuntansi SMK'}]: ${user_message}` }]
        }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction
        }
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error('Error in Socratic AI tutor:', err);
      res.status(500).json({ error: 'Gagal merespon AI Tutor: ' + err.message });
    }
  });

  // Serve Vite in development / Static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LMS Akuntansi SMK Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
