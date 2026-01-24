import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserTie, 
  FaProjectDiagram, 
  FaClipboardCheck,
  FaTasks,
  FaCalendarAlt,
  FaChartBar,
  FaCog
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/employees', icon: <FaUsers />, label: 'Employees' },
    { path: '/admin/clients', icon: <FaUserTie />, label: 'Clients' },
    { path: '/admin/projects', icon: <FaProjectDiagram />, label: 'Projects' },
    { path: '/admin/attendance', icon: <FaClipboardCheck />, label: 'Attendance' },
    { path: '/admin/tasks', icon: <FaTasks />, label: 'Tasks' },
    { path: '/admin/meetings', icon: <FaCalendarAlt />, label: 'Meetings' },
    { path: '/admin/reports', icon: <FaChartBar />, label: 'Reports' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
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

export default AdminSidebar;