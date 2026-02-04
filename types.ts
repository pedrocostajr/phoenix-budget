
export enum Platform {
  GOOGLE_ADS = 'Google Ads',
  META_ADS = 'Meta Ads',
  TIKTOK_ADS = 'TikTok Ads',
  LINKEDIN_ADS = 'LinkedIn Ads',
}

export interface Client {
  id: string;
  name: string;
  company: string;
  platform: Platform;
  currentBalance: number;
  dailySpend: number;
  currency: string;
  lastUpdated: string;
  metaAccountId?: string; // ID da conta no Meta Ads para sincronização
  isSynced?: boolean;     // Indica se está puxando dados da API
}

export interface NotificationLog {
  id: string;
  clientId: string;
  clientName: string;
  type: 'CALENDAR';
  timestamp: string;
  status: 'SENT' | 'FAILED';
  message: string;
}

export interface PredictionResult {
  clientId: string;
  daysRemaining: number;
  depletionDate: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}
