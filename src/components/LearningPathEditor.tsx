import React, { useState } from 'react';
import { Task, Topic } from '../types';
import { api } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import {
  BookOpen,
  Plus,
  ArrowUp,
  ArrowDown,
  Lock,
  Clock,
  CheckSquare,
  Square,
  Trash2,
  X
} from 'lucide-react';

interface LearningPathEditorProps {
  tasks: Task[];
  topics: Topic[];
  onRefreshData: () => void;
}

export const LearningPathEditor: React.FC<LearningPathEditorProps> = ({
  tasks,
  topics,
  onRefreshData
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [taskType, setTaskType] = useState<'PJDM' | 'AOL' | 'Teori' | 'Presentasi' | 'Oral'>('PJDM');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.topic_id || 'top_01');
  const [deadline, setDeadline] = useState('2026-08-30');
  const [prereqTaskId, setPrereqTaskId] = useState<string>('');
  const [pertemuanNum, setPertemuanNum] = useState<number>(tasks.length + 1);
  const [wajib, setWajib] = useState(true);

  // Delete state
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedTasks = [...tasks].sort((a, b) => {
    const pA = a.pertemuan ?? a.urutan;
    const pB = b.pertemuan ?? b.urutan;
    if (pA !== pB) return pA - pB;
    return a.urutan - b.urutan;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul) return;

    try {
      await api.createTask({
        topic_id: selectedTopicId,
        judul,
        deskripsi,
        task_type: taskType,
        urutan: tasks.length + 1,
        pertemuan: Number(pertemuanNum) || (tasks.length + 1),
        pertemuan_judul: `Pertemuan ${pertemuanNum}: ${judul}`,
        prerequisite_task_id: prereqTaskId || undefined,
        deadline,
        wajib
      });
      onRefreshData();
      setIsAddModalOpen(false);
      setJudul('');
      setDeskripsi('');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleMoveUrutan = async (task: Task, direction: 'up' | 'down') => {
    const currentIndex = sortedTasks.findIndex(t => t.task_id === task.task_id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sortedTasks.length) return;

    const targetTask = sortedTasks[targetIndex];
    // Swap urutan
    await api.updateTask(task.task_id, { urutan: targetTask.urutan });
    await api.updateTask(targetTask.task_id, { urutan: task.urutan });
    onRefreshData();
  };

  const handleToggleWajib = async (task: Task) => {
    await api.updateTask(task.task_id, { wajib: !task.wajib });
    onRefreshData();
  };

  const confirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      await api.deleteTask(deletingTaskId);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
      setDeletingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Manajemen Alur Pembelajaran (Learning Path & Prerequisite)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Atur urutan tugas, syarat kunci prerequisite, tenggat waktu (deadline), dan kewajiban pengumpulan.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Tugas Alur
        </button>
      </div>

      {/* TASKS LIST WITH SEQUENCING CONTROLS */}
      <div className="space-y-3">
        {sortedTasks.map((task, idx) => {
          const prereqTask = tasks.find(t => t.task_id === task.prerequisite_task_id);

          return (
            <div
              key={task.task_id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start space-x-4">
                {/* Sequence Controls */}
                <div className="flex flex-col items-center justify-center space-y-1 shrink-0">
                  <button
                    onClick={() => handleMoveUrutan(task, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs text-emerald-400 font-mono">#{task.urutan}</span>
                  <button
                    onClick={() => handleMoveUrutan(task, 'down')}
                    disabled={idx === sortedTasks.length - 1}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Pertemuan {task.pertemuan || task.urutan}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {task.task_type}
                    </span>
                    <h4 className="font-bold text-sm text-white">{task.judul}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{task.deskripsi}</p>

                  <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Deadline: {task.deadline}
                    </span>
                    {prereqTask && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Lock className="w-3.5 h-3.5" /> Prerequisite: {prereqTask.judul}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  onClick={() => handleToggleWajib(task)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                    task.wajib
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {task.wajib ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  {task.wajib ? 'Wajib' : 'Opsional'}
                </button>

                <button
                  onClick={() => setDeletingTaskId(task.task_id)}
                  className="p-2 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Tambah Tugas Baru ke Alur</h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Judul Tugas: *</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  placeholder="Contoh: Menyusun Neraca Saldo"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Deskripsi Tugas:</label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={e => setDeskripsi(e.target.value)}
                  placeholder="Instruksi pengerjaan tugas..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Pertemuan Ke:</label>
                  <input
                    type="number"
                    min={1}
                    value={pertemuanNum}
                    onChange={e => setPertemuanNum(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Jenis Modul:</label>
                  <select
                    value={taskType}
                    onChange={e => setTaskType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none"
                  >
                    <option value="PJDM">PJDM (Jurnal Manual)</option>
                    <option value="AOL">AOL (Akuntansi Online)</option>
                    <option value="Teori">Teori Test</option>
                    <option value="Presentasi">Presentasi Video</option>
                    <option value="Oral">Oral Interview AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Deadline:</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Prerequisite Task (Syarat Kunci):</label>
                <select
                  value={prereqTaskId}
                  onChange={e => setPrereqTaskId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none"
                >
                  <option value="">-- Tanpa Syarat Kunci --</option>
                  {tasks.map(t => (
                    <option key={t.task_id} value={t.task_id}>
                      Tugas #{t.urutan}: {t.judul}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950">
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingTaskId}
        title="Hapus Tugas Alur Pembelajaran"
        message="Apakah Anda yakin ingin menghapus alur tugas ini? Tugas ini tidak akan dapat diakses oleh siswa lagi."
        isDeleting={isDeleting}
        onConfirm={confirmDeleteTask}
        onClose={() => setDeletingTaskId(null)}
      />
    </div>
  );
};
