import React, { useMemo, useState } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import { 
  Search, 
  Filter, 
  Calendar, 
  Tag,
  Download,
  FileText,
  Table2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import PivotTable from './PivotTable';

const Explorer = ({ globalRange }) => {
  const { transactions, categories } = useFinancial();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showPivot, setShowPivot] = useState(true);

  const getDateRange = (range) => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    if (range === '30days') start.setDate(start.getDate() - 29);
    else if (range === 'year') start.setMonth(0, 1);
    else start.setDate(1);
    return { start, end };
  };

  const global = useMemo(() => getDateRange(globalRange), [globalRange]);

  const filtered = useMemo(() => {
    const sDate = startDate ? new Date(startDate) : global.start;
    const eDate = endDate ? new Date(endDate) : global.end;
    const text = search.trim().toLowerCase();

    return transactions.filter(t => {
      const d = new Date(t.date);
      if (d < sDate || d > eDate) return false;
      if (type !== 'all' && t.type !== type) return false;
      if (categoryId !== 'all' && t.categoryId !== Number(categoryId)) return false;
      if (text && !(`${t.description}`.toLowerCase().includes(text) || `${t.notes||''}`.toLowerCase().includes(text))) return false;
      return true;
    }).sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [transactions, global, startDate, endDate, type, categoryId, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page-1)*pageSize, page*pageSize);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtDate = (s) => new Date(s).toLocaleDateString('pt-BR');

  return (
    <div className="explorer">
      <div className="explorer-filters-card">
        <div className="explorer-filters">
          <div className="filter-group">
            <Search size={18} className="filter-icon" />
            <input
              className="filter-input"
              placeholder="Buscar descrição/notas"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>

          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select className="filter-select" value={type} onChange={(e) => { setPage(1); setType(e.target.value); }}>
              <option value="all">Tipo: Todos</option>
              <option value={TRANSACTION_TYPES.INCOME}>Apenas Receitas</option>
              <option value={TRANSACTION_TYPES.EXPENSE}>Apenas Despesas</option>
            </select>
          </div>

          <div className="filter-group">
            <Tag size={18} className="filter-icon" />
            <select className="filter-select" value={categoryId} onChange={(e) => { setPage(1); setCategoryId(e.target.value); }}>
              <option value="all">Categoria: Todas</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={18} className="filter-icon" />
            <input 
              className="filter-input" 
              type="date" 
              value={startDate} 
              onChange={(e) => { setPage(1); setStartDate(e.target.value); }}
              placeholder="Data inicial"
            />
          </div>

          <div className="filter-group">
            <Calendar size={18} className="filter-icon" />
            <input 
              className="filter-input" 
              type="date" 
              value={endDate} 
              onChange={(e) => { setPage(1); setEndDate(e.target.value); }}
              placeholder="Data final"
            />
          </div>
        </div>

        <div className="explorer-actions">
          <div className="export-dropdown">
            <button className="export-button" onClick={() => exportToCSV(filtered, categories)}>
              <Download size={16} />
              <span>Exportar CSV</span>
            </button>
            <button className="export-button" onClick={() => exportToPDF(filtered, categories)}>
              <FileText size={16} />
              <span>Exportar PDF</span>
            </button>
          </div>

          <label className="pivot-toggle">
            <input type="checkbox" checked={showPivot} onChange={(e) => setShowPivot(e.target.checked)} />
            <Table2 size={16} />
            <span>Mostrar Pivot</span>
          </label>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {current.map(t => {
              const c = categories.find(c => c.id === t.categoryId);
              return (
                <tr key={t.id}>
                  <td>{fmtDate(t.date)}</td>
                  <td>{t.description}</td>
                  <td className={t.type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense'}>
                    {t.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa'}
                  </td>
                  <td>{c ? c.name : 'Sem categoria'}</td>
                  <td className={t.type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense'}>{fmt(t.amount)}</td>
                  <td>{t.notes || '-'}</td>
                </tr>
              );
            })}
            {current.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>Nenhum resultado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-card">
        <div className="pagination">
          <button 
            className="pagination-btn" 
            disabled={page === 1} 
            onClick={() => setPage(1)}
            title="Primeira página"
          >
            <ChevronsLeft size={18} />
          </button>
          <button 
            className="pagination-btn" 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p-1))}
            title="Página anterior"
          >
            <ChevronLeft size={18} />
            <span>Anterior</span>
          </button>
          <span className="pagination-info">Página {page} de {totalPages}</span>
          <button 
            className="pagination-btn" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p+1))}
            title="Próxima página"
          >
            <span>Próxima</span>
            <ChevronRight size={18} />
          </button>
          <button 
            className="pagination-btn" 
            disabled={page === totalPages} 
            onClick={() => setPage(totalPages)}
            title="Última página"
          >
            <ChevronsRight size={18} />
          </button>
          <select 
            className="pagination-select"
            value={pageSize} 
            onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value)); }}
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      </div>

      {showPivot && (
        <div className="pivot-section-card">
          <div className="pivot-section">
            <h3 className="chart-title">
              <Table2 size={20} />
              <span>Pivot Table</span>
            </h3>
            <PivotTable data={filtered} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorer;




