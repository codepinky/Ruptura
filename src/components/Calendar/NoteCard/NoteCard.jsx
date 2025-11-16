import React, { useState } from 'react';
import { StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
import './NoteCard.css';

const NoteCard = ({ note, onClick, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const getNoteStyle = () => {
    return {
      borderLeftColor: note.color || '#F59E0B',
      backgroundColor: `${note.color || '#F59E0B'}15`
    };
  };

  return (
    <div 
      className={`note-card ${compact ? 'compact' : ''} ${isExpanded ? 'expanded' : ''}`}
      style={getNoteStyle()}
      onClick={handleClick}
    >
      <div className="note-header">
        <div className="note-icon-wrapper">
          {note.icon ? (
            <span className="note-icon">{note.icon}</span>
          ) : (
            <StickyNote size={14} />
          )}
        </div>
        <span className="note-label">Nota</span>
        {!compact && (
          <button 
            className="note-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      <div className={`note-content ${isExpanded ? 'expanded' : ''}`}>
        {note.text}
      </div>
    </div>
  );
};

export default NoteCard;




