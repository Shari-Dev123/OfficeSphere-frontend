// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import Navbar from '../Navbar/Navbar';
// import AdminSidebar from '../Sidebar/AdminSidebar';
// import './AdminLayout.css';

// function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="admin-layout">
//       {/* Sidebar */}
//       <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content Area */}
//       <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
//         {/* Top Navbar */}
//         <Navbar toggleSidebar={toggleSidebar} />

//         {/* Page Content */}
//         <div className="admin-content-wrapper">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminLayout;




import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import AdminSidebar from '../Sidebar/AdminSidebar';
import './AdminLayout.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Desktop par sidebar auto open
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} />

      {/* Overlay (ONLY mobile) */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`admin-main-content ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        {/* Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
