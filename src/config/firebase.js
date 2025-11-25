import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validar configuração
const missingConfig = [];
if (!firebaseConfig.apiKey) missingConfig.push('VITE_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingConfig.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingConfig.push('VITE_FIREBASE_PROJECT_ID');
if (!firebaseConfig.storageBucket) missingConfig.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missingConfig.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missingConfig.push('VITE_FIREBASE_APP_ID');

if (missingConfig.length > 0) {
  console.error('❌ Variáveis de ambiente do Firebase não encontradas:', missingConfig);
  console.error('🔧 Verifique se o arquivo .env existe e reinicie o servidor de desenvolvimento');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

