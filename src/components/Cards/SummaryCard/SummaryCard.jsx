import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import './SummaryCard.css';

const SummaryCard = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? '#10B981' : '#EF4444';
  const changeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="summary-card">
      <div className="card-header">
        <div className="card-icon" style={{ backgroundColor: color }}>
          {React.createElement(icon, { size: 24 })}
        </div>
        <div className="card-info">
          <h3 className="card-title">{title}</h3>
          <p className="card-value">{value}</p>
        </div>
      </div>
      
      <div className="card-footer">
        <div className="card-change" style={{ color: changeColor }}>
          {React.createElement(changeIcon, { size: 16 })}
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="card-period">vs mês anterior</span>
      </div>
    </div>
  );
};

export default SummaryCard;

