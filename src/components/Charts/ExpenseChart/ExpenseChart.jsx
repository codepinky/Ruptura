import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './ExpenseChart.css';

const ExpenseChart = ({ data }) => {
  const COLORS = [
    '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', 
    '#10B981', '#EC4899', '#6B7280', '#14B8A6'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(data.value)}
          </p>
          <p className="tooltip-percentage">{data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="expense-chart">
      <div className="chart-header">
        <h3 className="chart-title">Gastos por Categoria</h3>
        <p className="chart-subtitle">Últimos 30 dias</p>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;

