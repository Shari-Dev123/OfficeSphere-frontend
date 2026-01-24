import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import AdminSidebar from '../Sidebar/AdminSidebar';
import './AdminLayout.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;