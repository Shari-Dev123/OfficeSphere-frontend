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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        className={`employee-main-content ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        {/* Top Navbar */}
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
