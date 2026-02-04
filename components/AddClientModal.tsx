
import React, { useState } from 'react';
import { Client, Platform } from '../types';

interface AddClientModalProps {
  onClose: () => void;
  onAdd: (client: Client) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    platform: Platform.GOOGLE_ADS,
    currentBalance: 0,
    dailySpend: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      currency: 'BRL',
      lastUpdated: new Date().toISOString(),
    };
    onAdd(newClient);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Nova Conta de Cliente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome da Empresa</label>
              <input 
                required
                type="text" 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                placeholder="ex: Acme Marketing Brasil"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Plataforma</label>
              <select 
                value={formData.platform}
                onChange={e => setFormData({...formData, platform: e.target.value as Platform})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              >
                {Object.values(Platform).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Gestor</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                placeholder="Nome do Responsável"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Saldo Inicial (R$)</label>
              <input 
                required
                type="number" 
                value={formData.currentBalance || ''}
                onChange={e => setFormData({...formData, currentBalance: parseFloat(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-mono"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Gasto Diário (R$)</label>
              <input 
                required
                type="number" 
                value={formData.dailySpend || ''}
                onChange={e => setFormData({...formData, dailySpend: parseFloat(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-mono"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Criar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;
