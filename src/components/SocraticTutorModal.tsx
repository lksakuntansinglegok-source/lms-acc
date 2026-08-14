import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Send, Brain, Sparkles, Bot, User } from 'lucide-react';

interface SocraticTutorModalProps {
  onClose: () => void;
  topicName?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const SocraticTutorModal: React.FC<SocraticTutorModalProps> = ({
  onClose,
  topicName = 'Persamaan Dasar Akuntansi'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `Halo! Saya "Pak Guru AI", tutor akuntansi Anda. Ada konsep pada topik "${topicName}" yang belum Anda pahami? Tanyakan saja, saya akan membimbing Anda langkah demi langkah!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await api.sendSocraticMessage({
        user_message: userText,
        topic_name: topicName,
        history: newHistory.map(m => ({ role: m.role, text: m.text }))
      });

      setMessages(prev => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      console.error('Failed to get AI Tutor response:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Maaf, Pak Guru AI sedang mengalami gangguan koneksi. Mari coba tanyakan kembali!'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full h-[550px] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                Pak Guru AI (Socratic Accounting Tutor)
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </h3>
              <p className="text-[11px] text-slate-400">Metode Bimbingan Socratic • Topik: {topicName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Pak Guru AI sedang mengetik penjelasan...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tanyakan soal/konsep akuntansi (misal: Mengapa prive mengurangi modal?)..."
            className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};
