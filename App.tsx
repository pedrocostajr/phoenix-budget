import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js'; // Import Session type
import { supabase } from './services/supabaseClient'; // Import supabase client
import Login from './components/Login'; // Import Login component
import { Client, NotificationLog, PredictionResult } from './types';
import { calculatePredictions, getSmartInsights } from './services/geminiService';
import { loginWithFacebook, fetchAdAccounts, getAdAccountBalance } from './services/metaService';
import { initGoogleCalendar, signInToGoogle, createCalendarEvent } from './services/calendarService';
import { fetchClients, createClient, updateClientBalance, processDailySettlements } from './services/clientService';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import AddClientModal from './components/AddClientModal';
import NotificationHistory from './components/NotificationHistory';
import AIInsightsPanel from './components/AIInsightsPanel';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null); // Auth state
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metaToken, setMetaToken] = useState<string | null>(null);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Check auth state on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar clientes do Supabase ao iniciar (se logado)
  useEffect(() => {
    if (!session) return; // Only load if logged in

    const loadClients = async () => {
      setIsLoadingClients(true);
      try {
        const data = await fetchClients();
        const processedData = await processDailySettlements(data);
        setClients(processedData);
      } catch (error) {
        console.error("Failed to load clients:", error);
        // We could set an error state here if we want to show a UI message
      } finally {
        setIsLoadingClients(false);
      }
    };

    // Inicializar integrações
    const initializeIntegrations = async () => {
      try {
        await initGoogleCalendar();
      } catch (error) {
        console.error("Failed to initialize Google Calendar", error);
      }
    };

    loadClients();
    initializeIntegrations();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };


  useEffect(() => {
    if (clients.length === 0) return;

    const newPredictions = calculatePredictions(clients);
    setPredictions(newPredictions);

    newPredictions.forEach(pred => {
      if (pred.status === 'CRITICAL') {
        const client = clients.find(c => c.id === pred.clientId);
        if (client) {
          triggerNotification(client, pred);
        }
      }
    });
  }, [clients]);

  // Sincronização automática com Meta a cada 5 minutos se houver token
  useEffect(() => {
    if (metaToken) {
      const interval = setInterval(() => {
        syncAllMetaAccounts();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [metaToken, clients]);

  const syncAllMetaAccounts = async () => {
    if (!metaToken) return;
    const syncedClients = await Promise.all(clients.map(async (client) => {
      if (client.metaAccountId && client.isSynced) {
        const realBalance = await getAdAccountBalance(client.metaAccountId, metaToken);
        // Atualiza no banco também
        if (realBalance !== client.currentBalance) {
          await updateClientBalance(client.id, realBalance);
        }
        return { ...client, currentBalance: realBalance, lastUpdated: new Date().toISOString() };
      }
      return client;
    }));
    setClients(syncedClients);
  };

  const handleConnectMeta = async () => {
    try {
      const token = await loginWithFacebook();
      setMetaToken(token);
      alert('Conectado ao Facebook com sucesso! Agora você pode vincular suas contas de anúncios.');
    } catch (error) {
      alert('Erro ao conectar: ' + error);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      await signInToGoogle();
      setIsCalendarConnected(true);
      alert('Google Calendar conectado com sucesso!');
    } catch (error: any) {
      console.error("Calendar Connection Error:", error);
      let msg = 'Erro ao conectar Google Calendar.';
      if (error?.result?.error?.message) {
        msg += ` Detalhe: ${error.result.error.message}`;
      } else if (error?.message) {
        msg += ` Detalhe: ${error.message}`;
      } else {
        msg += ` Detalhe: ${JSON.stringify(error)}`;
      }
      alert(msg);
    }
  };

  const triggerNotification = async (client: Client, pred: PredictionResult) => {
    const alreadyLogged = logs.some(l =>
      l.clientId === client.id &&
      new Date(l.timestamp).toDateString() === new Date().toDateString()
    );

    if (alreadyLogged) return;

    let notificationStatus: 'SENT' | 'FAILED' = 'SENT';
    let message = `Evento Adicionado: "REPOR ORÇAMENTO: ${client.company}" agendado para amanhã.`;

    if (isCalendarConnected) {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM

        const endTime = new Date(tomorrow);
        endTime.setHours(10, 0, 0, 0); // 1 hour duration

        await createCalendarEvent({
          summary: `REPOR ORÇAMENTO: ${client.company}`,
          description: `O saldo atual é ${client.currency} ${client.currentBalance}. Previsão de término em ${pred.daysRemaining} dias.`,
          start: tomorrow.toISOString(),
          end: endTime.toISOString(),
        });
      } catch (error) {
        console.error("Failed to create calendar event", error);
        notificationStatus = 'FAILED';
        message = `Falha ao criar evento no Calendar para ${client.company}.`;
      }
    } else {
      message = `Alerta (Calendar Desconectado): "REPOR ORÇAMENTO: ${client.company}" seria agendado para amanhã.`;
    }

    const newLogs: NotificationLog[] = [
      {
        id: Math.random().toString(36).substr(2, 9),
        clientId: client.id,
        clientName: client.company,
        type: 'CALENDAR',
        timestamp: new Date().toISOString(),
        status: notificationStatus,
        message: message
      }
    ];

    setLogs(prev => [...newLogs, ...prev]);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const insights = await getSmartInsights(clients);
    setAiInsights(insights);
    setIsAnalyzing(false);
  };

  const handleAddClient = async (newClient: Client) => {
    try {
      // Salva no Supabase e recebe o objeto com ID gerado
      const createdClient = await createClient(newClient);
      setClients(prev => [...prev, createdClient as Client]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert("Erro ao salvar cliente no banco de dados. Verifique a tabela 'clients'.");
    }
  };

  const handleUpdateBalance = async (id: string, newBalance: number) => {
    try {
      await updateClientBalance(id, newBalance);
      setClients(prev => prev.map(c => c.id === id ? { ...c, currentBalance: newBalance, lastUpdated: new Date().toISOString(), isSynced: false } : c));
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
      alert("Erro ao atualizar saldo no banco de dados.");
    }
  };

  if (!session) {
    return <Login />;
  }

  if (isLoadingClients) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Carregando dados...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      <nav className="w-full lg:w-64 bg-slate-900 text-white p-6 flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">TrafficAI</h1>
        </div>

        <ul className="space-y-2 flex-1">
          <li>
            <a href="#" className="flex items-center gap-3 text-blue-400 font-medium p-3 rounded-xl bg-slate-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </a>
          </li>
          <li>
            <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center gap-3 text-slate-300 hover:text-white p-3 rounded-xl hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Adicionar Cliente
            </button>
          </li>
          <li>
            <button onClick={handleConnectMeta} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${metaToken ? 'text-green-400 bg-green-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              {metaToken ? 'Meta Conectado' : 'Conectar Meta'}
            </button>
          </li>
          <li>
            <button onClick={handleConnectCalendar} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${isCalendarConnected ? 'text-green-400 bg-green-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {isCalendarConnected ? 'Calendar Conectado' : 'Conectar Calendar'}
            </button>
          </li>
          <li>
            <button onClick={runAnalysis} className="w-full flex items-center gap-3 text-slate-300 hover:text-white p-3 rounded-xl hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Análise com IA
            </button>
          </li>
          <li>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-red-300 hover:text-red-100 p-3 rounded-xl hover:bg-red-900/40 transition-colors mt-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sair
            </button>
          </li>
        </ul>

        <div className="pt-6 border-t border-slate-800">

          <div className="bg-slate-800 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Integrações Ativas</h3>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 text-[10px] ${isCalendarConnected ? 'text-green-400' : 'text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isCalendarConnected ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></span>
                {isCalendarConnected ? 'Google Calendar' : 'Calendar Off'}
              </div>
              {metaToken && (
                <div className="flex items-center gap-2 text-[10px] text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Meta Ads API
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard de Tráfego</h2>
            <p className="text-slate-500">Saldo atualizado e previsões de gastos</p>
          </div>
          <div className="flex gap-3">
            {metaToken && (
              <button
                onClick={syncAllMetaAccounts}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Sincronizar Meta
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Novo Cliente
            </button>
          </div>
        </header>

        <Dashboard clients={clients} predictions={predictions} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          <div className="xl:col-span-2">
            <ClientList
              clients={clients}
              predictions={predictions}
              onUpdateBalance={handleUpdateBalance}
              onSyncMeta={async (id) => {
                if (!metaToken) return handleConnectMeta();
                // Aqui abriria um seletor de contas do Meta
                const accounts = await fetchAdAccounts(metaToken);
                const selected = accounts[0]; // Simplificado para o exemplo
                setClients(prev => prev.map(c => c.id === id ? {
                  ...c,
                  metaAccountId: selected.id,
                  isSynced: true,
                  currentBalance: parseFloat(selected.amount_remaining) / 100
                } : c));
              }}
            />
          </div>
          <div className="space-y-8">
            <AIInsightsPanel insights={aiInsights} isLoading={isAnalyzing} onAnalyze={runAnalysis} />
            <NotificationHistory logs={logs} />
          </div>
        </div>
      </main>

      {isModalOpen && (
        <AddClientModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddClient}
        />
      )}
    </div>
  );
};

export default App;
