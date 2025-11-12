import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import CategoryForm from '../../../components/Forms/CategoryForm/CategoryForm';
import CategoryCharts from '../../../components/Charts/CategoryCharts/CategoryCharts';
import FloatingButton from '../../../components/FloatingButton/FloatingButton';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Tag,
  Activity,
  Filter,
  BarChart3,
  List as ListIcon
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

// Componente: Card de Categoria Compacto (para aba Minhas Categorias)
const CompactCategoryCard = ({ category, TRANSACTION_TYPES, onEdit, onDelete }) => {
  const percentage = category.totalTransactions > 0 
    ? Math.min((category.totalTransactions / 10) * 100, 100) 
    : 0;

  return (
    <div className="compact-category-card">
      <div className="compact-card-gradient" style={{ 
        background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)` 
      }} />
      <div className="compact-card-content">
        <div className="compact-card-left">
          <div className="compact-color-wrapper">
            <div 
              className="compact-color-indicator" 
              style={{ backgroundColor: category.color }} 
            />
            <div className="compact-color-glow" style={{ 
              boxShadow: `0 0 20px ${category.color}40` 
            }} />
          </div>
          <div className="compact-card-info">
            <h3 className="compact-category-name">{category.name}</h3>
            <div className="compact-badges">
              <span className={`compact-type-badge ${category.type}`}>
                {category.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa'}
              </span>
              {category.totalTransactions > 0 && (
                <span className="compact-transaction-badge">
                  {category.totalTransactions} {category.totalTransactions === 1 ? 'transação' : 'transações'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="compact-card-right">
          <div className="compact-card-stats">
            {category.totalTransactions > 0 && (
              <div className="compact-stat">
                <div className="compact-stat-icon">
                  <Activity size={14} />
                </div>
                <div className="compact-stat-content">
                  <span className="compact-stat-value">{category.totalTransactions}</span>
                  <span className="compact-stat-label">transações</span>
                </div>
              </div>
            )}
            <div className="compact-amount-wrapper">
              <div className={`compact-amount ${category.netAmount >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(Math.abs(category.netAmount))}
              </div>
              {category.totalTransactions > 0 && (
                <div className="compact-amount-label">
                  {category.netAmount >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </div>
              )}
            </div>
          </div>
          <div className="compact-card-actions">
            <button 
              className="compact-action-btn edit" 
              onClick={() => onEdit(category)} 
              title="Editar categoria"
            >
              <Edit3 size={16} />
            </button>
            <button 
              className="compact-action-btn delete" 
              onClick={() => onDelete(category.id)} 
              title="Excluir categoria"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
      {category.totalTransactions > 0 && (
        <div className="compact-card-progress">
          <div 
            className="compact-progress-bar" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: category.color 
            }} 
          />
        </div>
      )}
    </div>
  );
};

// Componente: Stats Cards para Análise
const AnalysisStats = ({ filteredCategories }) => {
  const stats = useMemo(() => {
    const totalExpense = filteredCategories.reduce((sum, cat) => sum + cat.totalExpense, 0);
    const totalIncome = filteredCategories.reduce((sum, cat) => sum + cat.totalIncome, 0);
    const totalTransactions = filteredCategories.reduce((sum, cat) => sum + cat.totalTransactions, 0);
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;
    
    return {
      totalCategories: filteredCategories.length,
      totalExpense,
      totalIncome,
      totalTransactions,
      netBalance,
      savingsRate
    };
  }, [filteredCategories]);

  return (
    <div className="analysis-stats">
      <div className="analysis-stat-card">
        <div className="analysis-stat-icon">
          <Tag size={20} />
        </div>
        <div className="analysis-stat-content">
          <h3>{stats.totalCategories}</h3>
          <p>Categorias</p>
          <span className="analysis-stat-subtitle">Total cadastradas</span>
        </div>
        <div className="analysis-stat-decoration" />
      </div>
      
      <div className="analysis-stat-card income-card">
        <div className="analysis-stat-icon income">
          <TrendingUp size={20} />
        </div>
        <div className="analysis-stat-content">
          <h3>{formatCurrency(stats.totalIncome)}</h3>
          <p>Total Receitas</p>
          <span className="analysis-stat-subtitle">Entradas de dinheiro</span>
        </div>
        <div className="analysis-stat-decoration income-decoration" />
      </div>
      
      <div className="analysis-stat-card expense-card">
        <div className="analysis-stat-icon expense">
          <TrendingDown size={20} />
        </div>
        <div className="analysis-stat-content">
          <h3>{formatCurrency(stats.totalExpense)}</h3>
          <p>Total Despesas</p>
          <span className="analysis-stat-subtitle">Saídas de dinheiro</span>
        </div>
        <div className="analysis-stat-decoration expense-decoration" />
      </div>
      
      <div className="analysis-stat-card balance-card">
        <div className="analysis-stat-icon">
          <DollarSign size={20} />
        </div>
        <div className="analysis-stat-content">
          <h3 className={stats.netBalance >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(stats.netBalance)}
          </h3>
          <p>Saldo Líquido</p>
          <span className="analysis-stat-subtitle">
            {stats.savingsRate > 0 ? `${stats.savingsRate}% de economia` : 'Sem economia'}
          </span>
        </div>
        <div className="analysis-stat-decoration balance-decoration" />
      </div>
    </div>
  );
};

// Componente: Top 5 Categorias
const TopCategories = ({ categories }) => {
  const topCategories = useMemo(() => {
    const sorted = categories
      .sort((a, b) => (b.totalExpense + b.totalIncome) - (a.totalExpense + a.totalIncome))
      .slice(0, 5);
    
    const total = sorted.reduce((sum, cat) => sum + cat.totalExpense + cat.totalIncome, 0);
    
    return sorted.map(cat => ({
      ...cat,
      percentage: total > 0 ? ((cat.totalExpense + cat.totalIncome) / total * 100).toFixed(1) : 0
    }));
  }, [categories]);

  if (topCategories.length === 0) return null;

  return (
    <div className="top-categories-section">
      <div className="section-header">
        <h3 className="section-title">Top 5 Categorias</h3>
        <span className="section-subtitle">Categorias com maior movimentação</span>
      </div>
      <div className="top-categories-list">
        {topCategories.map((category, index) => (
          <div key={category.id} className="top-category-item">
            <div className="top-category-rank-wrapper">
              <div className="top-category-rank">#{index + 1}</div>
              {index === 0 && <div className="top-category-crown">👑</div>}
            </div>
            <div className="top-category-color-wrapper">
              <div 
                className="top-category-color" 
                style={{ backgroundColor: category.color }} 
              />
              <div className="top-category-glow" style={{ 
                boxShadow: `0 0 15px ${category.color}50` 
              }} />
            </div>
            <div className="top-category-info">
              <h4>{category.name}</h4>
              <div className="top-category-meta">
                <span className="top-category-type">
                  {category.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
                <span className="top-category-percentage">{category.percentage}%</span>
              </div>
              <div className="top-category-progress">
                <div 
                  className="top-category-progress-bar" 
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color 
                  }} 
                />
              </div>
            </div>
            <div className="top-category-amount-wrapper">
              <div className="top-category-amount">
                {formatCurrency(category.totalExpense + category.totalIncome)}
              </div>
              <span className="top-category-transactions">
                {category.totalTransactions} {category.totalTransactions === 1 ? 'transação' : 'transações'}
              </span>
            </div>
          </div>
        ))}
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

// Componente: Sistema de Abas
const TabButton = ({ active, onClick, children, icon: Icon }) => {
  return (
    <button 
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {Icon && <Icon size={18} />}
      <span>{children}</span>
    </button>
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
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' ou 'analysis'

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

  // Calcular totais para gráficos
  const totalIncome = filteredCategories.reduce((sum, cat) => sum + cat.totalIncome, 0);
  const totalExpense = filteredCategories.reduce((sum, cat) => sum + cat.totalExpense, 0);

  return (
    <div className="categories-page">
      {/* Header Simplificado */}
      <header className="categories-header">
        <div className="header-content">
          <div className="title-with-icon">
            <Tag size={32} className="title-icon" />
            <h1 className="page-title">Categorias</h1>
          </div>
          <button 
            className="header-create-btn desktop-only"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={20} />
            <span>Nova Categoria</span>
          </button>
        </div>
      </header>

      {/* Sistema de Abas */}
      <div className="tabs-container">
        <div className="tabs-header">
          <TabButton 
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')}
            icon={ListIcon}
          >
            Minhas Categorias
          </TabButton>
          <TabButton 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')}
            icon={BarChart3}
          >
            Análise
          </TabButton>
        </div>

        {/* Barra de Busca e Filtros - Sempre Visível */}
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

        {/* Conteúdo das Abas */}
        <div className="tabs-content">
          {/* Aba: Minhas Categorias */}
          {activeTab === 'categories' && (
            <div className="tab-panel categories-tab">
              <div className="categories-list-container">
                {filteredCategories.length > 0 ? (
                  <div className="compact-categories-grid">
                    {filteredCategories.map(category => (
                      <CompactCategoryCard
                        key={category.id}
                        category={category}
                        TRANSACTION_TYPES={TRANSACTION_TYPES}
                        onEdit={setEditingCategory}
                        onDelete={handleDeleteCategory}
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
          )}

          {/* Aba: Análise */}
          {activeTab === 'analysis' && (
            <div className="tab-panel analysis-tab">
              <AnalysisStats filteredCategories={filteredCategories} />
              
              {filteredCategories.length > 0 ? (
                <>
                  <CategoryCharts 
                    categoryAnalysis={filteredCategories}
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                  />
                  <TopCategories categories={filteredCategories} />
                </>
              ) : (
                <CategoryEmptyState 
                  onCreate={() => setShowCreateForm(true)}
                  message="Nenhuma categoria para analisar"
                  description="Crie categorias e adicione transações para ver análises e gráficos detalhados"
                />
              )}
            </div>
          )}
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
