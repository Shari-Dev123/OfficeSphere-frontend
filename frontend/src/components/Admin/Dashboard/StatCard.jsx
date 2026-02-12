import React from 'react';
import './StatCard.css';

function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className={`admin-stat-card admin-stat-card-${color}`}>
      <div className="admin-stat-card-header">
        <div className="stat-info">
          <p className="stat-title">{title}</p>
          <h3 className="Admin-stat-value">{value}</h3>
        </div>
        <div className={`Admin-Dashboard-stat-icon Admin-Dashboard-stat-icon-${color}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="stat-footer">
          <span className="stat-trend">{trend}</span>
          <span className="Admin-stat-label">from last month</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;