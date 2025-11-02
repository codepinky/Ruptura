import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../../context/FinancialContext';
import CategoryForm from '../../../components/Forms/CategoryForm/CategoryForm';
import CategoryCharts from '../../../components/Charts/CategoryCharts/CategoryCharts';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Settings
} from 'lucide-react';
import './Categories.css';

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
  const [viewMode, setViewMode] = useState('grid'); // grid, list, chart

  // Análise das categorias com estatísticas
  const categoryAnalysis = useMemo(() => {
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

  // Filtrar categorias
  const filteredCategories = useMemo(() => {
    let filtered = categoryAnalysis;

    // Filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(cat => cat.type === selectedType);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [categoryAnalysis, selectedType, searchTerm]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCreateCategory = (categoryData) => {
    addCategory(categoryData);
  };

  const handleUpdateCategory = (categoryData) => {
    updateCategory({ ...categoryData, id: editingCategory.id });
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div className="header-content">
          <h1 className="page-title">Categorias</h1>
        </div>
      </div>

      <div className="categories-controls">
        <div className="controls-section controls-search">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="controls-section controls-filter">
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas as categorias</option>
            <option value={TRANSACTION_TYPES.INCOME}>Receitas</option>
            <option value={TRANSACTION_TYPES.EXPENSE}>Despesas</option>
          </select>
        </div>

        <div className="controls-section controls-view">
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Visualização em grade"
            >
              <BarChart3 size={18} />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Visualização em lista"
            >
              <Settings size={18} />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
              title="Visualização em gráfico"
            >
              <PieChart size={18} />
            </button>
          </div>
        </div>

        <div className="controls-section controls-action">
          <button 
            type="button"
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      <div className="categories-stats">
        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <h3>{filteredCategories.length}</h3>
            <p>Categorias Ativas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon expense">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(filteredCategories.reduce((sum, cat) => sum + cat.totalExpense, 0))}</h3>
            <p>Total em Despesas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(filteredCategories.reduce((sum, cat) => sum + cat.totalIncome, 0))}</h3>
            <p>Total em Receitas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <h3>{filteredCategories.reduce((sum, cat) => sum + cat.totalTransactions, 0)}</h3>
            <p>Total de Transações</p>
          </div>
        </div>
      </div>

      <div className="categories-content">
        {viewMode === 'grid' && (
          <div className="categories-grid">
            {filteredCategories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <div 
                    className="category-color" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-info">
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-type">
                      {category.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                  <div className="category-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="category-stats">
                  <div className="stat-row">
                    <span className="stat-label">Transações:</span>
                    <span className="stat-value">{category.totalTransactions}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Total:</span>
                    <span className={`stat-value ${category.netAmount >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(Math.abs(category.netAmount))}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Média:</span>
                    <span className="stat-value">{formatCurrency(category.averageTransaction)}</span>
                  </div>
                  {category.lastTransaction && (
                    <div className="stat-row">
                      <span className="stat-label">Última:</span>
                      <span className="stat-value">{formatDate(category.lastTransaction.date)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="categories-list">
            <div className="list-header">
              <div className="header-cell">Categoria</div>
              <div className="header-cell">Tipo</div>
              <div className="header-cell">Transações</div>
              <div className="header-cell">Total</div>
              <div className="header-cell">Média</div>
              <div className="header-cell">Última</div>
              <div className="header-cell">Ações</div>
            </div>
            
            {filteredCategories.map(category => (
              <div key={category.id} className="list-row">
                <div className="list-cell category-cell">
                  <div 
                    className="category-color-indicator" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
                <div className="list-cell">
                  <span className={`type-badge ${category.type}`}>
                    {category.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                <div className="list-cell">{category.totalTransactions}</div>
                <div className="list-cell">
                  <span className={`amount ${category.netAmount >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(Math.abs(category.netAmount))}
                  </span>
                </div>
                <div className="list-cell">{formatCurrency(category.averageTransaction)}</div>
                <div className="list-cell">
                  {category.lastTransaction ? formatDate(category.lastTransaction.date) : '-'}
                </div>
                <div className="list-cell">
                  <div className="action-buttons">
                    <button 
                      className="action-btn edit"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'chart' && (
          <CategoryCharts 
            categoryAnalysis={filteredCategories}
            totalIncome={filteredCategories.reduce((sum, cat) => sum + cat.totalIncome, 0)}
            totalExpense={filteredCategories.reduce((sum, cat) => sum + cat.totalExpense, 0)}
          />
        )}
      </div>

      {/* Formulário de criação de categoria */}
      <CategoryForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateCategory}
        TRANSACTION_TYPES={TRANSACTION_TYPES}
      />

      {/* Formulário de edição de categoria */}
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
