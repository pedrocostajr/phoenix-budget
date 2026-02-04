
import React from 'react';
import { Client, PredictionResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  clients: Client[];
  predictions: PredictionResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients, predictions }) => {
  const totalBalance = clients.reduce((acc, c) => acc + c.currentBalance, 0);
  const totalDailySpend = clients.reduce((acc, c) => acc + c.dailySpend, 0);
  const criticalCount = predictions.filter(p => p.status === 'CRITICAL').length;
  const warningCount = predictions.filter(p => p.status === 'WARNING').length;

  const trendData = [
    { name: 'Seg', gasto: totalDailySpend * 0.9 },
    { name: 'Ter', gasto: totalDailySpend * 1.1 },
    { name: 'Qua', gasto: totalDailySpend * 1.05 },
    { name: 'Qui', gasto: totalDailySpend * 0.95 },
    { name: 'Sex', gasto: totalDailySpend },
    { name: 'Sáb', gasto: totalDailySpend * 0.8 },
    { name: 'Dom', gasto: totalDailySpend * 0.85 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Orçamento Gerenciado" 
          value={`R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          subtitle="Total em todas as contas"
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Taxa de Gasto Diário" 
          value={`R$ ${totalDailySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          subtitle="Gasto diário estimado"
          icon={<svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 10 1 15 1 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.035 15.035a4 4 0 01-5.656 0l-4-4a4 4 0 015.656 0l4 4z" /></svg>}
        />
        <StatCard 
          title="Status Crítico" 
          value={criticalCount.toString()} 
          subtitle="Acaba em < 3 dias"
          color="text-rose-600"
          icon={<svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatCard 
          title="Alertas de Saúde" 
          value={warningCount.toString()} 
          subtitle="Acaba em < 7 dias"
          color="text-amber-600"
          icon={<svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Velocidade de Gasto Global</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Gasto']}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Area type="monotone" dataKey="gasto" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = "text-slate-900" }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-slate-50 p-3 rounded-xl">{icon}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
    </div>
    <div className={`text-3xl font-extrabold mb-1 ${color}`}>{value}</div>
    <div className="text-sm text-slate-500 font-medium">{subtitle}</div>
  </div>
);

export default Dashboard;
