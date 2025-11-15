import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCalendar } from '../../../context/CalendarContext';
import './NoteForm.css';

const NOTE_COLORS = [
  '#F59E0B', '#3B82F6', '#10B981', '#EF4444', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const NoteForm = ({ note, date, onClose }) => {
  const { addNote, updateNote } = useCalendar();
  const [text, setText] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [color, setColor] = useState('#F59E0B');

  useEffect(() => {
    if (note) {
      setText(note.text || '');
      setNoteDate(new Date(note.date).toISOString().split('T')[0]);
      setColor(note.color || '#F59E0B');
    } else if (date) {
      const d = new Date(date);
      setNoteDate(d.toISOString().split('T')[0]);
    }
  }, [note, date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const noteData = {
      text,
      date: new Date(noteDate).toISOString(),
      color
    };

    if (note) {
      updateNote({ ...noteData, id: note.id });
    } else {
      addNote(noteData);
    }

    onClose();
  };

  return (
    <div className="note-form-overlay" onClick={onClose}>
      <div className="note-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="note-form-header">
          <h2>{note ? 'Editar Nota' : 'Nova Nota'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label>Data *</label>
            <input
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Texto da nota *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite sua nota..."
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label>Cor</label>
            <div className="color-picker">
              {NOTE_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              {note ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;


