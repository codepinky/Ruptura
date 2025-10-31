import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Análise detalhada das suas finanças</p>
        <div className="reports-controls">
          <div className="period-selector">
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
          Visão Geral
        </button>
        <button 
          className={`tab-button ${currentTab === 'explorer' ? 'active' : ''}`}
          onClick={() => switchTab('explorer')}
        >
          Análise
        </button>
        <button 
          className={`tab-button ${currentTab === 'builder' ? 'active' : ''}`}
          onClick={() => switchTab('builder')}
        >
          Relatório Personalizado
        </button>
      </div>

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
  );
};

export default Reports;

