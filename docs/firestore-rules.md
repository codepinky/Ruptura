# Regras de Segurança do Firestore

## Como aplicar as regras

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto: `ruptura-c81c4`
3. Vá em **Firestore Database** > **Rules**
4. Cole as regras abaixo
5. Clique em **Publish**

## Regras Completas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // REGRAS PARA LICENÇAS
    // ============================================
    // Permite leitura pública para validação de códigos
    // Permite que usuários autenticados marquem códigos como usados
    match /licenses/{licenseCode} {
      // Qualquer um pode ler para validação de códigos
      allow read: if true;
      
      // Usuários autenticados podem atualizar apenas para marcar como usado
      // Verifica que os campos principais (Customer, Order, Product) não foram alterados
      allow update: if request.auth != null
        && request.resource.data.Customer == resource.data.Customer
        && request.resource.data.Order == resource.data.Order
        && request.resource.data.Product == resource.data.Product;
      
      // Criar e deletar apenas via Admin SDK ou Make
      allow create, delete: if false;
    }
    
    // ============================================
    // REGRAS PARA USUÁRIOS
    // ============================================
    // Cada usuário só pode acessar seus próprios dados
    match /users/{userId} {
      // Usuário autenticado só pode ler/escrever seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcoleções do usuário - mesma regra
      match /{collection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // ============================================
    // BLOQUEAR TUDO MAIS
    // ============================================
    // Qualquer outra coleção é bloqueada por padrão
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Regras Simplificadas (Para Desenvolvimento/Teste)

Se você quiser testar rapidamente, pode usar estas regras temporárias (NÃO USE EM PRODUÇÃO):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PERMISSÕES TEMPORÁRIAS - APENAS PARA TESTE
    // ⚠️ NÃO USE EM PRODUÇÃO ⚠️
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Regras Recomendadas para Produção

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Licenças - leitura pública, update de uso permitido para usuários autenticados
    match /licenses/{licenseCode} {
      allow read: if true;
      // Usuários autenticados podem atualizar apenas para marcar como usado
      // Verifica que os campos principais (Customer, Order, Product) não foram alterados
      allow update: if request.auth != null
        && request.resource.data.Customer == resource.data.Customer
        && request.resource.data.Order == resource.data.Order
        && request.resource.data.Product == resource.data.Product;
      // Criar e deletar apenas via Admin SDK ou Make
      allow create, delete: if false;
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

## Importante

- **Para desenvolvimento**: Use as regras simplificadas temporariamente
- **Para produção**: Use as regras recomendadas
- **Licenças**: Leitura pública permitida (para validação), escrita apenas via Make/Admin
- **Usuários**: Cada usuário só acessa seus próprios dados

