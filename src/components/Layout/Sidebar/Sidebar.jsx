import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  Tag, 
  Settings,
  Calendar,
  Table,
  Wallet,
  CircleDollarSign
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, onNavigate, onDragChange }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);
  const currentDragY = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const menuItems = [
    { path: '/', icon: Home, label: 'Visão Geral', exact: true },
    { path: '/transactions', icon: CreditCard, label: 'Transações' },
    { path: '/spreadsheet', icon: Table, label: 'Planilha' },
    { path: '/categories', icon: Tag, label: 'Categorias' },
    { path: '/bank-accounts', icon: Wallet, label: 'Contas Bancárias' },
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
    { path: '/settings', icon: Settings, label: 'Configurações' }
  ];

  const handleNavigate = () => {
    // Fechar o sidebar no mobile quando um link for clicado
    if (window.innerWidth <= 768 && onNavigate) {
      onNavigate();
    }
  };

  // Resetar drag offset quando sidebar fechar
  useEffect(() => {
    if (!sidebarOpen) {
      setDragOffset(0);
      isDragging.current = false;
      if (onDragChange) {
        onDragChange(0);
      }
    }
  }, [sidebarOpen, onDragChange]);

  const handleTouchStart = (e) => {
    // Só permitir arrastar no mobile
    if (window.innerWidth > 768) return;
    
    // Só permitir arrastar se o sidebar estiver aberto
    if (!sidebarOpen) return;

    // Verificar se o toque está em uma área clicável (link)
    const target = e.target;
    if (target.closest('a') || target.closest('button')) {
      // Não iniciar drag se estiver clicando em um link ou botão
      return;
    }

    const touch = e.touches[0];
    dragStartY.current = touch.clientY;
    dragStartTime.current = Date.now();
    currentDragY.current = touch.clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !sidebarOpen) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartY.current;
    
    // Só permitir arrastar para baixo (valores positivos)
    if (deltaY > 0) {
      currentDragY.current = touch.clientY;
      const newOffset = Math.min(deltaY, 500); // Limitar o máximo de arraste
      setDragOffset(newOffset);
      // Notificar o Layout sobre a mudança de drag para atualizar overlay
      if (onDragChange) {
        onDragChange(newOffset);
      }
      e.preventDefault(); // Prevenir scroll durante o arraste
      e.stopPropagation(); // Prevenir propagação
    } else if (deltaY < -5) {
      // Se arrastar para cima mais de 5px, cancelar o drag
      isDragging.current = false;
      setDragOffset(0);
      if (onDragChange) {
        onDragChange(0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;

    const deltaY = currentDragY.current - dragStartY.current;
    const sidebar = sidebarRef.current;
    
    if (!sidebar) {
      isDragging.current = false;
      setDragOffset(0);
      return;
    }

    const sidebarHeight = sidebar.offsetHeight;
    const threshold = Math.min(sidebarHeight * 0.25, 150); // 25% da altura ou 150px, o que for menor
    const dragDuration = Date.now() - dragStartTime.current;
    const velocity = dragDuration > 0 ? deltaY / dragDuration : 0;
    
    // Fechar se arrastou mais que o threshold ou com velocidade suficiente (>0.5px/ms)
    if (deltaY > threshold || (deltaY > 80 && velocity > 0.5)) {
      if (onNavigate) {
        onNavigate();
      }
    }
    
    // Resetar estado
    isDragging.current = false;
    setDragOffset(0);
    // Notificar Layout que o drag terminou
    if (onDragChange) {
      onDragChange(0);
    }
  };

  // Calcular transform baseado no drag
  const getTransform = () => {
    if (!sidebarOpen || dragOffset === 0) return '';
    return `translateY(${dragOffset}px)`;
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`sidebar ${sidebarOpen ? 'open' : ''} ${isDragging.current ? 'dragging' : ''}`}
      style={{ 
        transform: getTransform(),
        transition: isDragging.current ? 'none' : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="sidebar-drag-indicator"></div>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <CircleDollarSign size={24} className="sidebar-title-icon" />
          Ruptura
        </h2>
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
