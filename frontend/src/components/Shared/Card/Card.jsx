import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  headerAction,
  noPadding = false,
  hoverable = false
}) => {
  const cardClass = `
    card 
    ${hoverable ? 'card-hoverable' : ''} 
    ${className}
  `.trim();

  return (
    <div className={cardClass}>
      {(title || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'card-body-no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;