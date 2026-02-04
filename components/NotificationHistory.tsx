
import React from 'react';
import { NotificationLog } from '../types';

interface NotificationHistoryProps {
  logs: NotificationLog[];
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Log de Atividade</h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">Automação Ativa</span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="text-sm text-slate-400">Nenhuma notificação enviada recentemente.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-rose-50 text-rose-600`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-800">Google Agenda</span>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {log.message}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Confirmado</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default NotificationHistory;
