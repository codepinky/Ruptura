import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { User, LogOut } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (err) {
      error('Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <h1 className="settings-title">Configurações</h1>
          <p className="page-subtitle">
            Informações da sua conta
          </p>
        </div>
      </div>

      <div className="settings-container">
        {/* Seção: Perfil */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <User size={24} />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Informações do Cliente</h2>
              <p className="section-description">Dados básicos da sua conta</p>
            </div>
          </div>
          
          <div className="section-content">
            <div className="setting-item">
              <label className="setting-label">Nome</label>
              <input
                type="text"
                className="setting-input"
                value={currentUser?.displayName || currentUser?.name || 'Não informado'}
                disabled
                readOnly
              />
            </div>

            <div className="setting-item">
              <label className="setting-label">Email</label>
              <input
                type="email"
                className="setting-input"
                value={currentUser?.email || 'Não informado'}
                disabled
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Botão Sair */}
        <div className="settings-actions">
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

