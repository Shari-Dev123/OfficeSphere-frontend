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
  // ✅ Determine initial mobile state
  const isMobileInitial = window.innerWidth <= 768;

  // ✅ Initial sidebar state: desktop open, mobile closed
  const [sidebarOpen, setSidebarOpen] = useState(!isMobileInitial);
  const [isMobile, setIsMobile] = useState(isMobileInitial);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(true); // desktop pe hamesha open
      } else {
        setSidebarOpen(false); // mobile pe pehli render closed
      }
    };

    // ✅ Run once on mount to fix first render issue
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} />

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
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



