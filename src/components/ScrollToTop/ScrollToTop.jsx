import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que faz scroll para o topo da página sempre que a rota mudar
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll suave para o topo quando a rota mudar
    const scrollToTop = () => {
      // Aguardar um frame para garantir que o conteúdo foi renderizado
      requestAnimationFrame(() => {
        // Método 1: Scroll suave (comportamento padrão)
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // Usar 'instant' para ser mais rápido e não causar delay
        });
        
        // Método 2: Fallback para navegadores que não suportam scrollTo com objeto
        if (window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
        
        // Método 3: Fallback adicional para garantir
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Método 4: Para elementos com scroll interno (se houver)
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
        
        const content = document.querySelector('.content');
        if (content) {
          content.scrollTop = 0;
        }
      });
    };

    scrollToTop();
    
    // Verificar novamente após um pequeno delay para garantir
    const timeoutId = setTimeout(() => {
      if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

