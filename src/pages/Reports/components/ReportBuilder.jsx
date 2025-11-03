import React, { useMemo, useState } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import { 
  Save, 
  Trash2, 
  Download,
  FileText,
  Filter,
  Calendar,
  Tag,
  ArrowUpDown,
  Layers
} from 'lucide-react';
import { listPresets, savePreset, deletePreset, getPreset } from './SaveLoadPresets';

const ALL_FIELDS = ['date', 'description', 'type', 'category', 'amount', 'notes'];

const ReportBuilder = () => {
  const { transactions, categories } = useFinancial();
  const [fields, setFields] = useState(['date', 'description', 'type', 'category', 'amount']);
  const [type, setType] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('none'); // none | month | category | type
  const [sortBy, setSortBy] = useState('date_desc');
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');

  const presets = useMemo(() => listPresets(), []);

  const filtered = useMemo(() => {
    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;
    let list = transactions.filter(t => {
      const d = new Date(t.date);
      if (sDate && d < sDate) return false;
      if (eDate && d > eDate) return false;
      if (type !== 'all' && t.type !== type) return false;
      if (categoryId !== 'all' && t.categoryId !== Number(categoryId)) return false;
      return true;
    });
    switch (sortBy) {
      case 'date_asc': list.sort((a,b) => new Date(a.date) - new Date(b.date)); break;
      case 'amount_desc': list.sort((a,b) => b.amount - a.amount); break;
      case 'amount_asc': list.sort((a,b) => a.amount - b.amount); break;
      default: list.sort((a,b) => new Date(b.date) - new Date(a.date));
    }
    return list;
  }, [transactions, startDate, endDate, type, categoryId, sortBy]);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;
    const keyFn = (t) => {
      if (groupBy === 'month') {
        const d = new Date(t.date);
        return `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      }
      if (groupBy === 'category') {
        const c = categories.find(c => c.id === t.categoryId); return c ? c.name : 'Sem categoria';
      }
      if (groupBy === 'type') return t.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa';
      return 'Grupo';
    };
    const map = new Map();
    filtered.forEach(t => {
      const key = keyFn(t);
      if (!map.has(key)) map.set(key, { items: [], total: 0 });
      const g = map.get(key);
      g.items.push(t);
      g.total += t.amount * (t.type === TRANSACTION_TYPES.INCOME ? 1 : -1);
    });
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }));
  }, [filtered, groupBy, categories]);

  const applyPreset = (id) => {
    const p = getPreset(id);
    if (!p) return;
    setFields(p.fields || fields);
    setType(p.type || 'all');
    setCategoryId(p.categoryId ?? 'all');
    setStartDate(p.startDate || '');
    setEndDate(p.endDate || '');
    setGroupBy(p.groupBy || 'none');
    setSortBy(p.sortBy || 'date_desc');
  };

  const saveCurrentAsPreset = () => {
    if (!presetName.trim()) return;
    const saved = savePreset({
      id: selectedPresetId || undefined,
      name: presetName.trim(),
      fields, type, categoryId, startDate, endDate, groupBy, sortBy
    });
    setSelectedPresetId(saved.id);
  };

  const removePreset = () => {
    if (!selectedPresetId) return;
    deletePreset(selectedPresetId);
    setSelectedPresetId('');
  };

  const exportCurrent = (format) => {
    const rows = filtered.map(t => t);
    if (format === 'csv') exportToCSV(rows, categories);
    if (format === 'pdf') exportToPDF(rows, categories);
  };

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtDate = (s) => new Date(s).toLocaleDateString('pt-BR');

  return (
    <div className="report-builder">
      <div className="builder-presets-card">
        <h3 className="builder-section-title">
          <Save size={20} />
          <span>Presets</span>
        </h3>
        <div className="builder-presets">
          <div className="filter-group">
            <FileText size={18} className="filter-icon" />
            <select value={selectedPresetId} onChange={(e) => applyPreset(e.target.value)} className="filter-select">
              <option value="">Carregar preset…</option>
              {presets.map(p => (
                <option value={p.id} key={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <input className="filter-input" placeholder="Nome do preset" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
          </div>
          <button className="export-button" onClick={saveCurrentAsPreset}>
            <Save size={16} />
            <span>Salvar</span>
          </button>
          <button className="export-button" onClick={removePreset} disabled={!selectedPresetId}>
            <Trash2 size={16} />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      <div className="builder-filters-card">
        <h3 className="builder-section-title">
          <Filter size={20} />
          <span>Campos e Filtros</span>
        </h3>
        <div className="builder-filters">
          <div className="field-group">
            {ALL_FIELDS.map(f => (
              <label key={f} className="field-checkbox">
                <input
                  type="checkbox"
                  checked={fields.includes(f)}
                  onChange={(e) => {
                    if (e.target.checked) setFields(prev => [...prev, f]);
                    else setFields(prev => prev.filter(x => x !== f));
                  }}
                />
                <span>{f}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select className="filter-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Tipo: Todos</option>
              <option value={TRANSACTION_TYPES.INCOME}>Receitas</option>
              <option value={TRANSACTION_TYPES.EXPENSE}>Despesas</option>
            </select>
          </div>

          <div className="filter-group">
            <Tag size={18} className="filter-icon" />
            <select className="filter-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="all">Categoria: Todas</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={18} className="filter-icon" />
            <input className="filter-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="filter-group">
            <Calendar size={18} className="filter-icon" />
            <input className="filter-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="filter-group">
            <Layers size={18} className="filter-icon" />
            <select className="filter-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <option value="none">Sem agrupamento</option>
              <option value="month">Agrupar por mês</option>
              <option value="category">Agrupar por categoria</option>
              <option value="type">Agrupar por tipo</option>
            </select>
          </div>

          <div className="filter-group">
            <ArrowUpDown size={18} className="filter-icon" />
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date_desc">Ordenar: Data desc</option>
              <option value="date_asc">Ordenar: Data asc</option>
              <option value="amount_desc">Ordenar: Valor desc</option>
              <option value="amount_asc">Ordenar: Valor asc</option>
            </select>
          </div>

          <div className="export-dropdown">
            <button className="export-button" onClick={() => exportCurrent('csv')}>
              <Download size={16} />
              <span>Exportar CSV</span>
            </button>
            <button className="export-button" onClick={() => exportCurrent('pdf')}>
              <FileText size={16} />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {grouped ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Qtde</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(g => (
                <tr key={g.key}>
                  <td>{g.key}</td>
                  <td>{g.items.length}</td>
                  <td className={g.total >= 0 ? 'income' : 'expense'}>{fmt(g.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {fields.includes('date') && <th>Data</th>}
                {fields.includes('description') && <th>Descrição</th>}
                {fields.includes('type') && <th>Tipo</th>}
                {fields.includes('category') && <th>Categoria</th>}
                {fields.includes('amount') && <th>Valor</th>}
                {fields.includes('notes') && <th>Observações</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const c = categories.find(c => c.id === t.categoryId);
                return (
                  <tr key={t.id}>
                    {fields.includes('date') && <td>{fmtDate(t.date)}</td>}
                    {fields.includes('description') && <td>{t.description}</td>}
                    {fields.includes('type') && <td className={t.type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense'}>{t.type === TRANSACTION_TYPES.INCOME ? 'Receita' : 'Despesa'}</td>}
                    {fields.includes('category') && <td>{c ? c.name : 'Sem categoria'}</td>}
                    {fields.includes('amount') && <td className={t.type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense'}>{fmt(t.amount)}</td>}
                    {fields.includes('notes') && <td>{t.notes || '-'}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportBuilder;




