import React from 'react';
import { X, Calendar, Clock, MapPin, Edit, Trash2, Tag, FileText, Bell, Flag, CheckCircle } from 'lucide-react';
import { useCalendar, CALENDAR_ITEM_TYPES, TASK_STATUS, PRIORITY } from '../../../context/CalendarContext';
import { useNotification } from '../../../context/NotificationContext';
import { useTheme } from '../../../context/ThemeContext';
import './EventDetailModal.css';

const EventDetailModal = ({ item, isOpen, onClose, onEdit }) => {
  const { deleteEvent, deleteTask, deleteReminder, deleteNote } = useCalendar();
  const { success, error } = useNotification();
  const { currentTheme } = useTheme();

  if (!isOpen || !item) return null;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        switch (item.type) {
          case CALENDAR_ITEM_TYPES.EVENT:
            deleteEvent(item.id);
            break;
          case CALENDAR_ITEM_TYPES.TASK:
            deleteTask(item.id);
            break;
          case CALENDAR_ITEM_TYPES.REMINDER:
            deleteReminder(item.id);
            break;
          case CALENDAR_ITEM_TYPES.NOTE:
            deleteNote(item.id);
            break;
          default:
            break;
        }
        success('Item excluído com sucesso!');
        onClose();
      } catch (err) {
        error('Erro ao excluir item: ' + err.message);
      }
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      [TASK_STATUS.PENDING]: 'Pendente',
      [TASK_STATUS.IN_PROGRESS]: 'Em Progresso',
      [TASK_STATUS.COMPLETED]: 'Concluída'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      [PRIORITY.LOW]: 'Baixa',
      [PRIORITY.MEDIUM]: 'Média',
      [PRIORITY.HIGH]: 'Alta'
    };
    return labels[priority] || priority;
  };

  const renderEventDetails = () => {
    const start = formatDateTime(item.startDate);
    const end = formatDateTime(item.endDate);

    return (
      <>
        <div className="detail-section">
          <div className="detail-item">
            <Calendar size={18} />
            <div>
              <strong>Início:</strong>
              <p>{start.date} às {start.time}</p>
            </div>
          </div>
          <div className="detail-item">
            <Clock size={18} />
            <div>
              <strong>Término:</strong>
              <p>{end.date} às {end.time}</p>
            </div>
          </div>
          {item.location && (
            <div className="detail-item">
              <MapPin size={18} />
              <div>
                <strong>Localização:</strong>
                <p>{item.location}</p>
              </div>
            </div>
          )}
          {item.recurrence && (
            <div className="detail-item">
              <Calendar size={18} />
              <div>
                <strong>Repetição:</strong>
                <p>{item.recurrence === 'daily' ? 'Diariamente' : 
                    item.recurrence === 'weekly' ? 'Semanalmente' :
                    item.recurrence === 'monthly' ? 'Mensalmente' :
                    item.recurrence === 'yearly' ? 'Anualmente' : item.recurrence}</p>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderTaskDetails = () => {
    return (
      <>
        <div className="detail-section">
          {item.dueDate && (
            <div className="detail-item">
              <Calendar size={18} />
              <div>
                <strong>Data de Vencimento:</strong>
                <p>{formatDate(item.dueDate)}</p>
              </div>
            </div>
          )}
          <div className="detail-item">
            <CheckCircle size={18} />
            <div>
              <strong>Status:</strong>
              <p>{getStatusLabel(item.status)}</p>
            </div>
          </div>
          <div className="detail-item">
            <Flag size={18} />
            <div>
              <strong>Prioridade:</strong>
              <p>{getPriorityLabel(item.priority)}</p>
            </div>
          </div>
          {item.category && (
            <div className="detail-item">
              <Tag size={18} />
              <div>
                <strong>Categoria:</strong>
                <p>{item.category}</p>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderReminderDetails = () => {
    const reminderDate = formatDateTime(item.date);
    const advanceLabels = {
      0: 'No momento',
      5: '5 minutos antes',
      15: '15 minutos antes',
      30: '30 minutos antes',
      60: '1 hora antes',
      1440: '1 dia antes'
    };

    return (
      <>
        <div className="detail-section">
          <div className="detail-item">
            <Calendar size={18} />
            <div>
              <strong>Data e Hora:</strong>
              <p>{reminderDate.date} às {reminderDate.time}</p>
            </div>
          </div>
          <div className="detail-item">
            <Bell size={18} />
            <div>
              <strong>Notificar:</strong>
              <p>{advanceLabels[item.advanceTime] || `${item.advanceTime} minutos antes`}</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderNoteDetails = () => {
    return (
      <>
        <div className="detail-section">
          {item.date && (
            <div className="detail-item">
              <Calendar size={18} />
              <div>
                <strong>Data Associada:</strong>
                <p>{formatDate(item.date)}</p>
              </div>
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="detail-item">
              <Tag size={18} />
              <div>
                <strong>Tags:</strong>
                <div className="tags-list">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="tag-badge">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderDetails = () => {
    switch (item.type) {
      case CALENDAR_ITEM_TYPES.EVENT:
        return renderEventDetails();
      case CALENDAR_ITEM_TYPES.TASK:
        return renderTaskDetails();
      case CALENDAR_ITEM_TYPES.REMINDER:
        return renderReminderDetails();
      case CALENDAR_ITEM_TYPES.NOTE:
        return renderNoteDetails();
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    const labels = {
      [CALENDAR_ITEM_TYPES.EVENT]: 'Evento',
      [CALENDAR_ITEM_TYPES.TASK]: 'Tarefa',
      [CALENDAR_ITEM_TYPES.REMINDER]: 'Lembrete',
      [CALENDAR_ITEM_TYPES.NOTE]: 'Nota'
    };
    return labels[item.type] || 'Item';
  };

  return (
    <div className="modal-overlay">
      <div 
        className={`event-detail-modal ${currentTheme === 'dark' ? 'dark-theme' : 'light-theme'}`} 
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: item.color }}
      >
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{item.title}</h2>
            <span className="item-type-badge">{getTypeLabel()}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {item.description && (
            <div className="detail-section">
              <div className="detail-item">
                <FileText size={18} />
                <div>
                  <strong>Descrição:</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            </div>
          )}

          {item.type === CALENDAR_ITEM_TYPES.NOTE && item.content && (
            <div className="detail-section">
              <div className="detail-item">
                <FileText size={18} />
                <div>
                  <strong>Conteúdo:</strong>
                  <p className="note-content">{item.content}</p>
                </div>
              </div>
            </div>
          )}

          {renderDetails()}
        </div>

        <div className="modal-actions">
          <button className="action-btn edit-btn" onClick={() => onEdit(item)}>
            <Edit size={16} />
            Editar
          </button>
          <button className="action-btn delete-btn" onClick={handleDelete}>
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;

