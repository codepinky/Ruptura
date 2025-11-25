# Guia de Hospedagem no Firebase Hosting

## Pré-requisitos

1. Ter o Firebase CLI instalado
2. Ter o projeto configurado no Firebase Console
3. Ter as credenciais do Firebase configuradas

## Passo 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

## Passo 2: Fazer Login no Firebase

```bash
firebase login
```

Isso abrirá o navegador para autenticação. Faça login com a conta do Google que criou o projeto Firebase.

## Passo 3: Inicializar o Firebase Hosting no Projeto

No diretório raiz do projeto, execute:

```bash
firebase init hosting
```

### Durante a inicialização, você será perguntado:

1. **"What do you want to use as your public directory?"**
   - Digite: `dist` (diretório de build do Vite)

2. **"Configure as a single-page app (rewrite all urls to /index.html)?"**
   - Digite: `Yes` (importante para React Router)

3. **"Set up automatic builds and deploys with GitHub?"**
   - Digite: `No` (por enquanto, pode configurar depois)

4. **"File dist/index.html already exists. Overwrite?"**
   - Digite: `No` (não sobrescrever)

## Passo 4: Configurar o Build

O Firebase criou um arquivo `firebase.json`. Verifique se está assim:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Passo 5: Build da Aplicação

Antes de fazer o deploy, você precisa fazer o build da aplicação:

```bash
npm run build
```

Isso criará a pasta `dist` com os arquivos otimizados para produção.

## Passo 6: Fazer o Deploy

```bash
firebase deploy --only hosting
```

Ou para fazer deploy de tudo (se tiver outras configurações):

```bash
firebase deploy
```

## Passo 7: Acessar sua Aplicação

Após o deploy, você receberá uma URL como:
```
https://ruptura-c81c4.web.app
```
ou
```
https://ruptura-c81c4.firebaseapp.com
```

## Configurações Adicionais

### Domínio Personalizado

1. No Firebase Console, vá em **Hosting**
2. Clique em **Adicionar domínio personalizado**
3. Siga as instruções para configurar o DNS

### Variáveis de Ambiente em Produção

Para variáveis de ambiente em produção, você pode:

1. **Opção 1: Usar o Firebase Functions** (mais seguro)
2. **Opção 2: Criar um arquivo `.env.production`** (menos seguro, mas mais simples)

Para a Opção 2, crie `.env.production` na raiz:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=ruptura-c81c4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ruptura-c81c4
VITE_FIREBASE_STORAGE_BUCKET=ruptura-c81c4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=528397315430
VITE_FIREBASE_APP_ID=1:528397315430:web:3bd4aa72a01dfcb3a2aca7
```

⚠️ **IMPORTANTE**: As variáveis de ambiente do Vite são expostas no cliente. Isso é normal para credenciais do Firebase, mas não coloque chaves secretas aqui.

## Scripts Úteis

Adicione estes scripts no `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

## Troubleshooting

### Erro: "Firebase CLI not found"
- Instale: `npm install -g firebase-tools`

### Erro: "Build failed"
- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique se não há erros no código: `npm run build`

### Erro: "Permission denied"
- Verifique se você está logado: `firebase login`
- Verifique se você tem permissões no projeto Firebase

### Aplicação não carrega após deploy
- Verifique se o `firebase.json` está configurado corretamente
- Verifique se o build foi feito: `npm run build`
- Verifique os logs no Firebase Console

## Atualizações Futuras

Para atualizar a aplicação:

```bash
npm run build
firebase deploy --only hosting
```

Ou use o script personalizado:

```bash
npm run deploy
```






