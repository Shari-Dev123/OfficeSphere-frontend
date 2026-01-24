import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaProjectDiagram,
  FaCalendarAlt,
  FaChartBar,
  FaComments,
  FaUser
} from 'react-icons/fa';
import './ClientSidebar.css';

const ClientSidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/client/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/client/projects', icon: <FaProjectDiagram />, label: 'My Projects' },
    { path: '/client/meetings', icon: <FaCalendarAlt />, label: 'Meetings' },
    { path: '/client/reports', icon: <FaChartBar />, label: 'Reports' },
    { path: '/client/feedback', icon: <FaComments />, label: 'Feedback' },
    { path: '/client/profile', icon: <FaUser />, label: 'Profile' },
  ];

  return (
    <aside className={`sidebar client-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Client Portal</h3>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default ClientSidebar;