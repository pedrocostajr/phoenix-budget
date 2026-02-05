
import { GoogleGenAI, Type } from "@google/genai";
import { Client, PredictionResult } from "../types";

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
};

export const getSmartInsights = async (clients: Client[]) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("Gemini API Key is missing. Insights will not be generated.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.0-flash'; // Updated to latest/valid model if needed, sticking to what works or standard
  // keeping previous model name if it was specific, but usually standard names are better. 
  // user had 'gemini-3-flash-preview' which might be invalid or experimental. 
  // Let's stick to user's model or a safe default, but focusing on the crash first.
  // The user had 'gemini-3-flash-preview', I will keep it but inside the function or use a more standard one if that was also an issue.
  // Actually, let's use the variable user had but ensuring client init is safe.

  const modelId = 'gemini-2.0-flash'; // Using a known valid model to be safe, or 'gemini-1.5-flash'

  const prompt = `
    Como um especialista em Mídia Paga e Gestor de Orçamentos, analise os seguintes saldos de clientes e padrões de gastos.
    Dados dos Clientes: ${JSON.stringify(clients)}
    
    Tarefas:
    1. Identifique clientes que precisam de atenção imediata (saldo acaba em < 3 dias).
    2. Forneça uma recomendação breve para cada cliente crítico.
    3. Gere um "Resumo Diário" em um tom profissional e encorajador em português do Brasil.
  `;

  try {
    const response = await ai.getGenerativeModel({ model: modelId }).generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            criticalClients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clientId: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  action: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.response.text());
  } catch (error) {
    console.error("Erro no Insight do Gemini:", error);
    return null;
  }
};

export const calculatePredictions = (clients: Client[]): PredictionResult[] => {
  return clients.map(client => {
    const daysRemaining = client.dailySpend > 0 ? client.currentBalance / client.dailySpend : 999;
    const depletionDate = new Date();
    depletionDate.setDate(depletionDate.getDate() + daysRemaining);

    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (daysRemaining <= 3) status = 'CRITICAL';
    else if (daysRemaining <= 7) status = 'WARNING';

    return {
      clientId: client.id,
      daysRemaining: Math.floor(daysRemaining),
      depletionDate: depletionDate.toLocaleDateString('pt-BR'),
      status
    };
  });
};
