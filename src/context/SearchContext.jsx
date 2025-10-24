import React, { createContext, useContext, useState, useMemo } from 'react';
import { useFinancial } from './FinancialContext';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { transactions, categories, goals, savings } = useFinancial();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        transactions: [],
        categories: [],
        goals: [],
        savings: [],
        totalResults: 0
      };
    }

    const query = searchQuery.toLowerCase().trim();

    // Buscar transações
    const foundTransactions = transactions.filter(t => 
      t.description.toLowerCase().includes(query) ||
      t.notes?.toLowerCase().includes(query) ||
      categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(query)
    ).map(transaction => ({
      ...transaction,
      categoryName: categories.find(c => c.id === transaction.categoryId)?.name || 'Sem categoria',
      resultType: 'transaction'
    }));

    // Buscar categorias
    const foundCategories = categories.filter(c => 
      c.name.toLowerCase().includes(query)
    ).map(category => ({
      ...category,
      resultType: 'category'
    }));

    // Buscar metas
    const foundGoals = goals.filter(g => 
      g.name.toLowerCase().includes(query) ||
      g.description?.toLowerCase().includes(query)
    ).map(goal => ({
      ...goal,
      resultType: 'goal'
    }));

    // Buscar poupanças
    const foundSavings = savings.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query)
    ).map(saving => ({
      ...saving,
      resultType: 'saving'
    }));

    return {
      transactions: foundTransactions,
      categories: foundCategories,
      goals: foundGoals,
      savings: foundSavings,
      totalResults: foundTransactions.length + foundCategories.length + foundGoals.length + foundSavings.length
    };
  }, [searchQuery, transactions, categories, goals, savings]);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    openSearch,
    closeSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
