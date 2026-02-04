
import { supabase } from './supabaseClient';
import { Client } from '../types';

export const fetchClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*');

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }

    // Transformation map to match frontend types if snake_case is used in DB
    return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        company: d.company,
        platform: d.platform,
        currentBalance: d.current_balance,
        dailySpend: d.daily_spend,
        currency: d.currency,
        lastUpdated: d.last_updated,
        metaAccountId: d.meta_account_id,
        isSynced: d.is_synced
    }));
};

export const createClient = async (client: Omit<Client, 'id'>) => {
    const dbClient = {
        name: client.name,
        company: client.company,
        platform: client.platform,
        current_balance: client.currentBalance,
        daily_spend: client.dailySpend,
        currency: client.currency,
        last_updated: client.lastUpdated,
        meta_account_id: client.metaAccountId,
        is_synced: client.isSynced
    };

    const { data, error } = await supabase
        .from('clients')
        .insert([dbClient])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return {
        ...client,
        id: data.id, // Return with new ID
        currentBalance: data.current_balance // Ensure number consistency
    };
};

export const updateClientBalance = async (id: string, newBalance: number) => {
    const { error } = await supabase
        .from('clients')
        .update({
            current_balance: newBalance,
            last_updated: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        throw error;
    }
};
