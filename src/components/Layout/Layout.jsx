import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import TopBar from './TopBar/TopBar';
import HelpGuide from '../HelpGuide/HelpGuide';
import SearchResults from '../SearchResults/SearchResults';
import { SearchProvider } from '../../context/SearchContext';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Bloquear scroll e interações do body quando sidebar estiver aberto no mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    
    if (sidebarOpen && isMobile) {
      // Salvar posição atual do scroll ANTES de qualquer mudança
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      // Salvar estilos originais
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalHeight = document.body.style.height;
      const originalLeft = document.body.style.left;
      
      // Bloquear scroll do body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Também bloquear no html para garantir
      const html = document.documentElement;
      const originalHtmlOverflow = html.style.overflow;
      html.style.overflow = 'hidden';
      
      // Bloquear touch events no main-content
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.touchAction = 'none';
        mainContent.style.pointerEvents = 'none';
      }
      
      return () => {
        // Primeiro, restaurar estilos do body
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.left = originalLeft;
        document.body.style.width = originalWidth;
        document.body.style.height = originalHeight;
        
        // Restaurar html
        html.style.overflow = originalHtmlOverflow;
        
        // Restaurar interações do main-content ANTES de restaurar scroll
        if (mainContent) {
          mainContent.style.touchAction = '';
          mainContent.style.pointerEvents = '';
        }
        
        // Restaurar scroll em múltiplas tentativas para garantir
        const restoreScroll = () => {
          // Método 1: window.scrollTo com objeto
          window.scrollTo({
            top: scrollY,
            behavior: 'auto'
          });
          
          // Método 2: Fallback direto
          window.scrollTo(0, scrollY);
          
          // Método 3: Fallback para navegadores antigos
          document.documentElement.scrollTop = scrollY;
          document.body.scrollTop = scrollY;
        };
        
        // Usar requestAnimationFrame para garantir que o DOM esteja pronto
        requestAnimationFrame(() => {
          restoreScroll();
          
          // Verificar e corrigir se necessário após um frame
          requestAnimationFrame(() => {
            const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(currentScroll - scrollY) > 1) {
              restoreScroll();
            }
          });
        });
      };
    }
  }, [sidebarOpen]);

  return (
    <SearchProvider>
      <div className="layout">
        <Sidebar sidebarOpen={sidebarOpen} onNavigate={closeSidebar} />
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={toggleSidebar} />
        
        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <TopBar onMenuClick={toggleSidebar} />
          <main className="content">
            {children}
          </main>
        </div>
        
        <HelpGuide onMenuClick={toggleSidebar} />
        <SearchResults />
      </div>
    </SearchProvider>
  );
};

export default Layout;
