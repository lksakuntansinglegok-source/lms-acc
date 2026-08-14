import React, { useState } from 'react';
import { Student, StudentProgress } from '../types';
import { Users, BarChart2, CheckCircle2 } from 'lucide-react';

interface StudentComparisonProps {
  students: Student[];
  progressList: StudentProgress[];
}

export const StudentComparison: React.FC<StudentComparisonProps> = ({
  students,
  progressList
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([
    students[0]?.student_id || 'std_01',
    students[1]?.student_id || 'std_02'
  ]);

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      if (selectedStudentIds.length > 1) {
        setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
      }
    } else {
      if (selectedStudentIds.length < 5) {
        setSelectedStudentIds(prev => [...prev, studentId]);
      }
    }
  };

  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.student_id));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          Perbandingan Kemampuan Siswa (Multi-Student Comparison)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Pilih 2 hingga 5 siswa untuk membandingkan secara langsung kompetensi PJDM, AOL, Teori, Presentasi, dan Oral.
        </p>

        {/* Student Selector Checklist */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pilih Siswa (Maksimal 5 Siswa):
          </label>
          <div className="flex flex-wrap gap-2">
            {students.map(s => {
              const isSelected = selectedStudentIds.includes(s.student_id);
              return (
                <button
                  key={s.student_id}
                  onClick={() => toggleStudentSelection(s.student_id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-500'}`} />
                  {s.nama} ({s.kelas})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* COMPARISON MATRIX TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4">Matriks Perbandingan Kompetensi</h3>

        <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Kompetensi</th>
              {selectedStudents.map(s => (
                <th key={s.student_id} className="px-4 py-3 text-center">
                  <div className="font-bold text-white">{s.nama}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">{s.kelas}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="px-4 py-3.5 font-bold text-blue-400">PJDM (Jurnal Dasar)</td>
              {selectedStudents.map(s => {
                const prog = progressList.find(p => p.student_id === s.student_id);
                return (
                  <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                    {prog?.pjdm_progress || 0}%
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="px-4 py-3.5 font-bold text-indigo-400">AOL (Akuntansi Online)</td>
              {selectedStudents.map(s => {
                const prog = progressList.find(p => p.student_id === s.student_id);
                return (
                  <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                    {prog?.aol_progress || 0}%
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="px-4 py-3.5 font-bold text-emerald-400">TEORI AKUNTANSI</td>
              {selectedStudents.map(s => {
                const prog = progressList.find(p => p.student_id === s.student_id);
                return (
                  <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                    {prog?.theory_progress || 0}%
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="px-4 py-3.5 font-bold text-purple-400">PRESENTASI VIDEO</td>
              {selectedStudents.map(s => {
                const prog = progressList.find(p => p.student_id === s.student_id);
                return (
                  <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                    {prog?.presentation_progress || 0}%
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="px-4 py-3.5 font-bold text-rose-400">WAWANCARA ORAL AI</td>
              {selectedStudents.map(s => {
                const prog = progressList.find(p => p.student_id === s.student_id);
                return (
                  <td key={s.student_id} className="px-4 py-3.5 text-center font-bold text-white">
                    {prog?.oral_progress || 0}%
                  </td>
                );
              })}
            </tr>

            <tr className="bg-slate-950 font-black">
              <td className="px-4 py-4 text-emerald-400 uppercase">OVERALL PROGRESS</td>
              {selectedStudents.map(s => {
                const prog = progressList.find(p => p.student_id === s.student_id);
                return (
                  <td key={s.student_id} className="px-4 py-4 text-center text-amber-400 text-sm font-extrabold">
                    {prog?.overall_progress || 0}%
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
