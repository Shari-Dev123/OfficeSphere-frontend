// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import Navbar from '../Navbar/Navbar';
// import EmployeeSidebar from '../Sidebar/EmployeeSidebar';
// import './EmployeeLayout.css';

// function EmployeeLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="employee-layout">
//       {/* Sidebar */}
//       <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content Area */}
//       <div className={`employee-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
//         {/* Top Navbar */}
//         <Navbar toggleSidebar={toggleSidebar} />

//         {/* Page Content */}
//         <div className="employee-content-wrapper">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EmployeeLayout;




import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import EmployeeSidebar from '../Sidebar/EmployeeSidebar';
import './EmployeeLayout.css';

function EmployeeLayout() {
  // Set initial sidebar state based on window width
  const isMobileView = window.innerWidth <= 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobileView); 
  const [isMobile, setIsMobile] = useState(isMobileView);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Automatically close sidebar if switching to mobile
      if (mobile && sidebarOpen) setSidebarOpen(false);
      // Automatically open sidebar if switching to desktop
      if (!mobile && !sidebarOpen) setSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  return (
    <div className="employee-layout">
      {/* Sidebar */}
      <EmployeeSidebar isOpen={sidebarOpen} />

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`employee-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      >
        {/* Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="employee-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default EmployeeLayout;

