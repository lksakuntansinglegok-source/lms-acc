import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Mic,
  Video,
  FileSpreadsheet,
  Clock,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Award,
  AlertCircle,
  X
} from 'lucide-react';
import { AppNotification } from '../types';

export interface NotificationPopoverProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNotificationClick?: (notif: AppNotification) => void;
  currentRole?: 'student' | 'teacher';
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNotificationClick,
  currentRole = 'student'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'task' | 'feedback'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'task') return n.type === 'new_task';
    if (activeFilter === 'feedback') {
      return (
        n.type === 'task_feedback' ||
        n.type === 'oral_feedback' ||
        n.type === 'presentation_feedback'
      );
    }
    return true;
  });

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 1) return 'Baru saja';
      if (diffMin < 60) return `${diffMin} menit yang lalu`;
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'new_task':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'task_feedback':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'oral_feedback':
        return <Mic className="w-4 h-4 text-purple-400" />;
      case 'presentation_feedback':
        return <Video className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-teal-400" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'new_task':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'task_feedback':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'oral_feedback':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'presentation_feedback':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'new_task':
        return 'Tugas Baru';
      case 'task_feedback':
        return 'Feedback Tugas';
      case 'oral_feedback':
        return 'Feedback Oral';
      case 'presentation_feedback':
        return 'Feedback Video';
      default:
        return 'Pengumuman';
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        id="btn-inapp-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-slate-800 border-emerald-500/50 text-emerald-400'
            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
        }`}
        title="Pusat Notifikasi In-App"
        aria-label="Pusat Notifikasi"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-900/50 animate-pulse border border-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          id="popover-inapp-notifications"
          className="absolute right-0 mt-2 w-[340px] sm:w-[420px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Notifikasi In-App</h3>
                <p className="text-[11px] text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} pemberitahuan belum dibaca`
                    : 'Semua pemberitahuan sudah dibaca'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer flex items-center gap-1"
                  title="Tandai semua sudah dibaca"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tandai Dibaca</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                activeFilter === 'unread'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('task')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                activeFilter === 'task'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tugas Baru
            </button>
            <button
              onClick={() => setActiveFilter('feedback')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                activeFilter === 'feedback'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Feedback Guru
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-slate-800/80 max-h-[380px] p-2 space-y-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-300">Tidak ada notifikasi</p>
                <p className="text-[11px] text-slate-500">
                  {activeFilter === 'unread'
                    ? 'Hebat! Anda telah membaca semua notifikasi.'
                    : 'Pemberitahuan tugas dan feedback guru akan muncul di sini.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl transition border text-left ${
                    notif.read
                      ? 'bg-slate-900/60 border-slate-800/60 text-slate-300 hover:bg-slate-800/50'
                      : 'bg-slate-800/80 border-slate-700 text-white shadow-sm hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 shrink-0 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${getBadgeStyle(
                              notif.type
                            )}`}
                          >
                            {getBadgeLabel(notif.type)}
                          </span>

                          {typeof notif.score === 'number' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Skor: {notif.score}
                            </span>
                          )}

                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 mt-1 leading-snug">
                          {notif.title}
                        </h4>

                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
                          {notif.message}
                        </p>

                        {/* Extra Feedback Highlight */}
                        {notif.feedback && (
                          <div className="mt-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-emerald-300/90 italic">
                            &ldquo;{notif.feedback}&rdquo;
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 text-[10px] text-slate-400">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatTime(notif.created_at)}</span>
                            {notif.sender_name && (
                              <span className="text-slate-400 font-medium hidden sm:inline">
                                • {notif.sender_name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {onNotificationClick && (
                              <button
                                onClick={() => {
                                  if (!notif.read) onMarkAsRead(notif.id);
                                  onNotificationClick(notif);
                                  setIsOpen(false);
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] flex items-center gap-1 transition cursor-pointer"
                              >
                                <span>{notif.type === 'new_task' ? 'Buka Tugas' : 'Lihat Detail'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {!notif.read && (
                              <button
                                onClick={() => onMarkAsRead(notif.id)}
                                className="text-slate-400 hover:text-emerald-400 transition cursor-pointer p-1"
                                title="Tandai sudah dibaca"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={() => onDeleteNotification(notif.id)}
                              className="text-slate-400 hover:text-rose-400 transition cursor-pointer p-1"
                              title="Hapus notifikasi"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Pemberitahuan tersinkronisasi otomatis dengan server LMS</span>
          </div>
        </div>
      )}
    </div>
  );
};
