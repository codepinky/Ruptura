import React, { useMemo, useState } from 'react';
import { useFinancial, TRANSACTION_TYPES } from '../../../context/FinancialContext';

const PivotTable = ({ data }) => {
  const { categories } = useFinancial();
  const [rowDim, setRowDim] = useState('category'); // 'category' | 'month'
  const [showTotals, setShowTotals] = useState(true);

  const rows = useMemo(() => {
    const groupKey = (t) => {
      if (rowDim === 'month') {
        const d = new Date(t.date);
        return `${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}`;
      }
      const c = categories.find(c => c.id === t.categoryId);
      return c ? c.name : 'Sem categoria';
    };

    const map = new Map();
    data.forEach(t => {
      const key = groupKey(t);
      if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
      const agg = map.get(key);
      if (t.type === TRANSACTION_TYPES.INCOME) agg.income += t.amount;
      else if (t.type === TRANSACTION_TYPES.EXPENSE) agg.expense += t.amount;
    });

    const arr = Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v, balance: v.income - v.expense }));
    arr.sort((a, b) => b.balance - a.balance);
    return arr;
  }, [data, categories, rowDim]);

  const totals = useMemo(() => {
    return rows.reduce((acc, r) => ({
      income: acc.income + r.income,
      expense: acc.expense + r.expense,
      balance: acc.balance + r.balance
    }), { income: 0, expense: 0, balance: 0 });
  }, [rows]);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="pivot-table">
      <div className="pivot-controls">
        <select value={rowDim} onChange={(e) => setRowDim(e.target.value)} className="filter-select">
          <option value="category">Linhas por Categoria</option>
          <option value="month">Linhas por Mês</option>
        </select>
        <label className="pivot-toggle">
          <input type="checkbox" checked={showTotals} onChange={(e) => setShowTotals(e.target.checked)} />
          <span>Mostrar totais</span>
        </label>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>{rowDim === 'month' ? 'Mês' : 'Categoria'}</th>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td className="income">{fmt(r.income)}</td>
                <td className="expense">{fmt(r.expense)}</td>
                <td className={r.balance >= 0 ? 'income' : 'expense'}>{fmt(r.balance)}</td>
              </tr>
            ))}
          </tbody>
          {showTotals && (
            <tfoot>
              <tr>
                <th>Total</th>
                <th className="income">{fmt(totals.income)}</th>
                <th className="expense">{fmt(totals.expense)}</th>
                <th className={totals.balance >= 0 ? 'income' : 'expense'}>{fmt(totals.balance)}</th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default PivotTable;




