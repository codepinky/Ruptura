# Passo a Passo: Deploy no Firebase Hosting

## 🚀 Guia Rápido

### 1. Instalar Firebase CLI (se ainda não tiver)

```bash
npm install -g firebase-tools
```

### 2. Fazer Login

```bash
firebase login
```

Isso abrirá o navegador. Faça login com a conta do Google que criou o projeto Firebase.

### 3. Verificar se está no projeto correto

```bash
firebase projects:list
```

Você deve ver `ruptura-c81c4` na lista.

### 4. Fazer o Build

```bash
npm run build
```

Isso criará a pasta `dist` com os arquivos otimizados.

### 5. Fazer o Deploy

```bash
npm run deploy
```

Ou manualmente:

```bash
firebase deploy --only hosting
```

### 6. Acessar sua Aplicação

Após o deploy, você receberá uma URL como:
- `https://ruptura-c81c4.web.app`
- `https://ruptura-c81c4.firebaseapp.com`

## 📝 Verificações Antes do Deploy

### ✅ Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` tem todas as variáveis necessárias. O Vite usa essas variáveis durante o build.

### ✅ Testar o Build Localmente

```bash
npm run build
npm run preview
```

Isso permite testar a versão de produção localmente antes de fazer o deploy.

### ✅ Verificar se o Firebase está Configurado

Os arquivos `firebase.json` e `.firebaserc` já foram criados. Verifique se estão corretos.

## 🔄 Atualizações Futuras

Para atualizar a aplicação, simplesmente execute:

```bash
npm run deploy
```

Isso fará o build e o deploy automaticamente.

## 🐛 Troubleshooting

### Erro: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Erro: "Permission denied"
```bash
firebase login
```

### Erro: "Build failed"
- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique se não há erros no código
- Verifique o console para erros

### Aplicação não carrega
- Verifique se o `firebase.json` está correto
- Verifique se o build foi feito: `npm run build`
- Verifique os logs no Firebase Console

## 📚 Documentação Completa

Veja o arquivo `docs/firebase-hosting-guide.md` para mais detalhes.






