import React, { useState } from 'react';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  RefreshCw,
  Download,
  Key,
  Database,
  History,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface GoogleSheetsSettingsProps {
  auditLogs: any[];
  onRefreshData: () => void;
}

export const GoogleSheetsSettings: React.FC<GoogleSheetsSettingsProps> = ({
  auditLogs,
  onRefreshData
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncSheets = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncGoogleSheets(spreadsheetId);
      setSyncMessage(res.message);
      onRefreshData();
    } catch (err) {
      console.error('Failed to sync Google Sheets:', err);
      setSyncMessage('Sinkronisasi gagal. Pastikan Service Account Google Cloud memiliki akses Editor ke Spreadsheet ID.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ auditLogs }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LMS_Akuntansi_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          Pengaturan Integrasi Google Sheets & Backup Data
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Konfigurasi penyimpaan data dua arah ke Google Sheets, ekspor backup CSV/JSON, dan riwayat audit log.
        </p>

        {/* SPREADSHEET ID CONFIGURATION */}
        <div className="mt-6 p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Google Spreadsheet ID Target:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={spreadsheetId}
                onChange={e => setSpreadsheetId(e.target.value)}
                placeholder="Masukkan ID dari URL https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit"
                className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleSyncSheets}
                disabled={isSyncing}
                className="px-5 py-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center gap-2 shadow-md shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Menyingkronkan...' : 'Sinkronkan Sekarang'}
              </button>
            </div>
          </div>

          {syncMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* SPREADSHEET SCHEMA TABLE MAPPING */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Struktur Mappings Sheet (Dataset Schema)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-emerald-400 block mb-1">1. Sheet `Siswa`</span>
            <span className="text-[11px] text-slate-400">ID, Nama, Kelas, Absen, Email, Level, XP, Badges, Status</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-blue-400 block mb-1">2. Sheet `Topik`</span>
            <span className="text-[11px] text-slate-400">ID Topik, Nama Topik, Urutan, Passing Grade</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-purple-400 block mb-1">3. Sheet `Nilai_Quiz`</span>
            <span className="text-[11px] text-slate-400">Result ID, Siswa ID, Score, Middle, HOTS, Status Remedial</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-amber-400 block mb-1">4. Sheet `Jawaban_Oral`</span>
            <span className="text-[11px] text-slate-400">Oral Sub ID, Audio URL, Transkrip, Skor AI, Skor Guru</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-indigo-400 block mb-1">5. Sheet `Presentasi`</span>
            <span className="text-[11px] text-slate-400">Presentation ID, Video URL, Catatan, Skor, Feedback</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-rose-400 block mb-1">6. Sheet `Log_Audit`</span>
            <span className="text-[11px] text-slate-400">Timestamp, User, Aksi System, Status Backup</span>
          </div>
        </div>
      </div>

      {/* EXPORT BACKUP & AUDIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            Ekspor & Backup Cadangan Data
          </h3>
          <p className="text-xs text-slate-400">
            Unduh seluruh database LMS dalam format JSON / CSV untuk keperluan arsip lokal sekolah.
          </p>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Unduh Backup File (.JSON)
          </button>
        </div>

        {/* AUDIT LOG HISTORY */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            Riwayat Log Audit Sistem
          </h3>

          <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="text-[10px] text-slate-400">{log.user}</div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
