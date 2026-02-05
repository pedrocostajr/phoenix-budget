
/**
 * Serviço para integração com Meta Ads API
 */

declare const FB: any;

export interface MetaAdAccount {
  id: string;
  name: string;
  amount_remaining: string;
  currency: string;
  account_status: number;
}

const META_APP_ID = import.meta.env.VITE_META_APP_ID;

export const initMetaSDK = () => {
  return new Promise((resolve) => {
    (window as any).fbAsyncInit = function () {
      FB.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      resolve(true);
    };
  });
};

export const loginWithFacebook = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    FB.login((response: any) => {
      if (response.authResponse) {
        resolve(response.authResponse.accessToken);
      } else {
        reject('Usuário cancelou o login ou não autorizou.');
      }
    }, { scope: 'ads_read,ads_management' });
  });
};

export const fetchAdAccounts = async (accessToken: string): Promise<MetaAdAccount[]> => {
  // Chamada para buscar contas de anúncios do usuário
  // Em um cenário real, usaríamos fetch(https://graph.facebook.com/v18.0/me/adaccounts?access_token=...)
  // Simulando resposta da API para demonstração:
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'act_123456789',
          name: 'Conta Principal Nexus',
          amount_remaining: '250050', // em centavos
          currency: 'BRL',
          account_status: 1
        },
        {
          id: 'act_987654321',
          name: 'Varejo Moderno Ads',
          amount_remaining: '45000',
          currency: 'BRL',
          account_status: 1
        }
      ]);
    }, 1000);
  });
};

export const getAdAccountBalance = async (accountId: string, accessToken: string): Promise<number> => {
  // Simulação de busca de saldo em tempo real
  // Na API real: GET /v18.0/{accountId}?fields=amount_remaining
  console.log(`Buscando saldo real para ${accountId} no Meta...`);
  const accounts = await fetchAdAccounts(accessToken);
  const account = accounts.find(a => a.id === accountId);
  return account ? parseFloat(account.amount_remaining) / 100 : 0;
};
