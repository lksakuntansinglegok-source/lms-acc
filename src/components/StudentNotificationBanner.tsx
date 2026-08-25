import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Mic,
  Video,
  FileSpreadsheet,
  Award,
  ArrowRight,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { AppNotification } from '../types';

export interface StudentNotificationBannerProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onNotificationClick: (notif: AppNotification) => void;
}

export const StudentNotificationBanner: React.FC<StudentNotificationBannerProps> = ({
  notifications,
  onMarkAsRead,
  onNotificationClick
}) => {
  const unreadNotifs = notifications.filter(n => !n.read);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (unreadNotifs.length === 0) return null;

  const currentNotif = unreadNotifs[Math.min(currentIndex, unreadNotifs.length - 1)] || unreadNotifs[0];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % unreadNotifs.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + unreadNotifs.length) % unreadNotifs.length);
  };

  const handleDismiss = () => {
    onMarkAsRead(currentNotif.id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_task':
        return <BookOpen className="w-5 h-5 text-sky-400" />;
      case 'task_feedback':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'oral_feedback':
        return <Mic className="w-5 h-5 text-purple-400" />;
      case 'presentation_feedback':
        return <Video className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'new_task':
        return 'from-sky-500/20 via-blue-500/10 to-slate-900 border-sky-500/30';
      case 'task_feedback':
        return 'from-emerald-500/20 via-teal-500/10 to-slate-900 border-emerald-500/30';
      case 'oral_feedback':
        return 'from-purple-500/20 via-indigo-500/10 to-slate-900 border-purple-500/30';
      case 'presentation_feedback':
        return 'from-amber-500/20 via-orange-500/10 to-slate-900 border-amber-500/30';
      default:
        return 'from-teal-500/20 via-cyan-500/10 to-slate-900 border-teal-500/30';
    }
  };

  return (
    <div
      id="student-notification-banner"
      className={`relative p-4 rounded-2xl bg-gradient-to-r ${getBorderColor(
        currentNotif.type
      )} border shadow-lg transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left icon & content */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0 mt-0.5 shadow-md">
            {getIcon(currentNotif.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Pemberitahuan Guru
              </span>

              {unreadNotifs.length > 1 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                  {currentIndex + 1} dari {unreadNotifs.length}
                </span>
              )}

              {typeof currentNotif.score === 'number' && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  Nilai: {currentNotif.score}/100
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-white mt-1 leading-snug">
              {currentNotif.title}
            </h3>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
              {currentNotif.message}
            </p>

            {currentNotif.feedback && (
              <div className="mt-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-emerald-300 italic">
                &ldquo;{currentNotif.feedback}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
          {unreadNotifs.length > 1 && (
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5 mr-1">
              <button
                onClick={handlePrev}
                className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
                title="Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              onMarkAsRead(currentNotif.id);
              onNotificationClick(currentNotif);
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
          >
            <span>{currentNotif.type === 'new_task' ? 'Buka Tugas' : 'Lihat Detail'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700 transition cursor-pointer"
            title="Tandai Sudah Dibaca"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
