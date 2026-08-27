import React, { useState, useEffect } from 'react';
import {
  CurriculumMeeting,
  Question,
  Topic,
  PracticalExercise,
  PresentationTopicItem,
  Task
} from '../types';
import { INITIAL_CURRICULUM_MEETINGS } from '../data/initialCurriculum';
import { PRESENTATION_TOPICS_60 } from '../data/presentationTopicsData';
import { DEFAULT_PRACTICAL_EXERCISES } from '../data/practicalExercisesData';
import { api } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Video,
  Mic,
  Search,
  Filter,
  Layers,
  Sparkles,
  Printer,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Award,
  Send,
  Sliders,
  CheckSquare,
  Square,
  FileText
} from 'lucide-react';

interface CurriculumManagerProps {
  questions: Question[];
  topics: Topic[];
  tasks?: Task[];
  onRefreshData?: () => void;
}

export const CurriculumManager: React.FC<CurriculumManagerProps> = ({
  questions = [],
  topics = [],
  tasks = [],
  onRefreshData
}) => {
  // State for curriculum meetings (persisted in localStorage)
  const [meetings, setMeetings] = useState<CurriculumMeeting[]>(() => {
    try {
      const saved = localStorage.getItem('lms_curriculum_meetings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse curriculum meetings', e);
    }
    return INITIAL_CURRICULUM_MEETINGS;
  });

  // Practical catalog loaded directly from Bank Soal's 'lms_practical_list'
  const [practicals, setPracticals] = useState<PracticalExercise[]>(() => {
    try {
      const saved = localStorage.getItem('lms_practical_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PRACTICAL_EXERCISES;
  });

  // Presentation topics catalog loaded directly from Bank Soal's 'lms_presentation_topics'
  const [presentationTopics, setPresentationTopics] = useState<PresentationTopicItem[]>(() => {
    try {
      const saved = localStorage.getItem('lms_presentation_topics');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PRESENTATION_TOPICS_60;
  });

  // Synchronize state when question bank data changes in real-time
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedPracticals = localStorage.getItem('lms_practical_list');
        if (savedPracticals) setPracticals(JSON.parse(savedPracticals));
        const savedPres = localStorage.getItem('lms_presentation_topics');
        if (savedPres) setPresentationTopics(JSON.parse(savedPres));
      } catch (e) {
        console.error('Error syncing curriculum with question bank data', e);
      }
    };

    window.addEventListener('lms_data_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('lms_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Save to storage
  const saveMeetings = (updated: CurriculumMeeting[]) => {
    setMeetings(updated);
    try {
      localStorage.setItem('lms_curriculum_meetings', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save curriculum meetings', e);
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'terjadwal' | 'selesai' | 'draft'>('all');
  const [expandedMeetingIds, setExpandedMeetingIds] = useState<Record<string, boolean>>({
    meet_01: true,
    meet_02: true,
    meet_03: true
  });

  // Modal State for Add/Edit Meeting
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  
  // Form State
  const [formPertemuanKe, setFormPertemuanKe] = useState<number>(1);
  const [formJudul, setFormJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTopicId, setFormTopicId] = useState(topics[0]?.topic_id || 'top_01');
  const [formDurasi, setFormDurasi] = useState<number>(120);
  const [formTanggal, setFormTanggal] = useState('');
  const [formStatus, setFormStatus] = useState<'aktif' | 'terjadwal' | 'selesai' | 'draft'>('terjadwal');
  const [formCatatan, setFormCatatan] = useState('');
  const [formKompetensiText, setFormKompetensiText] = useState('');

  // Selected question IDs for the meeting
  const [formSelectedQuestionIds, setFormSelectedQuestionIds] = useState<string[]>([]);
  // Selected practical IDs
  const [formSelectedPracticalIds, setFormSelectedPracticalIds] = useState<string[]>([]);
  // Selected presentation topic IDs (from 60 topics)
  const [formSelectedPresTopicIds, setFormSelectedPresTopicIds] = useState<string[]>([]);

  // Expanded topic accordions inside modal
  const [expandedQuestionTopicIds, setExpandedQuestionTopicIds] = useState<Record<string, boolean>>({});
  const [expandedPresTopicIds, setExpandedPresTopicIds] = useState<Record<string, boolean>>({});

  // Modal in-selection filters
  const [modalQuestionSearch, setModalQuestionSearch] = useState('');
  const [modalQuestionDiffFilter, setModalQuestionDiffFilter] = useState<'all' | 'LOTS' | 'MIDDLE' | 'HOTS'>('all');
  const [modalQuestionDeliveredFilter, setModalQuestionDeliveredFilter] = useState<'all' | 'delivered' | 'not_delivered'>('all');
  const [modalPracticalTypeFilter, setModalPracticalTypeFilter] = useState<'all' | 'PJDM' | 'AOL'>('all');
  const [modalPresSearch, setModalPresSearch] = useState('');
  const [modalPresDiffFilter, setModalPresDiffFilter] = useState<'all' | 'MIDDLE' | 'HOTS'>('all');

  // Helper to determine which meetings a question has been assigned/delivered in
  const getQuestionDeliveredMeetings = (questionId: string, excludeMeetingId?: string | null): number[] => {
    return meetings
      .filter(m => (!excludeMeetingId || m.meeting_id !== excludeMeetingId) && m.selected_question_ids?.includes(questionId))
      .map(m => m.pertemuan_ke)
      .sort((a, b) => a - b);
  };

  // Modals for deleting & reset
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedMeetingIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    meetings.forEach(m => { all[m.meeting_id] = true; });
    setExpandedMeetingIds(all);
  };

  const collapseAll = () => {
    setExpandedMeetingIds({});
  };

  // Toggle expanded topic for questions inside modal
  const toggleQuestionTopicExpand = (topicId: string) => {
    setExpandedQuestionTopicIds(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const expandAllQuestionTopics = () => {
    const all: Record<string, boolean> = {};
    topics.forEach(t => { all[t.topic_id] = true; });
    setExpandedQuestionTopicIds(all);
  };

  const collapseAllQuestionTopics = () => {
    setExpandedQuestionTopicIds({});
  };

  // Toggle expanded topic for presentations inside modal
  const togglePresTopicExpand = (topicId: string) => {
    setExpandedPresTopicIds(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  // Handle single question toggle (max 25 limit)
  const handleToggleQuestion = (qId: string) => {
    if (formSelectedQuestionIds.includes(qId)) {
      setFormSelectedQuestionIds(prev => prev.filter(id => id !== qId));
    } else {
      if (formSelectedQuestionIds.length >= 25) {
        showToast('⚠️ Maksimal 25 butir soal per pertemuan telah tercapai! Hapus beberapa soal jika ingin memilih soal lain.');
        return;
      }
      setFormSelectedQuestionIds(prev => [...prev, qId]);
    }
  };

  // Add questions from a topic with max 25 quota check
  const handleAddTopicQuestions = (topicId: string, count?: number) => {
    const topicQIds = questions
      .filter(q => q.topic_id === topicId)
      .map(q => q.question_id);
    
    const unselected = topicQIds.filter(id => !formSelectedQuestionIds.includes(id));
    if (unselected.length === 0) {
      showToast('Semua soal dalam topik ini sudah terpilih.');
      return;
    }

    const availableSlots = 25 - formSelectedQuestionIds.length;
    if (availableSlots <= 0) {
      showToast('⚠️ Kuota maksimal 25 soal per pertemuan sudah penuh!');
      return;
    }

    const toTake = count ? Math.min(count, availableSlots, unselected.length) : Math.min(availableSlots, unselected.length);
    const sliceToAdd = unselected.slice(0, toTake);

    setFormSelectedQuestionIds(prev => [...prev, ...sliceToAdd]);
    showToast(`+${sliceToAdd.length} soal dari topik ditambahkan (${formSelectedQuestionIds.length + sliceToAdd.length}/25 Soal)`);
  };

  // Clear questions belonging to a topic
  const handleClearTopicQuestions = (topicId: string) => {
    const topicQIds = new Set(questions.filter(q => q.topic_id === topicId).map(q => q.question_id));
    setFormSelectedQuestionIds(prev => prev.filter(id => !topicQIds.has(id)));
  };

  // Presentation topics toggle per topic
  const handleTogglePresTopic = (presId: string) => {
    setFormSelectedPresTopicIds(prev =>
      prev.includes(presId) ? prev.filter(id => id !== presId) : [...prev, presId]
    );
  };

  const handleToggleAllPresForTopic = (topicId: string) => {
    const topicPresIds = presentationTopics
      .filter(pt => pt.topic_id === topicId)
      .map(pt => pt.id);
    
    if (topicPresIds.length === 0) return;
    const allSelected = topicPresIds.every(id => formSelectedPresTopicIds.includes(id));
    if (allSelected) {
      setFormSelectedPresTopicIds(prev => prev.filter(id => !topicPresIds.includes(id)));
    } else {
      setFormSelectedPresTopicIds(prev => Array.from(new Set([...prev, ...topicPresIds])));
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingMeetingId(null);
    setFormPertemuanKe(meetings.length + 1);
    setFormJudul(`Pertemuan ${meetings.length + 1}: `);
    setFormDeskripsi('');
    setFormTopicId(topics[0]?.topic_id || 'top_01');
    setFormDurasi(120);
    setFormTanggal(new Date().toISOString().slice(0, 10));
    setFormStatus('terjadwal');
    setFormCatatan('');
    setFormKompetensiText('Siklus Akuntansi, Analisis Jurnal, Kerapian Laporan');
    setFormSelectedQuestionIds([]);
    setFormSelectedPracticalIds([]);
    setFormSelectedPresTopicIds([]);
    
    // Auto-expand first 3 topics by default
    const initialExpanded: Record<string, boolean> = {};
    if (topics[0]) initialExpanded[topics[0].topic_id] = true;
    if (topics[1]) initialExpanded[topics[1].topic_id] = true;
    if (topics[2]) initialExpanded[topics[2].topic_id] = true;
    setExpandedQuestionTopicIds(initialExpanded);
    setExpandedPresTopicIds(initialExpanded);

    setModalQuestionSearch('');
    setModalQuestionDiffFilter('all');
    setModalQuestionDeliveredFilter('all');
    setModalPresSearch('');
    setModalPresDiffFilter('all');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (m: CurriculumMeeting) => {
    setEditingMeetingId(m.meeting_id);
    setFormPertemuanKe(m.pertemuan_ke);
    setFormJudul(m.judul_pertemuan);
    setFormDeskripsi(m.deskripsi);
    setFormTopicId(m.topic_id);
    setFormDurasi(m.target_durasi_menit || 120);
    setFormTanggal(m.tanggal_pelaksanaan || '');
    setFormStatus(m.status);
    setFormCatatan(m.catatan_instruktur || '');
    setFormKompetensiText((m.target_kompetensi || []).join(', '));
    const selectedQ = m.selected_question_ids || [];
    const selectedP = m.selected_practical_ids || [];
    const selectedPres = m.selected_presentation_topic_ids || [];
    setFormSelectedQuestionIds(selectedQ);
    setFormSelectedPracticalIds(selectedP);
    setFormSelectedPresTopicIds(selectedPres);

    // Expand topics that contain selected items
    const initialExpandedQ: Record<string, boolean> = {};
    selectedQ.forEach(qid => {
      const q = questions.find(item => item.question_id === qid);
      if (q) initialExpandedQ[q.topic_id] = true;
    });
    if (Object.keys(initialExpandedQ).length === 0 && topics[0]) {
      initialExpandedQ[topics[0].topic_id] = true;
    }
    setExpandedQuestionTopicIds(initialExpandedQ);

    const initialExpandedPres: Record<string, boolean> = {};
    selectedPres.forEach(pid => {
      const pt = presentationTopics.find(item => item.id === pid);
      if (pt) initialExpandedPres[pt.topic_id] = true;
    });
    if (Object.keys(initialExpandedPres).length === 0 && topics[0]) {
      initialExpandedPres[topics[0].topic_id] = true;
    }
    setExpandedPresTopicIds(initialExpandedPres);

    setModalQuestionSearch('');
    setModalQuestionDiffFilter('all');
    setModalQuestionDeliveredFilter('all');
    setModalPresSearch('');
    setModalPresDiffFilter('all');
    setIsModalOpen(true);
  };

  // Save Meeting
  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim()) return;

    const kompArr = formKompetensiText
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    // Determine primary topic from selected questions or practicals or default
    let primaryTopicId = formTopicId;
    if (formSelectedQuestionIds.length > 0) {
      const firstQ = questions.find(q => q.question_id === formSelectedQuestionIds[0]);
      if (firstQ) primaryTopicId = firstQ.topic_id;
    } else if (formSelectedPracticalIds.length > 0) {
      const firstP = practicals.find(p => p.id === formSelectedPracticalIds[0]);
      if (firstP?.topic_id) primaryTopicId = firstP.topic_id;
    } else if (formSelectedPresTopicIds.length > 0) {
      const firstPres = presentationTopics.find(pt => pt.id === formSelectedPresTopicIds[0]);
      if (firstPres?.topic_id) primaryTopicId = firstPres.topic_id;
    }

    if (editingMeetingId) {
      // Update
      const updated = meetings.map(m => {
        if (m.meeting_id !== editingMeetingId) return m;
        return {
          ...m,
          pertemuan_ke: Number(formPertemuanKe),
          judul_pertemuan: formJudul.trim(),
          deskripsi: formDeskripsi.trim() || 'Rencana materi pembelajaran akuntansi.',
          topic_id: primaryTopicId || m.topic_id,
          target_durasi_menit: Number(formDurasi) || 120,
          tanggal_pelaksanaan: formTanggal || undefined,
          status: formStatus,
          catatan_instruktur: formCatatan.trim() || undefined,
          target_kompetensi: kompArr,
          selected_question_ids: formSelectedQuestionIds.slice(0, 25), // Ensure strictly max 25
          selected_practical_ids: formSelectedPracticalIds,
          selected_presentation_topic_ids: formSelectedPresTopicIds,
          is_published: formStatus !== 'draft'
        };
      });
      // Sort by pertemuan_ke
      updated.sort((a, b) => a.pertemuan_ke - b.pertemuan_ke);
      saveMeetings(updated);
      showToast(`Pertemuan ${formPertemuanKe} berhasil diperbarui!`);
    } else {
      // Create new
      const newId = `meet_${Date.now()}`;
      const newMeeting: CurriculumMeeting = {
        meeting_id: newId,
        pertemuan_ke: Number(formPertemuanKe),
        judul_pertemuan: formJudul.trim(),
        deskripsi: formDeskripsi.trim() || 'Rencana materi pembelajaran akuntansi.',
        topic_id: primaryTopicId || topics[0]?.topic_id || 'top_01',
        target_durasi_menit: Number(formDurasi) || 120,
        tanggal_pelaksanaan: formTanggal || undefined,
        status: formStatus,
        catatan_instruktur: formCatatan.trim() || undefined,
        target_kompetensi: kompArr,
        selected_question_ids: formSelectedQuestionIds.slice(0, 25), // Ensure strictly max 25
        selected_practical_ids: formSelectedPracticalIds,
        selected_presentation_topic_ids: formSelectedPresTopicIds,
        is_published: formStatus !== 'draft'
      };
      const updated = [...meetings, newMeeting].sort((a, b) => a.pertemuan_ke - b.pertemuan_ke);
      saveMeetings(updated);
      showToast(`Pertemuan ${formPertemuanKe} baru berhasil ditambahkan ke kurikulum!`);
    }

    setIsModalOpen(false);
  };

  // Reorder meetings
  const handleMoveMeeting = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= meetings.length) return;

    const copy = [...meetings];
    const current = copy[index];
    const target = copy[targetIdx];

    // Swap pertemuan_ke numbers
    const tempNum = current.pertemuan_ke;
    current.pertemuan_ke = target.pertemuan_ke;
    target.pertemuan_ke = tempNum;

    // Swap positions
    copy[index] = target;
    copy[targetIdx] = current;

    copy.sort((a, b) => a.pertemuan_ke - b.pertemuan_ke);
    saveMeetings(copy);
    showToast('Urutan pertemuan kurikulum berhasil diubah.');
  };

  // Quick toggle status
  const handleQuickChangeStatus = (meetingId: string, newStatus: 'aktif' | 'terjadwal' | 'selesai' | 'draft') => {
    const updated = meetings.map(m => (m.meeting_id === meetingId ? { ...m, status: newStatus } : m));
    saveMeetings(updated);
    showToast(`Status pertemuan diubah menjadi "${newStatus.toUpperCase()}".`);
  };

  // Delete meeting
  const handleConfirmDeleteMeeting = () => {
    if (!deletingMeetingId) return;
    const updated = meetings.filter(m => m.meeting_id !== deletingMeetingId);
    saveMeetings(updated);
    setDeletingMeetingId(null);
    showToast('Pertemuan berhasil dihapus dari kurikulum.');
  };

  // Reset to default 12 meetings
  const handleResetToStandard = () => {
    saveMeetings(INITIAL_CURRICULUM_MEETINGS);
    setIsResetConfirmOpen(false);
    showToast('Kurikulum berhasil direset ke 12 Pertemuan Standar LKS Akuntansi!');
  };

  // Clear all meetings to start fresh
  const handleClearAllMeetings = () => {
    saveMeetings([]);
    setIsClearAllConfirmOpen(false);
    showToast('Seluruh kurikulum berhasil dikosongkan. Anda dapat mulai menyusun alur pertemuan dari awal!');
  };

  // Print syllabus
  const handlePrintSyllabus = () => {
    window.print();
  };

  // Filtered list
  const filteredMeetings = meetings.filter(m => {
    const matchesSearch =
      m.judul_pertemuan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.target_kompetensi && m.target_kompetensi.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const totalMeetings = meetings.length;
  const activeCount = meetings.filter(m => m.status === 'aktif').length;
  const scheduledCount = meetings.filter(m => m.status === 'terjadwal').length;
  const finishedCount = meetings.filter(m => m.status === 'selesai').length;
  const totalAssignedQuestions = meetings.reduce((acc, m) => acc + (m.selected_question_ids?.length || 0), 0);
  const totalAssignedPracticals = meetings.reduce((acc, m) => acc + (m.selected_practical_ids?.length || 0), 0);
  const totalAssignedPres = meetings.reduce((acc, m) => acc + (m.selected_presentation_topic_ids?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:text-white ml-2 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/30 text-purple-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Manajemen Kurikulum & Alur Pertemuan LKS
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Tata dan petakan <strong>Bank Soal Teori Bilingual</strong>, modul <strong>Praktik PJDM & AOL</strong>, serta <strong>60 Bahan Presentasi & Wawancara Juri LKS</strong> yang akan dikerjakan siswa pada setiap sesi pertemuan pembinaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintSyllabus}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Cetak Silabus Kurikulum"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Cetak Silabus</span>
            </button>

            <button
              onClick={() => setIsClearAllConfirmOpen(true)}
              className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Kosongkan Semua Data Kurikulum untuk Menata Ulang dari Awal"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Kosongkan Kurikulum (Reset)</span>
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Muat 12 Pertemuan Standar LKS"
            >
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Muat 12 Standar LKS</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Pertemuan Baru
            </button>
          </div>
        </div>

        {/* METRIC BADGES STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sesi</span>
            <span className="text-lg font-black text-white">{totalMeetings} Pertemuan</span>
          </div>

          <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Sedang Aktif</span>
            <span className="text-lg font-black text-emerald-400">{activeCount} Sesi</span>
          </div>

          <div className="p-3 bg-slate-950 border border-blue-500/30 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-blue-400 block">Terjadwal</span>
            <span className="text-lg font-black text-blue-300">{scheduledCount} Sesi</span>
          </div>

          <div className="p-3 bg-slate-950 border border-purple-500/30 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-purple-400 block">Soal Teori</span>
            <span className="text-lg font-black text-purple-300">{totalAssignedQuestions} Butir</span>
          </div>

          <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Praktik PJDM/AOL</span>
            <span className="text-lg font-black text-amber-300">{totalAssignedPracticals} Modul</span>
          </div>

          <div className="p-3 bg-slate-950 border border-rose-500/30 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Topik LKS 60</span>
            <span className="text-lg font-black text-rose-300">{totalAssignedPres} Bahan</span>
          </div>
        </div>

        {/* SEARCH, FILTER & BULK CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari materi pertemuan, topik, atau kompetensi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-purple-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">Semua Status ({meetings.length})</option>
              <option value="aktif">Status: Aktif Saja ({activeCount})</option>
              <option value="terjadwal">Status: Terjadwal ({scheduledCount})</option>
              <option value="selesai">Status: Selesai ({finishedCount})</option>
            </select>
          </div>

          {/* Expand / Collapse All */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
              Buka Semua
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              Lipat Semua
            </button>
          </div>
        </div>
      </div>

      {/* LIST OF CURRICULUM MEETINGS */}
      <div className="space-y-4">
        {meetings.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Kurikulum Masih Kosong (Siap Ditata Ulang)</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Seluruh data pertemuan telah dikosongkan. Anda dapat mulai menambahkan sesi pertemuan baru secara bertahap atau memuat kembali 12 template standar LKS Akuntansi kapan saja.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-2 shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Pertemuan Pertama
              </button>
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-purple-400" />
                Muat 12 Standar LKS
              </button>
            </div>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
            <p className="text-sm font-bold text-slate-300">Tidak ada sesi pertemuan yang cocok dengan pencarian.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          filteredMeetings.map((meeting, index) => {
            const isExpanded = !!expandedMeetingIds[meeting.meeting_id];
            const qCount = meeting.selected_question_ids?.length || 0;
            const pCount = meeting.selected_practical_ids?.length || 0;
            const presCount = meeting.selected_presentation_topic_ids?.length || 0;

            // Resolved Questions
            const assignedQuestions = (meeting.selected_question_ids || [])
              .map(qid => questions.find(q => q.question_id === qid))
              .filter(Boolean) as Question[];

            // Resolved Practicals
            const assignedPracticals = (meeting.selected_practical_ids || [])
              .map(pid => practicals.find(p => p.id === pid))
              .filter(Boolean) as PracticalExercise[];

            // Resolved Presentation Topics (from 60 topics)
            const assignedPresTopics = (meeting.selected_presentation_topic_ids || [])
              .map(pid => presentationTopics.find(pt => pt.id === pid))
              .filter(Boolean) as PresentationTopicItem[];

            return (
              <div
                key={meeting.meeting_id}
                className={`bg-slate-900 border rounded-3xl overflow-hidden transition shadow-sm ${
                  isExpanded ? 'border-purple-500/50 ring-1 ring-purple-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* MEETING HEADER BAR */}
                <div
                  onClick={() => toggleExpand(meeting.meeting_id)}
                  className="p-5 bg-slate-900 hover:bg-slate-850 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition select-none"
                >
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveMeeting(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 transition"
                        title="Geser Naik"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveMeeting(index, 'down')}
                        disabled={index === meetings.length - 1}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 transition"
                        title="Geser Turun"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Expand Arrow Icon */}
                    <div className="p-1.5 rounded-xl bg-slate-800 text-slate-300 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4" />}
                    </div>

                    {/* Number Badge */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-emerald-500/30 border border-purple-500/40 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-inner">
                      #{meeting.pertemuan_ke}
                    </div>

                    {/* Title & Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                          {meeting.judul_pertemuan}
                        </h3>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                            meeting.status === 'aktif'
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 animate-pulse'
                              : meeting.status === 'selesai'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : meeting.status === 'draft'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                              : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          {meeting.status}
                        </span>
                      </div>

                      {/* Subtitle Details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        {meeting.tanggal_pelaksanaan && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {meeting.tanggal_pelaksanaan}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {meeting.target_durasi_menit || 120} Menit
                        </span>
                        <span className="text-purple-400">• {qCount} Soal Teori</span>
                        <span className="text-amber-400">• {pCount} Praktik PJDM/AOL</span>
                        <span className="text-rose-400">• {presCount} Topik Presentasi</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-auto" onClick={e => e.stopPropagation()}>
                    {/* Status Dropdown */}
                    <select
                      value={meeting.status}
                      onChange={e => handleQuickChangeStatus(meeting.meeting_id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="terjadwal">Terjadwal</option>
                      <option value="aktif">Aktifkan Sesi Ini</option>
                      <option value="selesai">Tandai Selesai</option>
                      <option value="draft">Draft</option>
                    </select>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(meeting)}
                      className="p-2 text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition cursor-pointer"
                      title="Edit Pertemuan & Alokasi Bank Soal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeletingMeetingId(meeting.meeting_id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                      title="Hapus Pertemuan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE BODY CONTENT */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-800/80 space-y-5 bg-slate-950/60">
                    {/* DESKRIPSI & KOMPETENSI */}
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {meeting.deskripsi}
                      </p>

                      {meeting.target_kompetensi && meeting.target_kompetensi.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-400 mr-1">Target Kompetensi:</span>
                          {meeting.target_kompetensi.map((k, kIdx) => (
                            <span
                              key={kIdx}
                              className="px-2.5 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              ✓ {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3 MAPPED CATEGORIES GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* 1. BANK SOAL TEORI BILINGUAL */}
                      <div className="p-4 bg-slate-900 border border-purple-500/30 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                            <HelpCircle className="w-4 h-4 text-purple-400" />
                            <span>1. Bank Soal Teori Bilingual ({qCount})</span>
                          </div>
                          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                            {qCount > 0 ? 'Siap Dikerjakan' : 'Belum Dipilih'}
                          </span>
                        </div>

                        {assignedQuestions.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                            {assignedQuestions.map((q, qIdx) => {
                              const otherMeetings = getQuestionDeliveredMeetings(q.question_id, meeting.meeting_id);
                              return (
                                <div key={q.question_id} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1.5">
                                  <div className="flex items-center justify-between flex-wrap gap-1">
                                    <span className="font-mono text-[10px] text-purple-400 font-bold">{q.question_id}</span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {otherMeetings.length > 0 && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5 text-amber-400" />
                                          pernah tersampaikan pada pertemuan ke {otherMeetings.join(', ')}
                                        </span>
                                      )}
                                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                        q.difficulty === 'HOTS' ? 'bg-rose-950 text-rose-300' : 'bg-blue-950 text-blue-300'
                                      }`}>
                                        {q.difficulty}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-slate-300 font-medium line-clamp-2">{q.pertanyaan_id}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">
                            Belum ada butir soal teori yang ditautkan pada pertemuan ini.
                          </p>
                        )}
                      </div>

                      {/* 2. PRAKTIK PJDM & AOL */}
                      <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                            <span>2. Praktik PJDM & AOL ({pCount})</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            Spreadsheet & AOL
                          </span>
                        </div>

                        {assignedPracticals.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                            {assignedPracticals.map(p => (
                              <div key={p.id} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold text-amber-400 uppercase">{p.tipe_praktik}</span>
                                  <span className="text-[10px] text-slate-400">Maks: {p.max_score || 100} Poin</span>
                                </div>
                                <p className="text-slate-200 font-semibold line-clamp-2">{p.judul}</p>
                                {p.link_spreadsheet && (
                                  <a
                                    href={p.link_spreadsheet}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Buka Template Praktik
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">
                            Belum ada modul praktik PJDM/AOL yang ditautkan.
                          </p>
                        )}
                      </div>

                      {/* 3. BAHAN PRESENTASI & WAWANCARA JURI LKS (60) */}
                      <div className="p-4 bg-slate-900 border border-rose-500/30 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                            <Video className="w-4 h-4 text-rose-400" />
                            <span>3. Topik Presentasi LKS ({presCount})</span>
                          </div>
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                            60 Topik
                          </span>
                        </div>

                        {assignedPresTopics.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                            {assignedPresTopics.map(pt => (
                              <div key={pt.id} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-rose-400">{pt.id}</span>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                    pt.tipe_soal === 'HOTS' ? 'bg-rose-950 text-rose-300' : 'bg-blue-950 text-blue-300'
                                  }`}>
                                    {pt.tipe_soal || 'MIDDLE'}
                                  </span>
                                </div>
                                <p className="text-slate-200 font-semibold line-clamp-2">{pt.judul_topik}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                                  {pt.middle_hots_case_study || pt.soal_studi_kasus || pt.deskripsi}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">
                            Belum ada topik presentasi & wawancara yang ditautkan.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CATATAN INSTRUKTUR / GURU */}
                    {meeting.catatan_instruktur && (
                      <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-400 font-bold block mb-0.5">Catatan Instruksional & Arahan Guru:</strong>
                          <p className="text-slate-300 leading-relaxed font-sans">{meeting.catatan_instruktur}</p>
                        </div>
                      </div>
                    )}

                    {/* QUICK ACTION FOOTER */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(meeting)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Alokasi Bank Soal
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Status Sesi:</span>
                        <button
                          onClick={() => handleQuickChangeStatus(meeting.meeting_id, meeting.status === 'aktif' ? 'selesai' : 'aktif')}
                          className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                            meeting.status === 'aktif'
                              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                          }`}
                        >
                          {meeting.status === 'aktif' ? 'Tandai Selesai' : 'Aktifkan untuk Siswa'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CURRICULUM MEETING */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingMeetingId ? `Edit Pertemuan ${formPertemuanKe}` : 'Tambah Pertemuan Kurikulum Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pilih bank soal teori, modul praktik PJDM/AOL, dan topik presentasi LKS 60 yang akan dialokasikan.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-5 text-xs">
              {/* ROW 1: NOMOR PERTEMUAN & JUDUL */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pertemuan Ke-#:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formPertemuanKe}
                    onChange={e => setFormPertemuanKe(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-mono font-bold"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-slate-300 font-bold block mb-1">Judul Sesi Pertemuan:</label>
                  <input
                    type="text"
                    value={formJudul}
                    onChange={e => setFormJudul(e.target.value)}
                    placeholder="Contoh: Pertemuan 1: Siklus Jurnal Umum & Persamaan Akuntansi"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* ROW 2: DESKRIPSI & KOMPETENSI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Deskripsi & Rencana Pembelajaran:</label>
                  <textarea
                    rows={2}
                    value={formDeskripsi}
                    onChange={e => setFormDeskripsi(e.target.value)}
                    placeholder="Jelaskan ringkasan materi dan alur simulasi yang akan dilaksanakan..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Kompetensi (Pisahkan dengan koma):</label>
                  <textarea
                    rows={2}
                    value={formKompetensiText}
                    onChange={e => setFormKompetensiText(e.target.value)}
                    placeholder="Jurnal Penyesuaian, Neraca Lajur 10 Kolom, Rekonsiliasi Bank"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* SELECTION SECTIONS */}
              <div className="pt-2 border-t border-slate-800 space-y-5">
                {/* ======================================================== */}
                {/* 1. ALOKASI SOAL TEORI BILINGUAL (GROUPED BY TOPIC, MAX 25) */}
                {/* ======================================================== */}
                <div className="p-4 bg-slate-950 border border-purple-500/40 rounded-2xl space-y-3.5 shadow-sm">
                  {/* Quota Header & Progress */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-white text-xs">
                            Alokasi Bank Soal Teori Bilingual (Dikelompokkan per Topik)
                          </span>
                          <p className="text-[11px] text-slate-400">
                            Atur kuota soal per topik atau gabungkan beberapa topik (Maksimal 25 butir soal per pertemuan).
                          </p>
                        </div>
                      </div>

                      {/* Quota Badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                          formSelectedQuestionIds.length === 25
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                            : formSelectedQuestionIds.length > 25
                            ? 'bg-rose-950/90 text-rose-300 border-rose-500/60'
                            : 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                        }`}>
                          <span>🎯 Total Soal:</span>
                          <strong className="font-mono text-sm">{formSelectedQuestionIds.length}</strong>
                          <span className="text-[10px] text-slate-400">/ 25 Soal Maksimal</span>
                        </span>

                        {formSelectedQuestionIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormSelectedQuestionIds([])}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            title="Kosongkan Semua Pilihan Soal"
                          >
                            Kosongkan
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          formSelectedQuestionIds.length >= 25
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (formSelectedQuestionIds.length / 25) * 100)}%` }}
                      />
                    </div>

                    {/* Combined Topics Summary Pills */}
                    {formSelectedQuestionIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold">Topik Tergabung:</span>
                        {topics
                          .map(t => {
                            const count = questions.filter(q => q.topic_id === t.topic_id && formSelectedQuestionIds.includes(q.question_id)).length;
                            if (count === 0) return null;
                            return (
                              <span
                                key={t.topic_id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-medium"
                              >
                                <span>{t.nama_topik}:</span>
                                <strong className="font-bold">{count} soal</strong>
                                <button
                                  type="button"
                                  onClick={() => handleClearTopicQuestions(t.topic_id)}
                                  className="hover:text-rose-300 ml-0.5 text-purple-400"
                                  title={`Hapus semua soal ${t.nama_topik}`}
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })
                          .filter(Boolean)}
                      </div>
                    )}
                  </div>

                  {/* Filter Toolbar for Questions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Cari kata kunci soal..."
                        value={modalQuestionSearch}
                        onChange={e => setModalQuestionSearch(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 text-xs w-44 sm:w-56"
                      />
                      <select
                        value={modalQuestionDiffFilter}
                        onChange={e => setModalQuestionDiffFilter(e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 text-xs cursor-pointer"
                      >
                        <option value="all">Semua Level Kesulitan</option>
                        <option value="HOTS">Level HOTS</option>
                        <option value="MIDDLE">Level MIDDLE</option>
                        <option value="LOTS">Level LOTS</option>
                      </select>
                      <select
                        value={modalQuestionDeliveredFilter}
                        onChange={e => setModalQuestionDeliveredFilter(e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 text-xs cursor-pointer"
                      >
                        <option value="all">Semua Status Penyampaian</option>
                        <option value="not_delivered">Belum Pernah Tersampaikan</option>
                        <option value="delivered">Pernah Tersampaikan</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={expandAllQuestionTopics}
                        className="px-2 py-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                      >
                        Buka Semua
                      </button>
                      <button
                        type="button"
                        onClick={collapseAllQuestionTopics}
                        className="px-2 py-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                      >
                        Tutup Semua
                      </button>
                    </div>
                  </div>

                  {/* Grouped Topics Accordion List */}
                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                    {topics.map(t => {
                      const topicQuestions = questions.filter(q => q.topic_id === t.topic_id);
                      if (topicQuestions.length === 0) return null;

                      // Filter within topic
                      const matchingTopicQuestions = topicQuestions.filter(q => {
                        const matchesSearch = !modalQuestionSearch ||
                          q.pertanyaan_id.toLowerCase().includes(modalQuestionSearch.toLowerCase()) ||
                          q.question_en.toLowerCase().includes(modalQuestionSearch.toLowerCase()) ||
                          q.question_id.toLowerCase().includes(modalQuestionSearch.toLowerCase());
                        const matchesDiff = modalQuestionDiffFilter === 'all' || q.difficulty === modalQuestionDiffFilter;
                        
                        const deliveredMeetings = getQuestionDeliveredMeetings(q.question_id, editingMeetingId);
                        const isDelivered = deliveredMeetings.length > 0;
                        const matchesDelivered =
                          modalQuestionDeliveredFilter === 'all' ||
                          (modalQuestionDeliveredFilter === 'delivered' && isDelivered) ||
                          (modalQuestionDeliveredFilter === 'not_delivered' && !isDelivered);

                        return matchesSearch && matchesDiff && matchesDelivered;
                      });

                      const selectedInTopic = topicQuestions.filter(q => formSelectedQuestionIds.includes(q.question_id));
                      const isExpanded = !!expandedQuestionTopicIds[t.topic_id] || (modalQuestionSearch.trim().length > 0 && matchingTopicQuestions.length > 0);

                      if ((modalQuestionSearch.trim().length > 0 || modalQuestionDiffFilter !== 'all' || modalQuestionDeliveredFilter !== 'all') && matchingTopicQuestions.length === 0) {
                        return null; // Skip topic if filter doesn't match
                      }

                      return (
                        <div
                          key={t.topic_id}
                          className={`rounded-2xl border transition ${
                            selectedInTopic.length > 0
                              ? 'bg-purple-950/20 border-purple-500/40'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Topic Header */}
                          <div
                            onClick={() => toggleQuestionTopicExpand(t.topic_id)}
                            className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-purple-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-200 text-xs">{t.nama_topik}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">({topicQuestions.length} Soal Tersedia)</span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1">{t.deskripsi}</p>
                              </div>
                            </div>

                            {/* Quick Quota Buttons for this topic */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                selectedInTopic.length > 0
                                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {selectedInTopic.length} / {topicQuestions.length} Terpilih
                              </span>

                              <button
                                type="button"
                                onClick={() => handleAddTopicQuestions(t.topic_id, 5)}
                                className="px-2 py-1 bg-slate-800 hover:bg-purple-900/60 text-purple-300 hover:text-purple-200 border border-slate-700 hover:border-purple-500/40 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title="Pilih 5 soal dari topik ini"
                              >
                                +5 Soal
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddTopicQuestions(t.topic_id, 10)}
                                className="px-2 py-1 bg-slate-800 hover:bg-purple-900/60 text-purple-300 hover:text-purple-200 border border-slate-700 hover:border-purple-500/40 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title="Pilih 10 soal dari topik ini"
                              >
                                +10 Soal
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddTopicQuestions(t.topic_id)}
                                className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title="Pilih semua soal dari topik ini (hingga batas 25)"
                              >
                                Semua
                              </button>

                              {selectedInTopic.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleClearTopicQuestions(t.topic_id)}
                                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                  title="Kosongkan pilihan soal dari topik ini"
                                >
                                  Batal
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Questions in Topic */}
                          {isExpanded && (
                            <div className="p-3 pt-0 space-y-1.5 border-t border-slate-800/80 mt-1">
                              {matchingTopicQuestions.map(q => {
                                const isSelected = formSelectedQuestionIds.includes(q.question_id);
                                const deliveredMeetings = getQuestionDeliveredMeetings(q.question_id, editingMeetingId);
                                const isDelivered = deliveredMeetings.length > 0;
                                return (
                                  <div
                                    key={q.question_id}
                                    onClick={() => handleToggleQuestion(q.question_id)}
                                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                                      isSelected
                                        ? 'bg-purple-950/90 border-purple-500/60 text-purple-200'
                                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-purple-400' : 'text-slate-600'}`}>
                                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-200">
                                          {q.question_id}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                          q.difficulty === 'HOTS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                          q.difficulty === 'MIDDLE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        }`}>
                                          {q.difficulty}
                                        </span>
                                        {isDelivered && (
                                          <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                                            pernah tersampaikan pada pertemuan ke {deliveredMeetings.join(', ')}
                                          </span>
                                        )}
                                        {q.kompetensi && (
                                          <span className="text-[10px] text-slate-500 truncate max-w-[200px]">· {q.kompetensi}</span>
                                        )}
                                      </div>
                                      <p className="line-clamp-2 text-slate-200 font-medium">{q.pertanyaan_id}</p>
                                      {q.question_en && (
                                        <p className="line-clamp-1 text-slate-400 italic text-[11px]">EN: {q.question_en}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 2. ALOKASI MODUL PRAKTIK PJDM & AOL */}
                {/* ======================================================== */}
                <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-xs">
                          Alokasi Modul Praktik PJDM & AOL ({formSelectedPracticalIds.length} Dipilih)
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Pilih lembar kerja praktikum Spreadsheet (PJDM) dan Akuntansi Online (AOL).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={modalPracticalTypeFilter}
                        onChange={e => setModalPracticalTypeFilter(e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 outline-none text-xs cursor-pointer"
                      >
                        <option value="all">Semua Tipe Praktik</option>
                        <option value="PJDM">PJDM (Spreadsheet/Jurnal)</option>
                        <option value="AOL">AOL (Akuntansi Online)</option>
                      </select>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {practicals
                      .filter(p => {
                        if (modalPracticalTypeFilter === 'all') return true;
                        if (modalPracticalTypeFilter === 'PJDM') return p.tipe_praktik.includes('PJDM') || p.target_types?.includes('PJDM');
                        if (modalPracticalTypeFilter === 'AOL') return p.tipe_praktik.includes('AOL') || p.target_types?.includes('AOL');
                        return true;
                      })
                      .map(p => {
                        const isSelected = formSelectedPracticalIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setFormSelectedPracticalIds(prev =>
                                isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]
                              );
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                              isSelected
                                ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`}>
                              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-[10px] text-slate-400">{p.id}</span>
                                <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded uppercase ${
                                  p.tipe_praktik === 'PJDM' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                  p.tipe_praktik === 'AOL' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                  'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}>
                                  {p.tipe_praktik}
                                </span>
                                {p.kompetensi && (
                                  <span className="text-[10px] text-slate-500 truncate max-w-[200px]">· {p.kompetensi}</span>
                                )}
                              </div>
                              <p className="line-clamp-1 text-slate-200 font-semibold">{p.judul}</p>
                              {p.deskripsi && (
                                <p className="line-clamp-1 text-slate-400 text-[11px]">{p.deskripsi}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 3. ALOKASI TOPIK PRESENTASI & WAWANCARA JURI LKS (GROUPED BY TOPIC) */}
                {/* ======================================================== */}
                <div className="p-4 bg-slate-950 border border-rose-500/40 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-xs">
                          Alokasi Bahan Presentasi & Wawancara Juri LKS (Dikelompokkan per Topik)
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Pilih topik studi kasus presentasi & wawancara (dari 60 bank topik standar LKS).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300">
                        {formSelectedPresTopicIds.length} Topik Dipilih
                      </span>
                    </div>
                  </div>

                  {/* Filter Toolbar for Presentation */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Cari topik presentasi / studi kasus..."
                      value={modalPresSearch}
                      onChange={e => setModalPresSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-500 text-xs flex-1 min-w-[200px]"
                    />
                    <select
                      value={modalPresDiffFilter}
                      onChange={e => setModalPresDiffFilter(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-500 text-xs cursor-pointer"
                    >
                      <option value="all">Semua Level Kesulitan</option>
                      <option value="HOTS">Level HOTS</option>
                      <option value="MIDDLE">Level MIDDLE</option>
                    </select>
                  </div>

                  {/* Grouped Presentation Topics List */}
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                    {topics.map(t => {
                      const topicPresList = presentationTopics.filter(pt => pt.topic_id === t.topic_id);
                      if (topicPresList.length === 0) return null;

                      const matchingPres = topicPresList.filter(pt => {
                        const matchesSearch = !modalPresSearch ||
                          pt.judul_topik.toLowerCase().includes(modalPresSearch.toLowerCase()) ||
                          pt.id.toLowerCase().includes(modalPresSearch.toLowerCase()) ||
                          (pt.kasus_studi && pt.kasus_studi.toLowerCase().includes(modalPresSearch.toLowerCase())) ||
                          (pt.deskripsi && pt.deskripsi.toLowerCase().includes(modalPresSearch.toLowerCase()));
                        const matchesDiff = modalPresDiffFilter === 'all' || pt.tipe_soal === modalPresDiffFilter;
                        return matchesSearch && matchesDiff;
                      });

                      const selectedInTopic = topicPresList.filter(pt => formSelectedPresTopicIds.includes(pt.id));
                      const isExpanded = !!expandedPresTopicIds[t.topic_id] || (modalPresSearch.trim().length > 0 && matchingPres.length > 0);

                      if (modalPresSearch.trim().length > 0 && matchingPres.length === 0) {
                        return null;
                      }

                      return (
                        <div
                          key={`pres_grp_${t.topic_id}`}
                          className={`rounded-2xl border transition ${
                            selectedInTopic.length > 0
                              ? 'bg-rose-950/20 border-rose-500/40'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div
                            onClick={() => togglePresTopicExpand(t.topic_id)}
                            className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-rose-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                              </div>
                              <span className="font-bold text-slate-200 text-xs truncate">
                                {t.nama_topik}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                selectedInTopic.length > 0
                                  ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {selectedInTopic.length} / {topicPresList.length} Terpilih
                              </span>

                              <button
                                type="button"
                                onClick={() => handleToggleAllPresForTopic(t.topic_id)}
                                className="px-2 py-1 bg-slate-800 hover:bg-rose-900/50 text-rose-300 border border-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                              >
                                {selectedInTopic.length === topicPresList.length ? 'Batal Semua' : 'Pilih Topik Ini'}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3 pt-0 space-y-1.5 border-t border-slate-800/80 mt-1">
                              {matchingPres.map(pt => {
                                const isSelected = formSelectedPresTopicIds.includes(pt.id);
                                return (
                                  <div
                                    key={pt.id}
                                    onClick={() => handleTogglePresTopic(pt.id)}
                                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                                      isSelected
                                        ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-600'}`}>
                                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-[10px] text-rose-400">{pt.id}</span>
                                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-800 text-slate-300">
                                          {pt.tipe_soal || 'MIDDLE'}
                                        </span>
                                        {pt.estimasi_durasi && (
                                          <span className="text-[10px] text-slate-500">· {pt.estimasi_durasi}</span>
                                        )}
                                      </div>
                                      <p className="line-clamp-1 text-slate-200 font-semibold">{pt.judul_topik}</p>
                                      {pt.deskripsi && (
                                        <p className="line-clamp-1 text-slate-400 text-[11px]">{pt.deskripsi}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CATATAN INSTRUKTUR */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Catatan Instruktur / Arahan Khusus Guru:</label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={e => setFormCatatan(e.target.value)}
                  placeholder="Petunjuk khusus bagi guru atau siswa untuk sesi ini..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-purple-500"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-extrabold rounded-xl transition shadow-lg cursor-pointer"
                >
                  Simpan Pertemuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingMeetingId && (
        <ConfirmModal
          isOpen={true}
          title="Hapus Pertemuan Kurikulum"
          message="Apakah Anda yakin ingin menghapus pertemuan ini dari silabus kurikulum?"
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={handleConfirmDeleteMeeting}
          onCancel={() => setDeletingMeetingId(null)}
        />
      )}

      {/* CONFIRM RESET MODAL */}
      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          title="Reset ke 12 Pertemuan Standar LKS"
          message="Tindakan ini akan mengembalikan seluruh jadwal dan alokasi bank soal kurikulum ke 12 Pertemuan Standar Pembinaan LKS Akuntansi."
          confirmText="Ya, Reset Kurikulum"
          cancelText="Batal"
          onConfirm={handleResetToStandard}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}

      {/* CONFIRM CLEAR ALL MODAL */}
      {isClearAllConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          title="Kosongkan Seluruh Kurikulum (Mulai dari Nol)"
          message="Apakah Anda yakin ingin mengosongkan seluruh pertemuan kurikulum? Semua sesi pertemuan akan dihapus (0 pertemuan) sehingga guru dapat menata ulang alur pembelajaran dari awal. Anda tetap dapat memuat kembali template 12 standar LKS kapan saja."
          confirmText="Ya, Kosongkan Kurikulum"
          cancelText="Batal"
          onConfirm={handleClearAllMeetings}
          onCancel={() => setIsClearAllConfirmOpen(false)}
        />
      )}
    </div>
  );
};
