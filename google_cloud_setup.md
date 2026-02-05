# Guia de Configuração: Google Cloud (Calendar)

Siga este passo a passo para gerar as chaves que o Vercel precisa.

## 1. Criar o Projeto
1.  Acesse: [console.cloud.google.com](https://console.cloud.google.com/)
2.  No menu superior (ao lado da logo Google Cloud), clique no seletor de projetos.
3.  Clique em **"NOVO PROJETO"** (canto superior direito da janelinha).
4.  Nome do Projeto: `Phoenix Budget`.
5.  Clique em **CRIAR**.
6.  Aguarde rodar e **selecione o projeto** recém-criado no topo.

## 2. Ativar a API do Calendar
1.  No menu lateral (hambúrguer), vá em **"APIs e serviços"** > **"Biblioteca"**.
2.  Na barra de busca, digite: `Google Calendar API`.
3.  Clique no resultado e depois no botão azul **ATIVAR**.

## 3. Configurar a Tela de Permissão (OAuth Consent Screen)
*(Isso é necessário para criar o Client ID)*
1.  No menu lateral, vá em **"APIs e serviços"** > **"Tela de permissão OAuth"**.
2.  Selecione **User Type**: **Externo** e clique em **CRIAR**.
3.  **Informações do App**:
    *   **Nome do App**: `Phoenix Budget`
    *   **Email de suporte**: (Seu email)
    *   **Dados de contato do desenvolvedor**: (Seu email)
4.  Clique em **SALVAR E CONTINUAR** nas próximas telas (não precisa adicionar escopos agora).
5.  Em **Usuários de teste**, clique em **ADD USERS** e adicione seu próprio email (importante para testar).

## 4. Criar as Chaves (Fase Final)
Agora vá no menu lateral em **"Credenciais"**.

### A. Criar API Key (`VITE_GOOGLE_API_KEY`)
1.  Clique em **"+ CRIAR CREDENCIAIS"** (topo) > **"Chave de API"**.
2.  Vai aparecer uma chave longa. **Copie essa chave.**
3.  Essa será sua `VITE_GOOGLE_API_KEY`.

### B. Criar Client ID (`VITE_GOOGLE_CLIENT_ID`)
1.  Clique em **"+ CRIAR CREDENCIAIS"** > **"ID do cliente OAuth"**.
2.  **Tipo de Aplicativo**: Aplicação da Web.
3.  **Nome**: `Phoenix Vercel` (ou o que preferir).
4.  **Origens JavaScript autorizadas** (MUITO IMPORTANTE):
    *   Clique em **ADICIONAR URI**.
    *   Cole a URL do seu site no Vercel: `https://phoenix-budget.vercel.app`
    *   (Opcional) Adicione também `http://localhost:5173` para testar no seu computador.
5.  **URIs de redirecionamento autorizados**:
    *   Cole a mesma URL do Vercel: `https://phoenix-budget.vercel.app`
6.  Clique em **CRIAR**.
7.  Copie o **"O seu ID de cliente"**.
8.  Esse será seu `VITE_GOOGLE_CLIENT_ID`.

---

## Passo Final (Vercel)
Agora que você tem as duas chaves:
1.  Vá no **Vercel** -> Settings -> Environment Variables.
2.  Adicione/Atualize:
    *   `VITE_GOOGLE_API_KEY` = (A chave do passo 4.A)
    *   `VITE_GOOGLE_CLIENT_ID` = (A chave do passo 4.B)
3.  Faça o **Redeploy** no Vercel.
