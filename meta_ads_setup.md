# Guia de Configuração: Meta Ads (Facebook)

Para o botão "Conectar Meta" funcionar, você precisa criar um Aplicativo no painel de desenvolvedor do Facebook.

## 1. Criar o Aplicativo
1.  Acesse: [developers.facebook.com/apps](https://developers.facebook.com/apps)
2.  Clique no botão verde **"Criar aplicativo"**.
3.  **O que você quer que seu aplicativo faça?**
    *   Escolha **"Outro"** (ou "Outros" / "Nenhum").
    *   Clique em **Avançar**.
4.  **Selecione um tipo de aplicativo:**
    *   Escolha **"Empresa"** (Business).
    *   Clique em **Avançar**.
5.  **Detalhes:**
    *   **Nome do app:** `Phoenix Budget`
    *   **Email de contato:** (Seu email)
    *   **Conta empresarial:** (Selecione sua conta de anúncios/business se aparecer, ou pule).
    *   Clique em **Criar aplicativo**. (Vai pedir sua senha do Facebook).

## 2. Configurar o Login do Facebook
1.  No painel do novo app, procure por **"Login do Facebook"** na lista de produtos.
2.  Clique no botão **"Configurar"** (Setup).
3.  Selecione **Web** (WWW).
4.  **URL do Site:**
    *   Cole o link do Vercel: `https://phoenix-budget.vercel.app`
    *   Clique em **Save** -> **Continue** -> **Next** até terminar.

## 3. Ajustes Finais de URL (Importante)
2.  No menu lateral esquerdo, vá em **Login do Facebook** -> **Configurações** (Settings).
3.  **URIs de redirecionamento do OAuth válidos:**
    *   Adicione: `https://phoenix-budget.vercel.app/`
    *   (Opcional) Adicione: `http://localhost:5173/` (para testes locais)
4.  Clique em **Salvar alterações** (lá embaixo no canto).

## 4. Pegar o APP ID
1.  No menu lateral esquerdo, vá em **Configurações** -> **Básico**.
2.  Copie o **ID do Aplicativo** (App ID).
    *   (É um número, não a chave secreta).

---

## 5. Colocar no Vercel
1.  Vá no **Vercel** -> Settings -> Environment Variables.
2.  Adicione uma nova variável:
    *   **Key:** `VITE_META_APP_ID`
    *   **Value:** (Cole o número do ID que você copiou).
3.  **Salve** e faça o **Redeploy** (como fizemos antes).
