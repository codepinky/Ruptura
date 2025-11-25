import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { validateLicenseCode, markLicenseAsUsed, initializeUserData, saveUserLicenseCode } from '../utils/firebaseUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar dados adicionais do usuário no Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              ...user,
              ...userDoc.data()
            });
          } else {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Função de registro
  async function register(email, password, displayName, licenseCode) {
    try {
      setError(null);
      setLoading(true);

      console.log('🔵 Iniciando registro...', { email, licenseCode });

      // Validar código de licença
      console.log('🔵 Validando código de licença...');
      const licenseValidation = await validateLicenseCode(licenseCode);
      console.log('🔵 Resultado da validação:', licenseValidation);
      
      if (!licenseValidation.valid) {
        const errorMsg = licenseValidation.error || 'Código de licença inválido';
        console.error('❌ Código inválido:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return null;
      }

      console.log('✅ Código válido! Criando usuário...');

      // Criar usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Usuário criado no Auth:', user.uid);

      // Atualizar perfil com nome
      if (displayName) {
        await updateProfile(user, { displayName });
        console.log('✅ Perfil atualizado');
      }

      // Enviar email de verificação
      await sendEmailVerification(user);
      console.log('✅ Email de verificação enviado');

      // Usar o UUID original do código (não o ID do documento)
      const originalUUID = licenseValidation.originalUUID || licenseCode.trim();
      console.log('🔵 Usando UUID original:', originalUUID);

      // Marcar código de licença como usado ANTES de criar o usuário
      // Isso garante que se houver erro, o código não fique "preso"
      console.log('🔵 Marcando código como usado...');
      const marked = await markLicenseAsUsed(originalUUID, user.uid);
      if (!marked) {
        console.error('❌ Falha ao marcar código como usado. Abortando registro.');
        setError('Erro ao processar código de licença. Tente novamente.');
        setLoading(false);
        // Tentar deletar o usuário criado se possível
        try {
          await user.delete();
        } catch (deleteError) {
          console.error('Erro ao deletar usuário após falha:', deleteError);
        }
        return null;
      }
      console.log('✅ Código marcado como usado:', marked);

      // Salvar código de licença no perfil do usuário (usando UUID original)
      console.log('🔵 Salvando código no perfil do usuário...');
      await saveUserLicenseCode(user.uid, originalUUID);
      console.log('✅ Código salvo no perfil:', originalUUID);

      // Criar documento do usuário no Firestore
      console.log('🔵 Criando documento do usuário no Firestore...');
      const userDocData = {
        email: user.email,
        displayName: displayName || user.displayName,
        licenseCode: originalUUID, // Usar UUID original, não o ID do documento
        emailVerified: user.emailVerified,
        createdAt: new Date().toISOString()
      };
      console.log('🔵 Dados do documento:', userDocData);
      
      await setDoc(doc(db, 'users', user.uid), userDocData);
      console.log('✅ Documento do usuário criado no Firestore:', user.uid);

      // Inicializar dados padrão (categorias)
      console.log('🔵 Inicializando dados padrão...');
      await initializeUserData(user.uid);
      console.log('✅ Dados padrão inicializados');

      console.log('✅✅✅ Registro completo com sucesso!');
      setLoading(false);
      return user;
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem do erro:', error.message);
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code) {
        errorMessage = `Erro: ${error.code} - ${error.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }

  // Função de login
  async function login(email, password) {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Buscar dados adicionais do usuário
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setCurrentUser({
          ...user,
          ...userDoc.data()
        });
      } else {
        setCurrentUser(user);
      }

      setLoading(false);
      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }

  // Função de logout
  async function logout() {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      setError('Erro ao fazer logout. Tente novamente.');
    }
  }

  // Função de recuperação de senha
  async function resetPassword(email) {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      let errorMessage = 'Erro ao enviar email de recuperação.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      }
      
      setError(errorMessage);
      return false;
    }
  }

  // Função de reenvio de verificação de email
  async function resendVerificationEmail() {
    try {
      setError(null);
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao reenviar email de verificação:', error);
      setError('Erro ao reenviar email de verificação.');
      return false;
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

