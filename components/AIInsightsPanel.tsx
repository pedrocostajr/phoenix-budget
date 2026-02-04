
import React from 'react';

interface AIInsightsPanelProps {
  insights: {
    summary: string;
    criticalClients: Array<{ clientId: string; reason: string; action: string; }>;
  } | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, isLoading, onAnalyze }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800">Insights Inteligentes</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-4">
          <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse"></div>
          <p className="text-xs text-center text-slate-400 mt-2">O Gemini está analisando a velocidade de gasto...</p>
        </div>
      ) : insights ? (
        <div className="space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed italic">
            "{insights.summary}"
          </p>
          
          {insights.criticalClients.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ações Recomendadas</h4>
              {insights.criticalClients.map((client, idx) => (
                <div key={idx} className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <div className="text-sm font-bold text-rose-700 mb-1">{client.action}</div>
                  <div className="text-xs text-rose-600/80">{client.reason}</div>
                </div>
              ))}
            </div>
          )}
          
          <button 
            onClick={onAnalyze}
            className="w-full text-xs font-bold text-blue-600 hover:text-blue-800 py-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Atualizar Análise da IA
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 mb-4">Nenhuma análise recente disponível.</p>
          <button 
            onClick={onAnalyze}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Iniciar Análise
          </button>
        </div>
      )}

      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full pointer-events-none"></div>
    </div>
  );
};

export default AIInsightsPanel;
