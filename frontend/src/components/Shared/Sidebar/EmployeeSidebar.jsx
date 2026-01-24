import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaClipboardCheck,
  FaTasks,
  FaProjectDiagram,
  FaFileAlt,
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa';
import './EmployeeSidebar.css';

const EmployeeSidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/employee/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/employee/attendance', icon: <FaClipboardCheck />, label: 'Attendance' },
    { path: '/employee/tasks', icon: <FaTasks />, label: 'My Tasks' },
    { path: '/employee/projects', icon: <FaProjectDiagram />, label: 'Projects' },
    { path: '/employee/daily-report', icon: <FaFileAlt />, label: 'Daily Report' },
    { path: '/employee/meetings', icon: <FaCalendarAlt />, label: 'Meetings' },
    { path: '/employee/profile', icon: <FaUser />, label: 'Profile' },
  ];

  return (
    <aside className={`sidebar employee-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Employee Panel</h3>
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

export default EmployeeSidebar;