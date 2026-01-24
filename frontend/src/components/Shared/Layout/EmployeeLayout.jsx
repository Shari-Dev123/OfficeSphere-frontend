import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import EmployeeSidebar from '../Sidebar/EmployeeSidebar';
import './EmployeeLayout.css';

function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="employee-layout">
      {/* Sidebar */}
      <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`employee-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="employee-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default EmployeeLayout;