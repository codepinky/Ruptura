import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Flag, Tag, CheckCircle } from 'lucide-react';
import { useCalendar, CALENDAR_ITEM_TYPES, TASK_STATUS, PRIORITY } from '../../../context/CalendarContext';
import { useNotification } from '../../../context/NotificationContext';
import './TaskForm.css';

const TaskForm = ({ isOpen, onClose, editingItem = null }) => {
  const { addTask, updateTask } = useCalendar();
  const { success, error } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: TASK_STATUS.PENDING,
    priority: PRIORITY.MEDIUM,
    category: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          title: editingItem.title || '',
          description: editingItem.description || '',
          dueDate: editingItem.dueDate ? new Date(editingItem.dueDate).toISOString().split('T')[0] : '',
          status: editingItem.status || TASK_STATUS.PENDING,
          priority: editingItem.priority || PRIORITY.MEDIUM,
          category: editingItem.category || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          dueDate: new Date().toISOString().split('T')[0],
          status: TASK_STATUS.PENDING,
          priority: PRIORITY.MEDIUM,
          category: ''
        });
      }
      setFormErrors({});
    }
  }, [isOpen, editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Título é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        type: CALENDAR_ITEM_TYPES.TASK,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate ? new Date(formData.dueDate + 'T00:00:00').toISOString() : undefined,
        status: formData.status,
        priority: formData.priority,
        category: formData.category.trim() || undefined
      };

      if (editingItem) {
        updateTask({ ...taskData, id: editingItem.id });
        success('Tarefa atualizada com sucesso!');
      } else {
        addTask(taskData);
        success('Tarefa criada com sucesso!');
      }

      onClose();
    } catch (err) {
      error('Erro ao salvar tarefa: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{editingItem ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">
              Título <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nome da tarefa"
              className={formErrors.title ? 'error' : ''}
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes da tarefa"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">
              <Calendar size={16} />
              Data de Vencimento
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">
                <CheckCircle size={16} />
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={TASK_STATUS.PENDING}>Pendente</option>
                <option value={TASK_STATUS.IN_PROGRESS}>Em Progresso</option>
                <option value={TASK_STATUS.COMPLETED}>Concluída</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <Flag size={16} />
                Prioridade
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value={PRIORITY.LOW}>Baixa</option>
                <option value={PRIORITY.MEDIUM}>Média</option>
                <option value={PRIORITY.HIGH}>Alta</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">
              <Tag size={16} />
              Categoria
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Ex: Trabalho, Pessoal, etc."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Atualizar' : 'Criar'} Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

