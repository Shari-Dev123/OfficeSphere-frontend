import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import ClientSidebar from '../Sidebar/ClientSidebar';
import './ClientLayout.css';

function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="client-layout">
      {/* Sidebar */}
      <ClientSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`client-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="client-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ClientLayout;