import React from 'react';
import './StatCard.css';

function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-info">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
        </div>
        <div className={`stat-icon stat-icon-${color}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="stat-footer">
          <span className="stat-trend">{trend}</span>
          <span className="stat-label">from last month</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;