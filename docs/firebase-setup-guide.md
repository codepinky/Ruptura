# Guia de Configuração do Firebase

## Passo 1: Habilitar Authentication

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto: `ruptura-c81c4`
3. Vá em **Authentication** (no menu lateral)
4. Clique em **Get Started** (se for a primeira vez)
5. Vá na aba **Sign-in method**
6. Clique em **Email/Password**
7. **Habilite** o primeiro toggle (Email/Password)
8. **Opcional**: Habilite também "Email link (passwordless sign-in)" se quiser
9. Clique em **Save**

## Passo 2: Verificar Firestore

1. Vá em **Firestore Database**
2. Se ainda não criou, clique em **Create database**
3. Escolha o modo:
   - **Production mode** (recomendado) - depois configure as regras
   - **Test mode** (temporário para testes) - permite leitura/escrita por 30 dias
4. Escolha a localização (ex: `southamerica-east1` para Brasil)
5. Clique em **Enable**

## Passo 3: Configurar Regras do Firestore

1. Vá em **Firestore Database** > **Rules**
2. Cole as regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Licenças - leitura pública para validação
    match /licenses/{licenseCode} {
      allow read: if true;
      allow write: if false; // Apenas via Make/Admin
    }
    
    // Usuários - apenas o próprio usuário
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{collection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Bloquear tudo mais
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clique em **Publish**

## Passo 4: Verificar Variáveis de Ambiente

1. Certifique-se de que o arquivo `.env` está na raiz do projeto
2. Reinicie o servidor de desenvolvimento após criar/modificar o `.env`:
   ```bash
   npm run dev
   ```

## Checklist

- [ ] Authentication habilitado
- [ ] Email/Password habilitado como método de sign-in
- [ ] Firestore Database criado
- [ ] Regras do Firestore configuradas
- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] Servidor reiniciado após criar `.env`

