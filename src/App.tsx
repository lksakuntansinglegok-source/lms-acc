import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { QuizRunner } from './components/QuizRunner';
import { OralInterview } from './components/OralInterview';
import { PresentationModule } from './components/PresentationModule';
import { TaskSubmissionModal } from './components/TaskSubmissionModal';
import { SocraticTutorModal } from './components/SocraticTutorModal';
import { StudentProgressView } from './components/StudentProgressView';

import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentManagement } from './components/StudentManagement';
import { StudentComparison } from './components/StudentComparison';
import { LearningPathEditor } from './components/LearningPathEditor';
import { CurriculumManager } from './components/CurriculumManager';
import { QuestionBankManager } from './components/QuestionBankManager';
import { SubmissionsReview } from './components/SubmissionsReview';
import { TeacherAnalytics } from './components/TeacherAnalytics';
import { GoogleSheetsSettings } from './components/GoogleSheetsSettings';

import { Sidebar } from './components/Sidebar';

import {
  Student,
  Teacher,
  Topic,
  Task,
  Question,
  Submission,
  QuizResult,
  OralSubmission,
  PresentationSubmission,
  StudentProgress,
  Material,
  OralQuestion,
  AppNotification
} from './types';
import { api } from './services/api';
import {
  LayoutDashboard,
  Users,
  BarChart2,
  BookOpen,
  HelpCircle,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Mic,
  Video,
  Brain,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Menu
} from 'lucide-react';

export function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lms_authenticated') === 'true';
  });
  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    return localStorage.getItem('lms_user_email') || '';
  });
  const [authenticatedRole, setAuthenticatedRole] = useState<'student' | 'teacher'>(() => {
    return (localStorage.getItem('lms_role') as 'student' | 'teacher') || 'teacher';
  });

  // Current Active User & Role State
  const [currentUserRole, setCurrentUserRole] = useState<'student' | 'teacher'>(() => {
    return (localStorage.getItem('lms_role') as 'student' | 'teacher') || 'teacher';
  });
  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    return localStorage.getItem('lms_student_id') || 'std_01';
  });

  // Mobile Sidebar Drawer Toggle State
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState<boolean>(false);

  // Safety Effect: Ensure student cannot be stuck in teacher role
  useEffect(() => {
    if (authenticatedRole === 'student' && currentUserRole !== 'student') {
      setCurrentUserRole('student');
    }
  }, [authenticatedRole, currentUserRole]);

  // Navigation View State
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [oralQuestions, setOralQuestions] = useState<OralQuestion[]>([]);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [oralSubmissions, setOralSubmissions] = useState<OralSubmission[]>([]);
  const [presentationSubmissions, setPresentationSubmissions] = useState<PresentationSubmission[]>([]);
  const [progressList, setProgressList] = useState<StudentProgress[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modal Popups State
  const [activeTaskForModal, setActiveTaskForModal] = useState<Task | null>(null);
  const [activeTaskForQuiz, setActiveTaskForQuiz] = useState<Task | null>(null);
  const [isSocraticModalOpen, setIsSocraticModalOpen] = useState<boolean>(false);

  // Load all initial data from server
  const loadAllData = async () => {
    try {
      const [
        stData,
        tcData,
        tpData,
        tkData,
        qData,
        mData,
        oqData,
        subData,
        qzData,
        orData,
        prData,
        progData,
        logData,
        notifData
      ] = await Promise.all([
        api.getStudents(),
        api.getTeacher(),
        api.getTopics(),
        api.getTasks(),
        api.getQuestions(),
        api.getMaterials(),
        api.getOralQuestions(),
        api.getSubmissions(),
        api.getQuizResults(),
        api.getOralSubmissions(),
        api.getPresentationSubmissions(),
        api.getStudentProgresses(),
        api.getAuditLogs(),
        api.getNotifications()
      ]);

      setStudents(stData);
      setTeacher(tcData);
      setTopics(tpData);
      setTasks(tkData);
      setQuestions(qData);
      setMaterials(mData);
      setOralQuestions(oqData);

      setSubmissions(subData);
      setQuizResults(qzData);
      setOralSubmissions(orData);
      setPresentationSubmissions(prData);
      setProgressList(progData);
      setAuditLogs(logData);
      setNotifications(notifData || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleMarkNotificationAsRead = async (notifId: string) => {
    try {
      setNotifications(prev => prev.map(n => (n.id === notifId ? { ...n, read: true } : n)));
      await api.markNotificationAsRead(notifId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      const filterId = currentUserRole === 'student' ? currentStudentId : undefined;
      await api.markAllNotificationsAsRead(filterId);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      await api.deleteNotification(notifId);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (notif.type === 'new_task') {
      if (notif.target_id) {
        const foundTask = tasks.find(t => t.task_id === notif.target_id);
        if (foundTask) {
          handleStartTask(foundTask);
          return;
        }
      }
      setActiveView('questions');
    } else if (notif.type === 'task_feedback') {
      if (currentUserRole === 'student') {
        if (notif.target_id) {
          const foundTask = tasks.find(t => t.task_id === notif.target_id);
          if (foundTask) {
            handleStartTask(foundTask);
            return;
          }
        }
        setActiveView('student_progress');
      } else {
        setActiveView('reviews');
      }
    } else if (notif.type === 'oral_feedback') {
      if (currentUserRole === 'student') {
        setActiveView('oral_interview');
      } else {
        setActiveView('reviews');
      }
    } else if (notif.type === 'presentation_feedback') {
      if (currentUserRole === 'student') {
        setActiveView('presentation_module');
      } else {
        setActiveView('reviews');
      }
    } else {
      setActiveView('dashboard');
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const currentStudentObj = students.find(s => s.student_id === currentStudentId) || students[0];
  const currentStudentProgress = progressList.find(p => p.student_id === currentStudentId) || {
    student_id: currentStudentId,
    overall_progress: 85,
    pjdm_progress: 90,
    aol_progress: 80,
    theory_progress: 88,
    presentation_progress: 82,
    oral_progress: 85,
    strengths: ['Jurnal Umum', 'Buku Besar'],
    weaknesses: ['Penyesuaian Beban'],
    recommendations: ['Latihan soal HOTS penyesuaian']
  };

  // Launch a task when student clicks "Mulai Tugas" in StudentDashboard
  const handleStartTask = (task: Task) => {
    if (task.task_type === 'Teori') {
      setActiveTaskForQuiz(task);
      setActiveView('quiz_runner');
    } else if (task.task_type === 'Oral') {
      setActiveView('oral_interview');
    } else if (task.task_type === 'Presentasi') {
      setActiveView('presentation_module');
    } else {
      // PJDM or AOL Task
      setActiveTaskForModal(task);
    }
  };

  // Handle successful login from LoginPage
  const handleLoginSuccess = (role: 'student' | 'teacher', studentId?: string, userEmail?: string) => {
    setAuthenticatedRole(role);
    setCurrentUserRole(role);
    if (studentId) {
      setCurrentStudentId(studentId);
      localStorage.setItem('lms_student_id', studentId);
    }
    const finalEmail = userEmail || (role === 'teacher' ? 'lksakuntansinglegok@gmail.com' : 'andi.saputra@student.smk.id');
    setLoggedInEmail(finalEmail);
    setIsAuthenticated(true);

    localStorage.setItem('lms_authenticated', 'true');
    localStorage.setItem('lms_role', role);
    localStorage.setItem('lms_user_email', finalEmail);
    setActiveView('dashboard');
  };

  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    // SECURITY GUARD: If authenticated user is a student, forbid switching to teacher role!
    if (authenticatedRole === 'student' && newRole === 'teacher') {
      console.warn('Akses ditolak: Akun Siswa tidak diizinkan mengakses tampilan Guru.');
      return;
    }
    setCurrentUserRole(newRole);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lms_authenticated');
    localStorage.removeItem('lms_user_email');
    localStorage.removeItem('lms_role');
    localStorage.removeItem('lms_student_id');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOralCount = oralSubmissions.filter(
    o => o.student_id === currentStudentId && o.submitted_at && o.submitted_at.startsWith(todayStr)
  ).length;

  const pendingTasksCount = tasks.filter(t => {
    const isDone =
      submissions.some(s => s.student_id === currentStudentId && s.task_id === t.task_id && (s.status === 'sudah_dinilai' || s.status === 'sudah_dikumpulkan')) ||
      quizResults.some(q => q.student_id === currentStudentId && q.topic_id === t.topic_id && !q.remedial_required) ||
      oralSubmissions.some(o => o.student_id === currentStudentId && o.topic_id === t.topic_id) ||
      presentationSubmissions.some(p => p.student_id === currentStudentId && p.topic_id === t.topic_id);
    return !isDone;
  }).length;

  if (!isAuthenticated) {
    return <LoginPage students={students} onLoginSuccess={handleLoginSuccess} onRefreshStudents={loadAllData} />;
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased flex flex-col md:flex-row select-none">
      {/* SIDEBAR NAVIGATION (Samping Kiri) */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUserRole={currentUserRole}
        authenticatedRole={authenticatedRole}
        students={students}
        selectedStudentId={currentStudentId}
        loggedInEmail={loggedInEmail}
        onRoleChange={handleRoleChange}
        onStudentChange={id => {
          if (authenticatedRole === 'teacher') {
            setCurrentStudentId(id);
          }
        }}
        onSyncSheets={() => {
          if (authenticatedRole === 'teacher') {
            setActiveView('sheets_settings');
          }
        }}
        onLogout={handleLogout}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
        pendingTasksCount={pendingTasksCount}
        todayOralCount={todayOralCount}
      />

      {/* RIGHT MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* MOBILE TOP NAVIGATION BAR */}
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setIsOpenMobileSidebar(true)}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            <span>Menu Navigasi</span>
          </button>

          <span className="text-xs font-bold text-white truncate max-w-[150px]">
            {activeView === 'dashboard'
              ? 'Dashboard'
              : activeView === 'questions'
              ? 'Bank Soal'
              : activeView === 'oral_interview'
              ? 'AI Oral'
              : activeView}
          </span>
        </div>

        {/* TOP HEADER */}
        <Header
          students={students}
          currentRole={currentUserRole}
          authenticatedRole={authenticatedRole}
          selectedStudentId={currentStudentId}
          loggedInEmail={loggedInEmail}
          onRoleChange={handleRoleChange}
          onStudentChange={id => {
            if (authenticatedRole === 'teacher') {
              setCurrentStudentId(id);
            }
          }}
          onSyncSheets={() => {
            if (authenticatedRole === 'teacher') {
              setActiveView('sheets_settings');
            }
          }}
          onLogout={handleLogout}
          notifications={
            currentUserRole === 'student'
              ? notifications.filter(n => n.student_id === 'all' || n.student_id === currentStudentId)
              : notifications
          }
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onDeleteNotification={handleDeleteNotification}
          onNotificationClick={handleNotificationClick}
        />

        {/* MAIN PAGE / CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 w-full scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

        {/* STUDENT VIEWS */}
        {currentUserRole === 'student' && currentStudentObj && (
          <>
            {activeView === 'dashboard' && (
              <StudentDashboard
                student={currentStudentObj}
                progress={currentStudentProgress}
                tasks={tasks}
                submissions={submissions.filter(s => s.student_id === currentStudentId)}
                quizResults={quizResults.filter(q => q.student_id === currentStudentId)}
                oralSubmissions={oralSubmissions.filter(o => o.student_id === currentStudentId)}
                presentationSubmissions={presentationSubmissions.filter(p => p.student_id === currentStudentId)}
                topics={topics}
                notifications={notifications.filter(n => n.student_id === 'all' || n.student_id === currentStudentId)}
                onMarkNotificationAsRead={handleMarkNotificationAsRead}
                onNotificationClick={handleNotificationClick}
                onStartTask={handleStartTask}
                onOpenSocraticTutor={() => setIsSocraticModalOpen(true)}
                onOpenReflectionJournal={() => setActiveView('student_progress')}
                onNavigateView={(v) => setActiveView(v as any)}
              />
            )}

            {activeView === 'quiz_runner' && (
              <QuizRunner
                topic={topics.find(t => t.topic_id === activeTaskForQuiz?.topic_id) || topics[0]}
                questions={questions.filter(
                  q => q.topic_id === (activeTaskForQuiz?.topic_id || 'top_01')
                )}
                studentId={currentStudentId}
                onFinishQuiz={() => loadAllData()}
                onBack={() => setActiveView('dashboard')}
              />
            )}

            {activeView === 'oral_interview' && (
              <OralInterview
                studentId={currentStudentId}
                topics={topics}
                oralQuestions={oralQuestions}
                studentOralSubmissions={oralSubmissions.filter(o => o.student_id === currentStudentId)}
                onSubmitted={() => loadAllData()}
                onBack={() => setActiveView('dashboard')}
              />
            )}

            {activeView === 'presentation_module' && (
              <PresentationModule
                studentId={currentStudentId}
                topics={topics}
                materials={materials}
                existingSubmissions={presentationSubmissions.filter(p => p.student_id === currentStudentId)}
                onSubmitted={() => loadAllData()}
                onBack={() => setActiveView('dashboard')}
              />
            )}

            {activeView === 'student_progress' && (
              <StudentProgressView
                student={currentStudentObj}
                progress={currentStudentProgress}
                submissions={submissions.filter(s => s.student_id === currentStudentId)}
                oralSubmissions={oralSubmissions.filter(o => o.student_id === currentStudentId)}
                presentationSubmissions={presentationSubmissions.filter(p => p.student_id === currentStudentId)}
              />
            )}
          </>
        )}

        {/* SHARED VIEW: BANK SOAL & PRAKTIK */}
        {activeView === 'questions' && (
          <QuestionBankManager
            questions={questions}
            topics={topics}
            tasks={tasks}
            currentUserRole={currentUserRole}
            onRefreshData={loadAllData}
            onStartTask={handleStartTask}
            onNavigateView={(view) => setActiveView(view as any)}
          />
        )}

        {/* TEACHER VIEWS */}
        {currentUserRole === 'teacher' && (
          <>
            {activeView === 'dashboard' && (
              <TeacherDashboard
                students={students}
                progressList={progressList}
                quizResults={quizResults}
                tasks={tasks}
                submissions={submissions}
                oralSubmissions={oralSubmissions}
                presentationSubmissions={presentationSubmissions}
                onNavigateToStudents={() => setActiveView('students')}
                onNavigateToReviews={() => setActiveView('reviews')}
              />
            )}

            {activeView === 'students' && (
              <StudentManagement
                students={students}
                progressList={progressList}
                quizResults={quizResults}
                tasks={tasks}
                topics={topics}
                submissions={submissions}
                oralSubmissions={oralSubmissions}
                presentationSubmissions={presentationSubmissions}
                onRefreshData={loadAllData}
              />
            )}

            {activeView === 'comparison' && (
              <StudentComparison students={students} progressList={progressList} />
            )}

            {activeView === 'curriculum' && (
              <CurriculumManager
                questions={questions}
                topics={topics}
                tasks={tasks}
                onRefreshData={loadAllData}
              />
            )}

            {activeView === 'reviews' && (
              <SubmissionsReview
                students={students}
                submissions={submissions}
                oralSubmissions={oralSubmissions}
                presentationSubmissions={presentationSubmissions}
                onRefreshData={loadAllData}
              />
            )}

            {activeView === 'sheets_settings' && (
              <GoogleSheetsSettings auditLogs={auditLogs} onRefreshData={loadAllData} />
            )}
          </>
        )}
      </main>

      {/* TASK SUBMISSION MODAL (PJDM / AOL) */}
      {activeTaskForModal && (
        <TaskSubmissionModal
          task={activeTaskForModal}
          studentId={currentStudentId}
          existingSub={submissions.find(
            s => s.student_id === currentStudentId && s.task_id === activeTaskForModal.task_id
          )}
          onClose={() => setActiveTaskForModal(null)}
          onSubmitted={() => loadAllData()}
        />
      )}

      {/* SOCRATIC AI TUTOR MODAL */}
      {isSocraticModalOpen && (
        <SocraticTutorModal onClose={() => setIsSocraticModalOpen(false)} />
      )}
    </div>
  </div>
);
}

export default App;
