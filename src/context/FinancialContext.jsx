import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react';

// Tipos de transação
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Categorias padrão
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Salário', type: TRANSACTION_TYPES.INCOME, color: '#10B981' },
  { id: 2, name: 'Freelance', type: TRANSACTION_TYPES.INCOME, color: '#3B82F6' },
  { id: 3, name: 'Investimentos', type: TRANSACTION_TYPES.INCOME, color: '#8B5CF6' },
  { id: 4, name: 'Alimentação', type: TRANSACTION_TYPES.EXPENSE, color: '#F59E0B' },
  { id: 5, name: 'Transporte', type: TRANSACTION_TYPES.EXPENSE, color: '#EF4444' },
  { id: 6, name: 'Moradia', type: TRANSACTION_TYPES.EXPENSE, color: '#6B7280' },
  { id: 7, name: 'Saúde', type: TRANSACTION_TYPES.EXPENSE, color: '#EC4899' },
  { id: 8, name: 'Educação', type: TRANSACTION_TYPES.EXPENSE, color: '#14B8A6' },
  { id: 9, name: 'Lazer', type: TRANSACTION_TYPES.EXPENSE, color: '#F97316' },
  { id: 10, name: 'Outros', type: TRANSACTION_TYPES.EXPENSE, color: '#64748B' },
  { id: 11, name: 'Roupas', type: TRANSACTION_TYPES.EXPENSE, color: '#F43F5E' },
  { id: 12, name: 'Tecnologia', type: TRANSACTION_TYPES.EXPENSE, color: '#06B6D4' },
  { id: 13, name: 'Academia', type: TRANSACTION_TYPES.EXPENSE, color: '#84CC16' },
  { id: 14, name: 'Streaming', type: TRANSACTION_TYPES.EXPENSE, color: '#8B5CF6' },
  { id: 15, name: 'Combustível', type: TRANSACTION_TYPES.EXPENSE, color: '#F97316' },
  { id: 16, name: 'Presentes', type: TRANSACTION_TYPES.EXPENSE, color: '#EC4899' },
  { id: 17, name: 'Farmácia', type: TRANSACTION_TYPES.EXPENSE, color: '#14B8A6' },
  { id: 18, name: 'Viagem', type: TRANSACTION_TYPES.EXPENSE, color: '#3B82F6' },
  { id: 19, name: 'Café', type: TRANSACTION_TYPES.EXPENSE, color: '#F59E0B' },
  { id: 20, name: 'Bônus', type: TRANSACTION_TYPES.INCOME, color: '#10B981' }
];

// Estado inicial
const initialState = {
  transactions: [
    // Junho 2025
    { id: 1, description: 'Salário Junho', amount: 4500.00, type: TRANSACTION_TYPES.INCOME, categoryId: 1, date: '2025-06-05', notes: 'Salário mensal' },
    { id: 2, description: 'Supermercado Extra', amount: 280.50, type: TRANSACTION_TYPES.EXPENSE, categoryId: 4, date: '2025-06-08', notes: 'Compras da semana' },
    { id: 3, description: 'Uber', amount: 35.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 5, date: '2025-06-10', notes: 'Viagem para trabalho' },
    { id: 4, description: 'Netflix', amount: 45.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 14, date: '2025-06-15', notes: 'Assinatura mensal' },
    { id: 5, description: 'Academia Smart Fit', amount: 89.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 13, date: '2025-06-15', notes: 'Mensalidade academia' },
    { id: 6, description: 'Conta de Luz', amount: 185.30, type: TRANSACTION_TYPES.EXPENSE, categoryId: 6, date: '2025-06-20', notes: 'Conta mensal energia' },
    { id: 7, description: 'Farmácia', amount: 125.80, type: TRANSACTION_TYPES.EXPENSE, categoryId: 17, date: '2025-06-22', notes: 'Medicamentos' },
    { id: 8, description: 'Cinema', amount: 45.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 9, date: '2025-06-25', notes: 'Ingresso filme' },
    { id: 9, description: 'Freelance Design', amount: 800.00, type: TRANSACTION_TYPES.INCOME, categoryId: 2, date: '2025-06-28', notes: 'Projeto logo empresa' },
    { id: 10, description: 'Café Starbucks', amount: 18.50, type: TRANSACTION_TYPES.EXPENSE, categoryId: 19, date: '2025-06-30', notes: 'Café da manhã' },

    // Julho 2025
    { id: 11, description: 'Salário Julho', amount: 4500.00, type: TRANSACTION_TYPES.INCOME, categoryId: 1, date: '2025-07-05', notes: 'Salário mensal' },
    { id: 12, description: 'Supermercado Pão de Açúcar', amount: 320.75, type: TRANSACTION_TYPES.EXPENSE, categoryId: 4, date: '2025-07-08', notes: 'Compras mensais' },
    { id: 13, description: 'Gasolina', amount: 180.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 15, date: '2025-07-10', notes: 'Abastecimento carro' },
    { id: 14, description: 'Spotify', amount: 21.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 14, date: '2025-07-15', notes: 'Assinatura música' },
    { id: 15, description: 'Academia Smart Fit', amount: 89.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 13, date: '2025-07-15', notes: 'Mensalidade academia' },
    { id: 16, description: 'Conta de Água', amount: 95.20, type: TRANSACTION_TYPES.EXPENSE, categoryId: 6, date: '2025-07-20', notes: 'Conta mensal água' },
    { id: 17, description: 'Roupas Renner', amount: 280.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 11, date: '2025-07-22', notes: 'Camisas e calças' },
    { id: 18, description: 'Restaurante', amount: 95.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 4, date: '2025-07-25', notes: 'Jantar com namorada' },
    { id: 19, description: 'Presente Dia dos Namorados', amount: 150.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 16, date: '2025-07-14', notes: 'Presente especial' },
    { id: 20, description: 'Investimento CDB', amount: 1000.00, type: TRANSACTION_TYPES.INCOME, categoryId: 3, date: '2025-07-28', notes: 'Rendimento investimento' },

    // Agosto 2025
    { id: 21, description: 'Salário Agosto', amount: 4500.00, type: TRANSACTION_TYPES.INCOME, categoryId: 1, date: '2025-08-05', notes: 'Salário mensal' },
    { id: 22, description: 'Supermercado Atacadão', amount: 195.30, type: TRANSACTION_TYPES.EXPENSE, categoryId: 4, date: '2025-08-08', notes: 'Compras básicas' },
    { id: 23, description: 'Uber', amount: 42.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 5, date: '2025-08-10', notes: 'Viagem aeroporto' },
    { id: 24, description: 'Netflix', amount: 45.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 14, date: '2025-08-15', notes: 'Assinatura mensal' },
    { id: 25, description: 'Academia Smart Fit', amount: 89.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 13, date: '2025-08-15', notes: 'Mensalidade academia' },
    { id: 26, description: 'Conta de Luz', amount: 210.45, type: TRANSACTION_TYPES.EXPENSE, categoryId: 6, date: '2025-08-20', notes: 'Conta mensal energia' },
    { id: 27, description: 'Farmácia', amount: 85.60, type: TRANSACTION_TYPES.EXPENSE, categoryId: 17, date: '2025-08-22', notes: 'Vitamina D' },
    { id: 28, description: 'Cinema', amount: 50.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 9, date: '2025-08-25', notes: 'Ingresso + pipoca' },
    { id: 29, description: 'Freelance Web', amount: 1200.00, type: TRANSACTION_TYPES.INCOME, categoryId: 2, date: '2025-08-28', notes: 'Site e-commerce' },
    { id: 30, description: 'Café', amount: 12.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 19, date: '2025-08-30', notes: 'Café expresso' },

    // Setembro 2025
    { id: 31, description: 'Salário Setembro', amount: 4500.00, type: TRANSACTION_TYPES.INCOME, categoryId: 1, date: '2025-09-05', notes: 'Salário mensal' },
    { id: 32, description: 'Supermercado Extra', amount: 245.80, type: TRANSACTION_TYPES.EXPENSE, categoryId: 4, date: '2025-09-08', notes: 'Compras da semana' },
    { id: 33, description: 'Gasolina', amount: 165.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 15, date: '2025-09-10', notes: 'Abastecimento' },
    { id: 34, description: 'Spotify', amount: 21.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 14, date: '2025-09-15', notes: 'Assinatura música' },
    { id: 35, description: 'Academia Smart Fit', amount: 89.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 13, date: '2025-09-15', notes: 'Mensalidade academia' },
    { id: 36, description: 'Conta de Água', amount: 78.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 6, date: '2025-09-20', notes: 'Conta mensal água' },
    { id: 37, description: 'Tênis Nike', amount: 350.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 11, date: '2025-09-22', notes: 'Tênis corrida' },
    { id: 38, description: 'Restaurante', amount: 120.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 4, date: '2025-09-25', notes: 'Almoço família' },
    { id: 39, description: 'Bônus Trimestral', amount: 800.00, type: TRANSACTION_TYPES.INCOME, categoryId: 20, date: '2025-09-30', notes: 'Bônus Q3' },
    { id: 40, description: 'Investimento', amount: 750.00, type: TRANSACTION_TYPES.INCOME, categoryId: 3, date: '2025-09-28', notes: 'Rendimento CDB' },

    // Outubro 2025 (mês atual)
    { id: 41, description: 'Salário Outubro', amount: 4500.00, type: TRANSACTION_TYPES.INCOME, categoryId: 1, date: '2025-10-05', notes: 'Salário mensal' },
    { id: 42, description: 'Supermercado Pão de Açúcar', amount: 310.25, type: TRANSACTION_TYPES.EXPENSE, categoryId: 4, date: '2025-10-08', notes: 'Compras mensais' },
    { id: 43, description: 'Uber', amount: 28.50, type: TRANSACTION_TYPES.EXPENSE, categoryId: 5, date: '2025-10-10', notes: 'Viagem centro' },
    { id: 44, description: 'Netflix', amount: 45.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 14, date: '2025-10-15', notes: 'Assinatura mensal' },
    { id: 45, description: 'Academia Smart Fit', amount: 89.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 13, date: '2025-10-15', notes: 'Mensalidade academia' },
    { id: 46, description: 'Conta de Luz', amount: 195.60, type: TRANSACTION_TYPES.EXPENSE, categoryId: 6, date: '2025-10-20', notes: 'Conta mensal energia' },
    { id: 47, description: 'Farmácia', amount: 95.40, type: TRANSACTION_TYPES.EXPENSE, categoryId: 17, date: '2025-10-22', notes: 'Medicamentos' },
    { id: 48, description: 'Cinema', amount: 38.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 9, date: '2025-10-25', notes: 'Ingresso filme' },
    { id: 49, description: 'Freelance App', amount: 1500.00, type: TRANSACTION_TYPES.INCOME, categoryId: 2, date: '2025-10-28', notes: 'App mobile' },
    { id: 50, description: 'Café', amount: 15.50, type: TRANSACTION_TYPES.EXPENSE, categoryId: 19, date: '2025-10-30', notes: 'Café manhã' },

    // Transações extras variadas
    { id: 51, description: 'Livro Amazon', amount: 45.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 8, date: '2025-07-15', notes: 'Livro programação' },
    { id: 52, description: 'Curso Online', amount: 199.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 8, date: '2025-08-10', notes: 'Curso React' },
    { id: 53, description: 'Smartphone', amount: 1200.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 12, date: '2025-09-15', notes: 'iPhone usado' },
    { id: 54, description: 'Viagem SP', amount: 450.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 18, date: '2025-10-20', notes: 'Fim de semana SP' },
    { id: 55, description: 'Presente Mãe', amount: 180.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 16, date: '2025-10-12', notes: 'Dia das Mães' },
    { id: 56, description: 'Freelance SEO', amount: 600.00, type: TRANSACTION_TYPES.INCOME, categoryId: 2, date: '2025-10-10', notes: 'Otimização site' },
    { id: 57, description: 'Livro Kindle', amount: 29.90, type: TRANSACTION_TYPES.EXPENSE, categoryId: 8, date: '2025-10-15', notes: 'E-book finanças' },
    { id: 58, description: 'Festa Aniversário', amount: 200.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 9, date: '2025-10-20', notes: 'Festa amigo' },
    { id: 59, description: 'Consulta Médica', amount: 150.00, type: TRANSACTION_TYPES.EXPENSE, categoryId: 7, date: '2025-10-25', notes: 'Check-up anual' },
    { id: 60, description: 'Bônus Performance', amount: 500.00, type: TRANSACTION_TYPES.INCOME, categoryId: 20, date: '2025-10-30', notes: 'Meta atingida' }
  ],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  goals: [
    {
      id: 1,
      name: 'Reserva de Emergência',
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: '2025-12-31',
      type: 'emergency',
      priority: 'high',
      description: 'Fundos para emergências - 6 meses de gastos',
      createdAt: '2025-01-01'
    },
    {
      id: 2,
      name: 'Viagem Europa',
      targetAmount: 8000,
      currentAmount: 3200,
      deadline: '2025-08-15',
      type: 'vacation',
      priority: 'high',
      description: 'Viagem de 15 dias para França e Itália',
      createdAt: '2025-01-01'
    },
    {
      id: 3,
      name: 'Notebook Gamer',
      targetAmount: 3500,
      currentAmount: 2100,
      deadline: '2025-07-30',
      type: 'other',
      priority: 'medium',
      description: 'Notebook para trabalho e jogos',
      createdAt: '2025-02-15'
    },
    {
      id: 4,
      name: 'Curso de Especialização',
      targetAmount: 1200,
      currentAmount: 1200,
      deadline: '2025-06-30',
      type: 'education',
      priority: 'high',
      description: 'Curso de Data Science online',
      createdAt: '2025-03-01'
    },
    {
      id: 5,
      name: 'Moto Nova',
      targetAmount: 12000,
      currentAmount: 4500,
      deadline: '2026-03-31',
      type: 'car',
      priority: 'medium',
      description: 'Moto Honda CB 600F',
      createdAt: '2025-04-01'
    },
    {
      id: 6,
      name: 'Apartamento',
      targetAmount: 50000,
      currentAmount: 8500,
      deadline: '2027-12-31',
      type: 'home',
      priority: 'low',
      description: 'Entrada para apartamento próprio',
      createdAt: '2025-01-01'
    },
    {
      id: 7,
      name: 'Festival de Música',
      targetAmount: 800,
      currentAmount: 800,
      deadline: '2025-07-20',
      type: 'vacation',
      priority: 'medium',
      description: 'Rock in Rio 2025',
      createdAt: '2025-05-01'
    },
    {
      id: 8,
      name: 'Investimento Ações',
      targetAmount: 5000,
      currentAmount: 1800,
      deadline: '2025-12-31',
      type: 'investment',
      priority: 'medium',
      description: 'Portfolio diversificado de ações',
      createdAt: '2025-02-01'
    }
  ],
  savings: [
    {
      id: 1,
      name: 'Reserva de Emergência',
      amount: 800,
      frequency: 'monthly',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      category: 'emergency',
      active: true
    },
    {
      id: 2,
      name: 'Viagem Europa',
      amount: 600,
      frequency: 'monthly',
      startDate: '2025-01-01',
      endDate: '2025-08-15',
      category: 'vacation',
      active: true
    },
    {
      id: 3,
      name: 'Notebook Gamer',
      amount: 300,
      frequency: 'monthly',
      startDate: '2025-02-15',
      endDate: '2025-07-30',
      category: 'other',
      active: true
    },
    {
      id: 4,
      name: 'Investimento Semanal',
      amount: 150,
      frequency: 'weekly',
      startDate: '2025-03-01',
      endDate: '2025-12-31',
      category: 'investment',
      active: true
    },
    {
      id: 5,
      name: 'Moto Nova',
      amount: 500,
      frequency: 'monthly',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      category: 'car',
      active: true
    },
    {
      id: 6,
      name: 'Apartamento',
      amount: 1000,
      frequency: 'monthly',
      startDate: '2025-01-01',
      endDate: '2027-12-31',
      category: 'home',
      active: true
    },
    {
      id: 7,
      name: 'Café Diário',
      amount: 15,
      frequency: 'daily',
      startDate: '2025-06-01',
      endDate: '2025-12-31',
      category: 'other',
      active: false
    },
    {
      id: 8,
      name: 'Academia Trimestral',
      amount: 270,
      frequency: 'quarterly',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      category: 'health',
      active: true
    }
  ],
  loading: false,
  error: null
};

// Actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  ADD_BUDGET: 'ADD_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  ADD_GOAL: 'ADD_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  ADD_SAVING: 'ADD_SAVING',
  UPDATE_SAVING: 'UPDATE_SAVING',
  DELETE_SAVING: 'DELETE_SAVING',
  UPDATE_GOAL_PROGRESS: 'UPDATE_GOAL_PROGRESS',
  LOAD_DATA: 'LOAD_DATA'
};

// Reducer
function financialReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.ADD_TRANSACTION:
      const newTransactionId = Date.now() + Math.random();
      return {
        ...state,
        transactions: [...state.transactions, { ...action.payload, id: newTransactionId }]
      };
    
    case ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    
    case ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    
    case ACTIONS.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case ACTIONS.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };
    
    case ACTIONS.ADD_BUDGET:
      return {
        ...state,
        budgets: [...state.budgets, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(b => 
          b.id === action.payload.id ? action.payload : b
        )
      };
    
    case ACTIONS.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload)
      };
    
    case ACTIONS.ADD_GOAL:
      return {
        ...state,
        goals: [...state.goals, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.payload.id ? action.payload : g
        )
      };
    
    case ACTIONS.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload)
      };
    
    case ACTIONS.ADD_SAVING:
      return {
        ...state,
        savings: [...state.savings, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_SAVING:
      return {
        ...state,
        savings: state.savings.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    
    case ACTIONS.DELETE_SAVING:
      return {
        ...state,
        savings: state.savings.filter(s => s.id !== action.payload)
      };
    
    case ACTIONS.UPDATE_GOAL_PROGRESS:
      return {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.payload.goalId 
            ? { ...g, currentAmount: action.payload.amount }
            : g
        )
      };
    
    case ACTIONS.LOAD_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
}

// Context
const FinancialContext = createContext();

// Provider
export function FinancialProvider({ children }) {
  const [state, dispatch] = useReducer(financialReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar dados do localStorage apenas uma vez na montagem
  useEffect(() => {
    if (!isInitialized) {
      const savedData = localStorage.getItem('financial-data');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          dispatch({ type: ACTIONS.LOAD_DATA, payload: data });
        } catch (error) {
          console.error('Erro ao carregar dados do localStorage:', error);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Salvar dados no localStorage apenas após inicialização
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('financial-data', JSON.stringify({
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        savings: state.savings
      }));
    }
  }, [state.transactions, state.categories, state.budgets, state.goals, state.savings, isInitialized]);

  // Actions - Memoizadas para evitar re-renderizações desnecessárias
  const addTransaction = useCallback((transaction) => {
    dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction });
  }, []);

  const updateTransaction = useCallback((transaction) => {
    dispatch({ type: ACTIONS.UPDATE_TRANSACTION, payload: transaction });
  }, []);

  const deleteTransaction = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_TRANSACTION, payload: id });
  }, []);

  const addCategory = useCallback((category) => {
    dispatch({ type: ACTIONS.ADD_CATEGORY, payload: category });
  }, []);

  const updateCategory = useCallback((category) => {
    dispatch({ type: ACTIONS.UPDATE_CATEGORY, payload: category });
  }, []);

  const deleteCategory = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_CATEGORY, payload: id });
  }, []);

  const addBudget = useCallback((budget) => {
    dispatch({ type: ACTIONS.ADD_BUDGET, payload: budget });
  }, []);

  const updateBudget = useCallback((budget) => {
    dispatch({ type: ACTIONS.UPDATE_BUDGET, payload: budget });
  }, []);

  const deleteBudget = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_BUDGET, payload: id });
  }, []);

  const addGoal = useCallback((goal) => {
    dispatch({ type: ACTIONS.ADD_GOAL, payload: goal });
  }, []);

  const updateGoal = useCallback((goal) => {
    dispatch({ type: ACTIONS.UPDATE_GOAL, payload: goal });
  }, []);

  const deleteGoal = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_GOAL, payload: id });
  }, []);

  const addSaving = useCallback((saving) => {
    dispatch({ type: ACTIONS.ADD_SAVING, payload: saving });
  }, []);

  const updateSaving = useCallback((saving) => {
    dispatch({ type: ACTIONS.UPDATE_SAVING, payload: saving });
  }, []);

  const deleteSaving = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_SAVING, payload: id });
  }, []);

  const updateGoalProgress = useCallback((goalId, amount) => {
    dispatch({ type: ACTIONS.UPDATE_GOAL_PROGRESS, payload: { goalId, amount } });
  }, []);

  // Funções utilitárias
  const getTransactionsByMonth = (year, month) => {
    return state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  const getTransactionsByCategory = (categoryId) => {
    return state.transactions.filter(t => t.categoryId === categoryId);
  };

  const getTotalIncome = (transactions = state.transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t && t.type === TRANSACTION_TYPES.INCOME && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = (transactions = state.transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t && t.type === TRANSACTION_TYPES.EXPENSE && typeof t.amount === 'number')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = (transactions = state.transactions) => {
    return getTotalIncome(transactions) - getTotalExpense(transactions);
  };

  const getGoalsProgress = () => {
    return state.goals.map(goal => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        ...goal,
        progress: Math.min(100, Math.max(0, progress)), // Limitar entre 0 e 100%
        remaining,
        daysRemaining: Math.max(0, daysRemaining) // Não permitir dias negativos
      };
    });
  };

  const getTotalSavings = () => {
    if (!state.savings || !Array.isArray(state.savings)) return 0;
    return state.savings
      .filter(s => s && s.active && typeof s.amount === 'number')
      .reduce((sum, s) => sum + s.amount, 0);
  };

  const getMonthlySavings = () => {
    if (!state.savings || !Array.isArray(state.savings)) return 0;
    return state.savings
      .filter(s => s && s.active && s.frequency === 'monthly' && typeof s.amount === 'number')
      .reduce((sum, s) => sum + s.amount, 0);
  };

  const getExpenseAnalysis = (year = new Date().getFullYear(), month = new Date().getMonth()) => {
    const monthlyExpenses = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && 
             date.getFullYear() === year && 
             t.type === TRANSACTION_TYPES.EXPENSE;
    });

    const categoryTotals = {};
    monthlyExpenses.forEach(transaction => {
      const category = state.categories.find(c => c.id === transaction.categoryId);
      if (category) {
        if (!categoryTotals[category.name]) {
          categoryTotals[category.name] = 0;
        }
        categoryTotals[category.name] += transaction.amount;
      }
    });

    const totalExpenses = getTotalExpense(monthlyExpenses);
    
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        category: name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Funções de projeção conforme documentação @financeiro
  const getMonthlyProjection = (months = 1) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = getTotalIncome(getTransactionsByMonth(currentYear, currentMonth));
    const monthlyExpense = getTotalExpense(getTransactionsByMonth(currentYear, currentMonth));
    const monthlyBalance = monthlyIncome - monthlyExpense;
    
    return {
      projectedIncome: monthlyIncome * months,
      projectedExpense: monthlyExpense * months,
      projectedBalance: monthlyBalance * months,
      monthlyAverage: {
        income: monthlyIncome,
        expense: monthlyExpense,
        balance: monthlyBalance
      }
    };
  };

  const getYearlyProjection = () => {
    const currentYear = new Date().getFullYear();
    const yearTransactions = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === currentYear;
    });
    
    const yearlyIncome = getTotalIncome(yearTransactions);
    const yearlyExpense = getTotalExpense(yearTransactions);
    const yearlyBalance = yearlyIncome - yearlyExpense;
    
    const monthsPassed = new Date().getMonth() + 1;
    const monthsRemaining = 12 - monthsPassed;
    
    return {
      currentYear: {
        income: yearlyIncome,
        expense: yearlyExpense,
        balance: yearlyBalance
      },
      projection: {
        income: monthsPassed > 0 ? (yearlyIncome / monthsPassed) * 12 : 0,
        expense: monthsPassed > 0 ? (yearlyExpense / monthsPassed) * 12 : 0,
        balance: monthsPassed > 0 ? (yearlyBalance / monthsPassed) * 12 : 0
      },
      remaining: {
        months: monthsRemaining,
        projectedIncome: monthsPassed > 0 ? (yearlyIncome / monthsPassed) * monthsRemaining : 0,
        projectedExpense: monthsPassed > 0 ? (yearlyExpense / monthsPassed) * monthsRemaining : 0,
        projectedBalance: monthsPassed > 0 ? (yearlyBalance / monthsPassed) * monthsRemaining : 0
      }
    };
  };

  const getCategoryTrends = (categoryId, months = 6) => {
    const trends = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthTransactions = getTransactionsByMonth(targetDate.getFullYear(), targetDate.getMonth())
        .filter(t => t.categoryId === categoryId);
      
      const income = getTotalIncome(monthTransactions);
      const expense = getTotalExpense(monthTransactions);
      
      trends.push({
        month: targetDate.getMonth(),
        year: targetDate.getFullYear(),
        monthName: targetDate.toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expense,
        balance: income - expense
      });
    }
    
    return trends;
  };

  const value = useMemo(() => ({
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addSaving,
    updateSaving,
    deleteSaving,
    updateGoalProgress,
    getTransactionsByMonth,
    getTransactionsByCategory,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getGoalsProgress,
    getTotalSavings,
    getMonthlySavings,
    getExpenseAnalysis,
    getMonthlyProjection,
    getYearlyProjection,
    getCategoryTrends,
    TRANSACTION_TYPES
  }), [
    state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addSaving,
    updateSaving,
    deleteSaving,
    updateGoalProgress
  ]);

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

// Hook personalizado
export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial deve ser usado dentro de um FinancialProvider');
  }
  return context;
}
