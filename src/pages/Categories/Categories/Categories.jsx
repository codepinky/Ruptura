import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import CategoryForm from '../../../components/Forms/CategoryForm/CategoryForm';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import { 
  Plus, 
  Search, 
  Tag,
  Filter
} from 'lucide-react';
import './Categories.css';

// Hook customizado para análise de categorias
const useCategoryAnalysis = (categories, transactions, TRANSACTION_TYPES) => {
  return useMemo(() => {
    const analysis = categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.categoryId === category.id);
      
      const incomeTransactions = categoryTransactions.filter(t => t.type === TRANSACTION_TYPES.INCOME);
      const expenseTransactions = categoryTransactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE);
      
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalTransactions = categoryTransactions.length;
      
      const averageTransaction = totalTransactions > 0 ? 
        (totalIncome + totalExpense) / totalTransactions : 0;
      
      const lastTransaction = categoryTransactions.length > 0 ? 
        categoryTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;

      return {
        ...category,
        totalIncome,
        totalExpense,
        totalTransactions,
        averageTransaction,
        lastTransaction,
        incomeCount: incomeTransactions.length,
        expenseCount: expenseTransactions.length,
        netAmount: totalIncome - totalExpense
      };
    });

    return analysis.sort((a, b) => b.totalTransactions - a.totalTransactions);
  }, [categories, transactions, TRANSACTION_TYPES]);
};

// Hook customizado para filtros
const useCategoryFilters = (categoryAnalysis, searchTerm, selectedType) => {
  return useMemo(() => {
    let filtered = categoryAnalysis;

    if (selectedType !== 'all') {
      filtered = filtered.filter(cat => cat.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [categoryAnalysis, selectedType, searchTerm]);
};

// Funções utilitárias
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Componente: Item de Categoria Simples (para aba Minhas Categorias)
const SimpleCategoryItem = ({ category, TRANSACTION_TYPES }) => {
  const totalAmount = category.type === TRANSACTION_TYPES.INCOME 
    ? category.totalIncome 
    : category.totalExpense;

  return (
    <div className="simple-category-item">
      <div 
        className="simple-category-color" 
        style={{ backgroundColor: category.color }} 
      />
      <div className="simple-category-info">
        <div className="simple-category-name">{category.name}</div>
        <div className={`simple-category-amount ${category.type}`}>
          {formatCurrency(totalAmount)}
        </div>
      </div>
      <div className={`simple-category-type ${category.type}`}>
        {category.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa'}
      </div>
    </div>
  );
};

// Componente: Empty State
const CategoryEmptyState = ({ onCreate, message = "Nenhuma categoria encontrada", description = "Crie sua primeira categoria para começar a organizar suas finanças" }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Tag size={48} />
      </div>
      <h3>{message}</h3>
      <p>{description}</p>
      <button className="empty-state-btn" onClick={onCreate}>
        <Plus size={18} />
        <span>Criar Categoria</span>
      </button>
    </div>
  );
};

// Componente Principal
const Categories = () => {
  const { 
    categories, 
    transactions, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    TRANSACTION_TYPES 
  } = useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const categoryAnalysis = useCategoryAnalysis(categories, transactions, TRANSACTION_TYPES);
  const filteredCategories = useCategoryFilters(categoryAnalysis, searchTerm, selectedType);

  const handleCreateCategory = (categoryData) => {
    addCategory(categoryData);
    setShowCreateForm(false);
  };

  const handleUpdateCategory = (categoryData) => {
    updateCategory({ ...categoryData, id: editingCategory.id });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="categories-page">
      {/* Header Simplificado */}
      <div className="categories-header">
        <div className="header-content">
          <h1 className="categories-title">Categorias</h1>
          <p className="page-subtitle">
            Organize suas receitas e despesas por categorias para um melhor controle financeiro
          </p>
        </div>
      </div>

      {/* Container Principal */}
      <div className="categories-container">
        {/* Barra de Busca e Filtros */}
        <div className="categories-controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <Filter className="filter-icon" />
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas</option>
              <option value={TRANSACTION_TYPES.INCOME}>Receitas</option>
              <option value={TRANSACTION_TYPES.EXPENSE}>Despesas</option>
            </select>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="categories-content">
          <div className="categories-list-container">
            {filteredCategories.length > 0 ? (
              <div className="simple-categories-list">
                {filteredCategories.map(category => (
                  <SimpleCategoryItem
                    key={category.id}
                    category={category}
                    TRANSACTION_TYPES={TRANSACTION_TYPES}
                  />
                ))}
              </div>
            ) : (
              <CategoryEmptyState 
                onCreate={() => setShowCreateForm(true)}
                message="Nenhuma categoria encontrada"
              />
            )}
          </div>
        </div>
      </div>

      {/* Botão Flutuante (Mobile) */}
      <FloatingButton 
        onClick={() => setShowCreateForm(true)}
        title="Nova Categoria"
      />

      {/* Modais */}
      <CategoryForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateCategory}
        TRANSACTION_TYPES={TRANSACTION_TYPES}
      />

      <CategoryForm
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
        category={editingCategory}
        TRANSACTION_TYPES={TRANSACTION_TYPES}
      />
    </div>
  );
};

export default Categories;

