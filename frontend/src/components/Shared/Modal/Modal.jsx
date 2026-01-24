import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${size}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <button className="modal-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          )}
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;