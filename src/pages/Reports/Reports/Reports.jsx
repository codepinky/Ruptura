import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BarChart3, 
  Search, 
  FileText, 
  Calendar,
  TrendingUp,
  Settings
} from 'lucide-react';
import ExecutiveOverview from '../components/ExecutiveOverview';
import Explorer from '../components/Explorer';
import ReportBuilder from '../components/ReportBuilder';
import './Reports.css';

const Reports = () => {
  // Abas via query param (?tab=executive|explorer|builder)
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'executive';
  const switchTab = (tab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Seleção de período minimalista: month, 30days, year
  const [selectedRange, setSelectedRange] = useState('month');

  return (
    <div className="reports-page">
      {/* Header Section */}
      <div className="reports-header">
        <div className="header-content">
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Análise detalhada das suas finanças</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="reports-controls">
        <div className="controls-section controls-period">
          <div className="period-selector-wrapper">
            <Calendar size={20} className="period-icon" />
            <select 
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="period-select"
            >
              <option value="month">Este mês</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="year">Este ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button 
          className={`tab-button ${currentTab === 'executive' ? 'active' : ''}`}
          onClick={() => switchTab('executive')}
        >
          <TrendingUp size={18} />
          <span>Visão Geral</span>
        </button>
        <button 
          className={`tab-button ${currentTab === 'explorer' ? 'active' : ''}`}
          onClick={() => switchTab('explorer')}
        >
          <Search size={18} />
          <span>Análise</span>
        </button>
        <button 
          className={`tab-button ${currentTab === 'builder' ? 'active' : ''}`}
          onClick={() => switchTab('builder')}
        >
          <FileText size={18} />
          <span>Relatório Personalizado</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="reports-content">
        {currentTab === 'executive' && (
          <ExecutiveOverview selectedRange={selectedRange} />
        )}

        {currentTab === 'explorer' && (
          <Explorer globalRange={selectedRange} />
        )}

        {currentTab === 'builder' && (
          <ReportBuilder />
        )}
      </div>
    </div>
  );
};

export default Reports;

