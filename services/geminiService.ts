
import { GoogleGenAI, Type } from "@google/genai";
import { Client, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartInsights = async (clients: Client[]) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Como um especialista em Mídia Paga e Gestor de Orçamentos, analise os seguintes saldos de clientes e padrões de gastos.
    Dados dos Clientes: ${JSON.stringify(clients)}
    
    Tarefas:
    1. Identifique clientes que precisam de atenção imediata (saldo acaba em < 3 dias).
    2. Forneça uma recomendação breve para cada cliente crítico.
    3. Gere um "Resumo Diário" em um tom profissional e encorajador em português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
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

    return JSON.parse(response.text);
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
