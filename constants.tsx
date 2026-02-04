
import { Client, Platform } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Equipe de Marketing A',
    company: 'Nexus Tech Brasil',
    platform: Platform.GOOGLE_ADS,
    currentBalance: 1250.50,
    dailySpend: 150.00,
    currency: 'BRL',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Unidade de Vendas 4',
    company: 'Energia Verde Co.',
    platform: Platform.META_ADS,
    currentBalance: 240.00,
    dailySpend: 85.00,
    currency: 'BRL',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Líder Social',
    company: 'Varejo Moderno',
    platform: Platform.TIKTOK_ADS,
    currentBalance: 50.00,
    dailySpend: 45.00,
    currency: 'BRL',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Crescimento Enterprise',
    company: 'Blue Chip Corp',
    platform: Platform.LINKEDIN_ADS,
    currentBalance: 5000.00,
    dailySpend: 200.00,
    currency: 'BRL',
    lastUpdated: new Date().toISOString(),
  }
];
