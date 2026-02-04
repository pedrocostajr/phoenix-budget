
import React from 'react';
import { Client, PredictionResult, Platform } from '../types';

interface ClientListProps {
  clients: Client[];
  predictions: PredictionResult[];
  onUpdateBalance: (id: string, balance: number) => void;
  onSyncMeta?: (id: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, predictions, onUpdateBalance, onSyncMeta }) => {
  const getStatusBadge = (clientId: string) => {
    const pred = predictions.find(p => p.clientId === clientId);
    if (!pred) return null;

    switch (pred.status) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">Crítico</span>;
      case 'WARNING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase">Aviso</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">Saudável</span>;
    }
  };

  const getDaysLeft = (clientId: string) => {
    const pred = predictions.find(p => p.clientId === clientId);
    return pred ? pred.daysRemaining : 0;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Contas de Clientes</h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Buscar contas..." 
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">Cliente / Empresa</th>
              <th className="px-6 py-4">Plataforma</th>
              <th className="px-6 py-4">Saldo Restante</th>
              <th className="px-6 py-4">Gasto Diário Est.</th>
              <th className="px-6 py-4">Duração Prevista</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map(client => {
              const daysLeft = getDaysLeft(client.id);
              const isLow = daysLeft <= 3;

              return (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900">{client.company}</div>
                    <div className="text-sm text-slate-500">{client.name}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPlatformColor(client.platform)}`}></div>
                      <span className="text-sm font-medium text-slate-700">{client.platform}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">R$ {client.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        {client.isSynced ? (
                           <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold" title="Sincronizado via Meta Ads">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3 8h-1.35c-.538 0-.65.221-.65.77V10h2l-.364 2h-1.636v5h-2v-5H9v-2h2V8.411C11 6.427 12.113 5 14.123 5H15v3z"/></svg>
                              API
                           </div>
                        ) : (
                          <button 
                            onClick={() => {
                              const val = window.prompt("Digite o novo saldo manualmente:", client.currentBalance.toString());
                              if (val && !isNaN(parseFloat(val))) onUpdateBalance(client.id, parseFloat(val));
                            }}
                            className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                        {client.platform === Platform.META_ADS && !client.isSynced && (
                           <button 
                             onClick={() => onSyncMeta && onSyncMeta(client.id)}
                             className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity text-[10px] font-bold border border-slate-200 px-1 rounded hover:border-blue-200"
                           >
                             Vincular API
                           </button>
                        )}
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-blue-500'}`} 
                          style={{ width: `${Math.min((client.currentBalance / 2000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-mono font-medium text-slate-600">
                    R$ {client.dailySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia
                  </td>
                  <td className="px-6 py-5">
                    <div className={`text-sm font-bold ${isLow ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                      {daysLeft} dias restantes
                    </div>
                    <div className="text-xs text-slate-400">
                      Esgotamento: {predictions.find(p => p.clientId === client.id)?.depletionDate}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(client.id)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getPlatformColor = (platform: Platform) => {
  switch (platform) {
    case Platform.GOOGLE_ADS: return 'bg-blue-500';
    case Platform.META_ADS: return 'bg-sky-600';
    case Platform.TIKTOK_ADS: return 'bg-black';
    case Platform.LINKEDIN_ADS: return 'bg-blue-800';
    default: return 'bg-slate-400';
  }
};

export default ClientList;
