import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  BarChart3, 
  Tag, 
  Settings,
  Wallet,
  TrendingUp,
  Calendar,
  Table
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, onNavigate }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', exact: true },
    { path: '/transactions', icon: CreditCard, label: 'Transações' },
    { path: '/reports', icon: BarChart3, label: 'Relatórios' },
    { path: '/spreadsheet', icon: Table, label: 'Planilha' },
    { path: '/categories', icon: Tag, label: 'Categorias' },
    { path: '/budgets', icon: Wallet, label: 'Orçamentos' },
    { path: '/goals', icon: TrendingUp, label: 'Metas' },
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
    { path: '/settings', icon: Settings, label: 'Configurações' }
  ];

  const handleNavigate = () => {
    // Fechar o sidebar no mobile quando um link for clicado
    if (window.innerWidth <= 768 && onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-drag-indicator"></div>
      <div className="sidebar-header">
        <h2 className="sidebar-title">💰 Ruptura</h2>
        <p className="sidebar-subtitle">Controle Financeiro</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavigate}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <p className="user-name">Usuário</p>
            <p className="user-email">usuario@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
