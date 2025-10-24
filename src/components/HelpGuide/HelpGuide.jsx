import React, { useState } from 'react';
import { HelpCircle, X, Plus, CreditCard, BarChart3, Table } from 'lucide-react';
import './HelpGuide.css';

const HelpGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      icon: <Plus size={20} />,
      title: "Botão Flutuante",
      description: "Clique no botão azul com + no canto inferior direito",
      location: "Dashboard"
    },
    {
      icon: <CreditCard size={20} />,
      title: "Página de Transações",
      description: "Acesse 'Transações' na sidebar e clique em 'Nova Transação'",
      location: "Transações"
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Dashboard",
      description: "No Dashboard, clique em 'Adicionar primeira transação'",
      location: "Dashboard"
    },
    {
      icon: <Table size={20} />,
      title: "Planilha",
      description: "Na Planilha, visualize seus gastos organizados por categoria",
      location: "Planilha"
    }
  ];

  if (!isOpen) {
    return (
      <button 
        className="help-button"
        onClick={() => setIsOpen(true)}
        title="Como adicionar gastos?"
      >
        <HelpCircle size={20} />
      </button>
    );
  }

  return (
    <div className="help-overlay" onClick={() => setIsOpen(false)}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>💰 Como Adicionar Gastos</h2>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="help-content">
          <p className="help-intro">
            Você pode adicionar seus gastos de várias formas na plataforma:
          </p>
          
          <div className="steps-list">
            {steps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-icon">{step.icon}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="step-location">{step.location}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="help-tips">
            <h3>💡 Dicas:</h3>
            <ul>
              <li>Use o <strong>botão flutuante</strong> para acesso rápido</li>
              <li>Selecione a <strong>categoria correta</strong> para melhor organização</li>
              <li>Adicione <strong>observações</strong> para lembrar do que foi o gasto</li>
              <li>Visualize seus gastos na <strong>Planilha</strong> por categoria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuide;

