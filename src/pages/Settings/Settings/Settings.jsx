import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useNotification } from '../../../context/NotificationContext';
import { 
  Palette, 
  Globe, 
  Bell, 
  Database, 
  User,
  Download,
  Upload,
  Trash2,
  Save,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { currentTheme, setTheme } = useTheme();
  const { success, error, warning } = useNotification();

  // Estado das configurações
  const [settings, setSettings] = useState({
    theme: currentTheme || 'auto',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    language: 'pt-BR',
    notifications: {
      enabled: true,
      duration: 4000
    },
    profile: {
      name: 'Usuário',
      email: 'usuario@email.com'
    }
  });

  // Carregar configurações do localStorage ao montar
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        // Verificar se o tema atual corresponde ao salvo
        const savedTheme = parsed.theme;
        if (savedTheme) {
          if (savedTheme === 'auto') {
            // Se for auto, verificar se há tema salvo no localStorage
            const savedThemePreference = localStorage.getItem('theme');
            if (!savedThemePreference) {
              // Não há preferência salva, então está em modo auto
              setSettings(prev => ({ ...prev, theme: 'auto' }));
            } else {
              // Há preferência salva, então não está em modo auto
              setSettings(prev => ({ ...prev, theme: savedThemePreference }));
            }
          } else {
            // Tema específico salvo
            setSettings(prev => ({ ...prev, theme: savedTheme }));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    } else {
      // Se não há configurações salvas, verificar se há tema salvo
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setSettings(prev => ({ ...prev, theme: savedTheme }));
      } else {
        // Sem preferência salva = modo auto
        setSettings(prev => ({ ...prev, theme: 'auto' }));
      }
    }
  }, [setTheme]);

  // Salvar configurações no localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      // Aplicar tema
      if (settings.theme === 'auto') {
        // Remover preferência salva para usar a do sistema
        localStorage.removeItem('theme');
        // Detectar preferência do sistema
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
      } else {
        setTheme(settings.theme);
      }
      success('Configurações salvas com sucesso!');
    } catch (err) {
      error('Erro ao salvar configurações');
    }
  };

  // Atualizar uma configuração específica
  const updateSetting = (path, value) => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [path]: value
      }));
    }
  };

  // Exportar dados
  const handleExportData = () => {
    try {
      // Buscar dados do localStorage
      const financialData = localStorage.getItem('financial-data');
      const appSettings = localStorage.getItem('appSettings');
      
      const dataToExport = {
        financialData: financialData ? JSON.parse(financialData) : {
          transactions: [],
          categories: [],
          budgets: [],
          goals: [],
          savings: []
        },
        settings: appSettings ? JSON.parse(appSettings) : settings,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ruptura_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      success('Dados exportados com sucesso!');
    } catch (err) {
      error('Erro ao exportar dados');
    }
  };

  // Importar dados
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          
          // Validar estrutura básica
          if (!importedData.financialData) {
            throw new Error('Arquivo inválido: estrutura de dados não encontrada');
          }

          // Confirmar importação
          if (window.confirm('Isso irá substituir todos os seus dados atuais. Deseja continuar?')) {
            // Importar dados financeiros
            if (importedData.financialData) {
              localStorage.setItem('financial-data', JSON.stringify(importedData.financialData));
            }
            
            // Importar configurações
            if (importedData.settings) {
              localStorage.setItem('appSettings', JSON.stringify(importedData.settings));
              setSettings(importedData.settings);
            }

            success('Dados importados com sucesso! Recarregue a página para ver as mudanças.');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } catch (err) {
          error('Erro ao importar dados. Verifique se o arquivo é válido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Limpar todos os dados
  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita!')) {
      if (window.confirm('Esta é sua última chance. Todos os dados serão perdidos permanentemente. Continuar?')) {
        try {
          localStorage.removeItem('financial-data');
          localStorage.removeItem('appSettings');
          
          warning('Todos os dados foram limpos. A página será recarregada.');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          error('Erro ao limpar dados');
        }
      }
    }
  };

  // Calcular tamanho dos dados
  const getStorageSize = () => {
    let totalSize = 0;
    const keys = ['financial-data', 'appSettings'];
    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });
    return (totalSize / 1024).toFixed(2); // KB
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <h1 className="settings-title">Configurações</h1>
          <p className="page-subtitle">
            Personalize sua experiência e gerencie seus dados
          </p>
        </div>
      </div>

      <div className="settings-container">
        {/* Seção: Aparência */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Palette size={24} />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Aparência</h2>
              <p className="section-description">Personalize o tema da aplicação</p>
            </div>
          </div>
          
          <div className="section-content">
            <div className="setting-item">
              <label className="setting-label">Tema</label>
              <div className="theme-options">
                <button
                  className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => updateSetting('theme', 'light')}
                >
                  <Sun size={20} />
                  <span>Claro</span>
                </button>
                <button
                  className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => updateSetting('theme', 'dark')}
                >
                  <Moon size={20} />
                  <span>Escuro</span>
                </button>
                <button
                  className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                  onClick={() => updateSetting('theme', 'auto')}
                >
                  <Monitor size={20} />
                  <span>Automático</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Localização */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Globe size={24} />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Localização</h2>
              <p className="section-description">Configurações de moeda, data e idioma</p>
            </div>
          </div>
          
          <div className="section-content">
            <div className="setting-item">
              <label className="setting-label">Moeda</label>
              <select
                className="setting-input"
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
              >
                <option value="BRL">BRL - Real Brasileiro (R$)</option>
                <option value="USD">USD - Dólar Americano ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-label">Formato de Data</label>
              <select
                className="setting-input"
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-label">Idioma</label>
              <input
                type="text"
                className="setting-input"
                value={settings.language}
                disabled
                readOnly
              />
              <p className="setting-hint">Português (Brasil) - Padrão</p>
            </div>
          </div>
        </div>

        {/* Seção: Notificações */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Bell size={24} />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Notificações</h2>
              <p className="section-description">Configure as preferências de notificações</p>
            </div>
          </div>
          
          <div className="section-content">
            <div className="setting-item">
              <div className="setting-toggle-wrapper">
                <label className="setting-label">Habilitar Notificações</label>
                <button
                  className={`setting-toggle ${settings.notifications.enabled ? 'active' : ''}`}
                  onClick={() => updateSetting('notifications.enabled', !settings.notifications.enabled)}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
            </div>

            <div className="setting-item">
              <label className="setting-label">Duração Padrão (ms)</label>
              <input
                type="number"
                className="setting-input"
                value={settings.notifications.duration}
                onChange={(e) => updateSetting('notifications.duration', parseInt(e.target.value) || 4000)}
                min="1000"
                max="10000"
                step="500"
              />
              <p className="setting-hint">Tempo que as notificações ficam visíveis (1000-10000ms)</p>
            </div>
          </div>
        </div>

        {/* Seção: Dados */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <Database size={24} />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Dados</h2>
              <p className="section-description">Gerencie seus dados e backups</p>
            </div>
          </div>
          
          <div className="section-content">
            <div className="setting-item">
              <label className="setting-label">Armazenamento</label>
              <p className="storage-info">
                Tamanho total: <strong>{getStorageSize()} KB</strong>
              </p>
            </div>

            <div className="setting-actions">
              <button
                className="setting-button primary"
                onClick={handleExportData}
              >
                <Download size={18} />
                <span>Exportar Dados</span>
              </button>
              <button
                className="setting-button secondary"
                onClick={handleImportData}
              >
                <Upload size={18} />
                <span>Importar Dados</span>
              </button>
              <button
                className="setting-button danger"
                onClick={handleClearData}
              >
                <Trash2 size={18} />
                <span>Limpar Dados</span>
              </button>
            </div>
          </div>
        </div>

        {/* Seção: Perfil */}
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">
              <User size={24} />
            </div>
            <div className="section-title-wrapper">
              <h2 className="section-title">Perfil</h2>
              <p className="section-description">Informações pessoais</p>
            </div>
          </div>
          
          <div className="section-content">
            <div className="setting-item">
              <label className="setting-label">Nome</label>
              <input
                type="text"
                className="setting-input"
                value={settings.profile.name}
                onChange={(e) => updateSetting('profile.name', e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="setting-item">
              <label className="setting-label">Email</label>
              <input
                type="email"
                className="setting-input"
                value={settings.profile.email}
                onChange={(e) => updateSetting('profile.email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="settings-actions">
          <button
            className="save-settings-button"
            onClick={saveSettings}
          >
            <Save size={20} />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

