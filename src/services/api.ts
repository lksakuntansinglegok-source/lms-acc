import {
  Student,
  Teacher,
  Topic,
  Task,
  Question,
  QuizResult,
  OralSubmission,
  PresentationSubmission,
  Submission,
  StudentProgress,
  AppSettings,
  AuditLog,
  AIEvalDetail,
  Material,
  OralQuestion,
  PresentationInterviewQuestions,
  AppNotification,
  LKSReportSubmission
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error (${res.status}): ${errText}`);
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string }>('/api/health'),

  // Teacher Profile
  getTeacher: async (): Promise<Teacher> => {
    return {
      teacher_id: 'tch_01',
      nama: 'Ibu Ratna Pertiwi, S.Pd., M.Ak.',
      nip: '19850315 201001 2 008',
      email: 'ratna.pertiwi@smk.belajar.id',
      sekolah: 'SMK Negeri 1 Surabaya'
    };
  },

  // Students
  getStudents: () => fetchJson<Student[]>('/api/students'),
  getStudentById: (id: string) => fetchJson<Student>(`/api/students/${id}`),
  createStudent: (student: Partial<Student>) =>
    fetchJson<Student>('/api/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id: string, updates: Partial<Student>) =>
    fetchJson<Student>(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteStudent: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/students/${id}`, { method: 'DELETE' }),
  setStudentPassword: (studentId: string, password: string, avatar?: string) =>
    fetchJson<{ success: boolean; message: string; student: Student }>(`/api/students/${studentId}/set-password`, {
      method: 'POST',
      body: JSON.stringify({ password, avatar })
    }),
  resetStudentPassword: (studentId: string, password?: string) =>
    fetchJson<{ success: boolean; message: string; student: Student }>(`/api/students/${studentId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
  resetStudentToZero: (studentId: string) =>
    fetchJson<{ success: boolean; message: string; student: Student; progress?: StudentProgress }>(
      `/api/students/${studentId}/reset-to-zero`,
      { method: 'POST' }
    ),
  resetAllStudentsToZero: (target_class?: string) =>
    fetchJson<{ success: boolean; message: string; studentsCount: number }>(
      '/api/system/reset-all-students-to-zero',
      { method: 'POST', body: JSON.stringify({ target_class }) }
    ),
  wipeAllStudentsAndWork: (password: string) =>
    fetchJson<{
      success: boolean;
      message: string;
      deletedStudentsCount: number;
      deletedSubmissionsCount: number;
    }>('/api/system/wipe-all-students-and-work', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
  getBackupDataset: () =>
    fetchJson<{
      timestamp: string;
      students: Student[];
      tasks: Task[];
      topics: Topic[];
      submissions: Submission[];
      quizResults: QuizResult[];
      oralSubmissions: OralSubmission[];
      presentationSubmissions: PresentationSubmission[];
      progress: StudentProgress[];
      auditLogs: AuditLog[];
    }>('/api/system/backup-dataset'),

  // Topics
  getTopics: () => fetchJson<Topic[]>('/api/topics'),
  createTopic: (topic: Partial<Topic>) =>
    fetchJson<Topic>('/api/topics', { method: 'POST', body: JSON.stringify(topic) }),

  // Tasks & Learning Path
  getTasks: () => fetchJson<Task[]>('/api/tasks'),
  createTask: (task: Partial<Task>) =>
    fetchJson<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id: string, updates: Partial<Task>) =>
    fetchJson<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteTask: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
  reorderTasks: (tasks: Task[]) =>
    fetchJson<{ success: boolean; tasks: Task[] }>('/api/tasks/reorder', {
      method: 'POST',
      body: JSON.stringify({ tasks })
    }),

  // Materials & Oral Questions
  getMaterials: async (): Promise<Material[]> => {
    return [
      {
        material_id: 'mat_01',
        topic_id: 'top_01',
        judul: 'Modul Persiapan Presentasi Akuntansi Dasar',
        link_materi: 'https://drive.google.com/file/d/sample-presentation-guide',
        link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        deskripsi: 'Pelajari konsep dasar akuntansi dan buat video penjelasan berdurasi 3-5 menit.',
        ringkasan: 'Pastikan artikulasi jelas dan sertakan analisis jurnal transaksi pada presentasi.'
      }
    ];
  },

  getOralQuestions: async (): Promise<OralQuestion[]> => {
    return [
      {
        oral_question_id: 'oral_q_1',
        topic_id: 'top_01',
        difficulty: 'HOTS',
        question_id: 'Jelaskan bagaimana transaksi pembelian peralatan secara kredit memengaruhi ketiga unsur dalam Persamaan Dasar Akuntansi!',
        question_en: 'Explain how purchasing equipment on credit impacts all three components of the Basic Accounting Equation!'
      },
      {
        oral_question_id: 'oral_q_2',
        topic_id: 'top_01',
        difficulty: 'MIDDLE',
        question_id: 'Sebutkan definisi Aset, Liabilitas, dan Ekuitas beserta contohnya dalam perusahaan jasa!',
        question_en: 'State the definitions of Assets, Liabilities, and Equity with examples in a service business!'
      }
    ];
  },

  // Questions
  getQuestions: (topic_id?: string, difficulty?: string) => {
    const query = new URLSearchParams();
    if (topic_id) query.set('topic_id', topic_id);
    if (difficulty) query.set('difficulty', difficulty);
    return fetchJson<Question[]>(`/api/questions?${query.toString()}`);
  },
  createQuestion: (q: Partial<Question>) =>
    fetchJson<Question>('/api/questions', { method: 'POST', body: JSON.stringify(q) }),
  bulkCreateQuestions: (questions: Partial<Question>[]) =>
    fetchJson<{ success: boolean; count: number; questions: Question[] }>('/api/questions/bulk', {
      method: 'POST',
      body: JSON.stringify({ questions })
    }),
  deleteQuestion: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/questions/${id}`, { method: 'DELETE' }),

  // Quiz Results
  getQuizResults: () => fetchJson<QuizResult[]>('/api/quiz-results'),
  submitQuiz: (data: Partial<QuizResult>) =>
    fetchJson<QuizResult>('/api/quiz-results', { method: 'POST', body: JSON.stringify(data) }),

  // Oral Submissions
  getOralSubmissions: () => fetchJson<OralSubmission[]>('/api/oral-submissions'),
  submitOral: (data: Partial<OralSubmission>) =>
    fetchJson<OralSubmission>('/api/oral-submissions', { method: 'POST', body: JSON.stringify(data) }),
  reviewOral: (id: string, data: { teacher_score: number; feedback: string }) =>
    fetchJson<OralSubmission>(`/api/oral-submissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOralSubmission: (id: string, updates: { teacher_score?: number; feedback?: string; status?: string }) =>
    fetchJson<OralSubmission>(`/api/oral-submissions/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteOralSubmission: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/oral-submissions/${id}`, { method: 'DELETE' }),

  // Presentation Submissions
  getPresentationSubmissions: () => fetchJson<PresentationSubmission[]>('/api/presentation-submissions'),
  submitPresentation: (data: Partial<PresentationSubmission>) =>
    fetchJson<PresentationSubmission>('/api/presentation-submissions', { method: 'POST', body: JSON.stringify(data) }),
  reviewPresentation: (id: string, data: { score: number; feedback: string; rubric_scores?: Record<string, number> }) =>
    fetchJson<PresentationSubmission>(`/api/presentation-submissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updatePresentationSubmission: (id: string, updates: { score?: number; feedback?: string; status?: string }) =>
    fetchJson<PresentationSubmission>(`/api/presentation-submissions/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deletePresentationSubmission: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/presentation-submissions/${id}`, { method: 'DELETE' }),

  // Task Submissions (PJDM / AOL)
  getSubmissions: () => fetchJson<Submission[]>('/api/submissions'),
  submitTask: (data: Partial<Submission>) =>
    fetchJson<Submission>('/api/submissions', { method: 'POST', body: JSON.stringify(data) }),
  reviewTask: (id: string, data: { score: number; feedback: string }) =>
    fetchJson<Submission>(`/api/submissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateSubmission: (id: string, updates: { score?: number; feedback?: string; status?: string }) =>
    fetchJson<Submission>(`/api/submissions/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteSubmission: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/submissions/${id}`, { method: 'DELETE' }),

  // LKS Practice Reports (PT ..., Nilai Laba/Rugi, Waktu Pengerjaan Manual PJDM & AOL)
  getLKSReports: (studentId?: string) => {
    const url = studentId ? `/api/lks-reports?student_id=${encodeURIComponent(studentId)}` : '/api/lks-reports';
    return fetchJson<LKSReportSubmission[]>(url);
  },
  createLKSReport: (report: Partial<LKSReportSubmission>) =>
    fetchJson<LKSReportSubmission>('/api/lks-reports', {
      method: 'POST',
      body: JSON.stringify(report)
    }),
  updateLKSReport: (id: string, updates: Partial<LKSReportSubmission>) =>
    fetchJson<LKSReportSubmission>(`/api/lks-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  reviewLKSReport: (id: string, data: { teacher_score: number; teacher_feedback: string; status?: 'reviewed' | 'needs_revision' }) =>
    fetchJson<LKSReportSubmission>(`/api/lks-reports/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteLKSReport: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/lks-reports/${id}`, {
      method: 'DELETE'
    }),

  // Progress & Audit & Settings
  getProgress: () => fetchJson<StudentProgress[]>('/api/progress'),
  getStudentProgresses: () => fetchJson<StudentProgress[]>('/api/progress'),
  getStudentProgress: (student_id: string) => fetchJson<StudentProgress>(`/api/progress/${student_id}`),
  getAuditLogs: () => fetchJson<AuditLog[]>('/api/audit-logs'),
  getSettings: () => fetchJson<AppSettings>('/api/settings'),
  updateSettings: (settings: Partial<AppSettings>) =>
    fetchJson<AppSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  syncGoogleSheets: (spreadsheet_id?: string) =>
    fetchJson<{ success: boolean; message: string; syncedRows: any }>('/api/sheets/sync', {
      method: 'POST',
      body: JSON.stringify({ spreadsheet_id })
    }),

  // AI Gemini Features
  generateAIQuestions: (payload: {
    topic_name: string;
    topic_id?: string;
    difficulty?: string;
    count?: number;
    custom_instructions?: string;
    bilingual?: boolean;
  }) =>
    fetchJson<{ questions: Question[]; isMock: boolean }>('/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  generateBulkAIQuestions: (payload?: { count?: number; difficulty?: string }) =>
    fetchJson<{ questions: Question[]; isMock: boolean }>('/api/ai/generate-bulk-questions', {
      method: 'POST',
      body: JSON.stringify(payload || { count: 40, difficulty: 'MIDDLE_AND_HOTS' })
    }),

  generateInterviewQuestions: (payload: {
    topic_name: string;
    topic_id?: string;
    description?: string;
    case_study?: string;
  }) =>
    fetchJson<{ interview_questions: PresentationInterviewQuestions; isMock: boolean }>(
      '/api/ai/generate-interview-questions',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),

  evaluateAIOral: (payload: { question_text: string; student_transcript: string; topic_name?: string }) =>
    fetchJson<{ eval: AIEvalDetail; isMock: boolean }>('/api/ai/evaluate-oral', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getClassAIAnalytics: () =>
    fetchJson<{
      analysis: {
        summary: string;
        early_warnings: string[];
        difficult_topics: string[];
        teacher_recommendations: string[];
      };
      isMock: boolean;
    }>('/api/ai/class-analytics', { method: 'POST' }),

  sendSocraticMessage: (payload: { user_message: string; topic_name?: string; history?: any[] }) =>
    fetchJson<{ reply: string }>('/api/ai/socratic-tutor', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // In-App Notifications
  getNotifications: (studentId?: string) => {
    const url = studentId ? `/api/notifications?student_id=${encodeURIComponent(studentId)}` : '/api/notifications';
    return fetchJson<AppNotification[]>(url);
  },
  createNotification: (notif: Partial<AppNotification>) =>
    fetchJson<AppNotification>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notif)
    }),
  markNotificationAsRead: (id: string) =>
    fetchJson<AppNotification>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    }),
  markAllNotificationsAsRead: (studentId?: string) =>
    fetchJson<{ success: boolean; message: string }>('/api/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId })
    }),
  deleteNotification: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/notifications/${id}`, {
      method: 'DELETE'
    })
};

