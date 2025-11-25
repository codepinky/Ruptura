import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Categorias padrão - 10 principais (5 receitas + 5 despesas)
export const DEFAULT_CATEGORIES = [
  // Receitas
  { name: 'Salário', type: 'income', color: '#10B981' },
  { name: 'Freelance', type: 'income', color: '#3B82F6' },
  { name: 'Investimentos', type: 'income', color: '#8B5CF6' },
  { name: 'Bônus', type: 'income', color: '#14B8A6' },
  { name: 'Outras Receitas', type: 'income', color: '#06B6D4' },
  
  // Despesas
  { name: 'Alimentação', type: 'expense', color: '#F59E0B' },
  { name: 'Transporte', type: 'expense', color: '#EF4444' },
  { name: 'Moradia', type: 'expense', color: '#6B7280' },
  { name: 'Saúde', type: 'expense', color: '#EC4899' },
  { name: 'Outras Despesas', type: 'expense', color: '#64748B' }
];

/**
 * Valida um código de licença
 * @param {string} licenseCode - Código de licença a ser validado
 * @returns {Promise<{valid: boolean, licenseDoc?: object, error?: string}>}
 */
export async function validateLicenseCode(licenseCode) {
  try {
    console.log('🔍 Validando código:', licenseCode);
    
    if (!licenseCode || licenseCode.trim() === '') {
      console.log('❌ Código vazio');
      return { valid: false, error: 'Código de licença é obrigatório' };
    }

    const codeToSearch = licenseCode.trim();
    console.log('🔍 Buscando código no campo Customer.codigo_unico:', codeToSearch);
    
    // Buscar pelo campo Customer.codigo_unico usando query
    const licensesRef = collection(db, 'licenses');
    
    // Tentar busca exata primeiro
    let q = query(licensesRef, where('Customer.codigo_unico', '==', codeToSearch));
    let querySnapshot = await getDocs(q);
    
    // Se não encontrou, tentar em minúsculas
    if (querySnapshot.empty) {
      console.log('🔍 Tentando em minúsculas:', codeToSearch.toLowerCase());
      q = query(licensesRef, where('Customer.codigo_unico', '==', codeToSearch.toLowerCase()));
      querySnapshot = await getDocs(q);
    }
    
    // Se ainda não encontrou, tentar em maiúsculas
    if (querySnapshot.empty) {
      console.log('🔍 Tentando em maiúsculas:', codeToSearch.toUpperCase());
      q = query(licensesRef, where('Customer.codigo_unico', '==', codeToSearch.toUpperCase()));
      querySnapshot = await getDocs(q);
    }

    if (querySnapshot.empty) {
      console.log('❌ Código não encontrado no Firestore');
      return { valid: false, error: 'Código de licença inválido' };
    }

    // Pegar o primeiro documento encontrado
    const licenseDoc = querySnapshot.docs[0];
    const licenseData = licenseDoc.data();
    const licenseId = licenseDoc.id;
    // Extrair o UUID original do campo Customer.codigo_unico
    const originalUUID = licenseData.Customer?.codigo_unico || codeToSearch;
    
    console.log('✅ Código encontrado! Documento ID:', licenseId);
    console.log('🔍 UUID original:', originalUUID);
    console.log('🔍 Dados do código:', licenseData);
    
    const validationResult = validateLicenseData(licenseData, licenseId);
    // Adicionar o UUID original ao resultado
    if (validationResult.valid) {
      validationResult.originalUUID = originalUUID;
    }
    return validationResult;
  } catch (error) {
    console.error('Erro ao validar código de licença:', error);
    return { valid: false, error: 'Erro ao validar código de licença. Tente novamente.' };
  }
}

/**
 * Valida os dados de uma licença encontrada
 * @param {object} licenseData - Dados da licença
 * @param {string} licenseId - ID do documento
 * @returns {{valid: boolean, licenseDoc?: object, error?: string}}
 */
function validateLicenseData(licenseData, licenseId) {
  // Verificar se já foi usado (campo pode estar no nível raiz ou não existir)
  if (licenseData.used === true) {
    return { valid: false, error: 'Este código de licença já foi utilizado' };
  }

  // Verificar status geral (se existir) - verificar 'used' também
  if (licenseData.status === 'used' || licenseData.status === 'revoked' || licenseData.status === 'expired') {
    return { valid: false, error: 'Este código de licença já foi utilizado ou não está mais válido' };
  }

  // Verificar status do pedido (pode estar em Order.order_status)
  const orderStatus = licenseData.Order?.order_status || licenseData.order_status;
  if (orderStatus === 'cancelled' || orderStatus === 'refunded') {
    return { valid: false, error: 'Este código de licença não está mais válido' };
  }

  // Verificar expiração (se existir)
  if (licenseData.expiresAt) {
    const expiresAt = licenseData.expiresAt.toDate ? licenseData.expiresAt.toDate() : new Date(licenseData.expiresAt);
    if (expiresAt < new Date()) {
      return { valid: false, error: 'Este código de licença expirou' };
    }
  }

  // Verificar número máximo de ativações (se existir)
  if (licenseData.maxActivations && licenseData.activationAttempts >= licenseData.maxActivations) {
    return { valid: false, error: 'Número máximo de ativações atingido' };
  }

  return { valid: true, licenseDoc: { id: licenseId, ...licenseData } };
}

/**
 * Marca um código de licença como usado
 * @param {string} originalUUID - UUID original do código de licença (Customer.codigo_unico)
 * @param {string} userId - ID do usuário que está usando o código
 * @returns {Promise<boolean>}
 */
export async function markLicenseAsUsed(originalUUID, userId) {
  try {
    const codeToSearch = originalUUID.trim();
    const licensesRef = collection(db, 'licenses');
    
    // Buscar pelo campo Customer.codigo_unico usando o UUID original
    let q = query(licensesRef, where('Customer.codigo_unico', '==', codeToSearch));
    let querySnapshot = await getDocs(q);
    
    // Se não encontrou, tentar em minúsculas
    if (querySnapshot.empty) {
      q = query(licensesRef, where('Customer.codigo_unico', '==', codeToSearch.toLowerCase()));
      querySnapshot = await getDocs(q);
    }
    
    // Se ainda não encontrou, tentar em maiúsculas
    if (querySnapshot.empty) {
      q = query(licensesRef, where('Customer.codigo_unico', '==', codeToSearch.toUpperCase()));
      querySnapshot = await getDocs(q);
    }
    
    if (querySnapshot.empty) {
      console.error('❌ Código não encontrado para marcar como usado:', codeToSearch);
      return false;
    }

    // Pegar o primeiro documento encontrado
    const licenseDoc = querySnapshot.docs[0];
    const licenseData = licenseDoc.data();
    const licenseId = licenseDoc.id;
    const licenseRef = doc(db, 'licenses', licenseId);
    
    // Verificar se já foi usado antes de marcar
    if (licenseData.used === true) {
      console.warn('⚠️ Código já estava marcado como usado:', codeToSearch);
      return false; // Retornar false para indicar que não foi possível marcar (já estava usado)
    }
    
    console.log('✅ Marcando código como usado. UUID:', codeToSearch, 'Documento ID:', licenseId);
    
    // Marcar como usado no nível raiz do documento
    await setDoc(licenseRef, {
      used: true,
      usedBy: userId,
      usedAt: serverTimestamp(),
      status: 'used',
      activationAttempts: (licenseData.activationAttempts || 0) + 1,
      lastActivationAttempt: serverTimestamp()
    }, { merge: true });
    
    console.log('✅ Código marcado como usado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao marcar código como usado:', error);
    return false;
  }
}

/**
 * Inicializa os dados padrão do usuário (categorias)
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
export async function initializeUserData(userId) {
  try {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    
    // Verificar se já existem categorias
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    // Se o usuário já tem categorias, não criar nada (respeita exclusões do usuário)
    if (!categoriesSnapshot.empty) {
      console.log('✅ Usuário já possui categorias. Não criando categorias padrão.');
      return true;
    }
    
    // Se não tem nenhuma categoria, criar as categorias padrão (primeira vez)
    console.log('🔵 Primeira inicialização: criando categorias padrão...');
    const promises = DEFAULT_CATEGORIES.map((category) => {
      const categoryRef = doc(categoriesRef);
      return setDoc(categoryRef, {
        ...category,
        id: categoryRef.id,
        createdAt: serverTimestamp()
      });
    });
    
    await Promise.all(promises);
    console.log(`✅ ${DEFAULT_CATEGORIES.length} categorias padrão criadas`);
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar dados do usuário:', error);
    return false;
  }
}

/**
 * Salva o código de licença no perfil do usuário
 * @param {string} userId - ID do usuário
 * @param {string} licenseCode - Código de licença
 * @returns {Promise<boolean>}
 */
export async function saveUserLicenseCode(userId, licenseCode) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      licenseCode: licenseCode.trim().toUpperCase(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar código de licença do usuário:', error);
    return false;
  }
}

