// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import Navbar from '../Navbar/Navbar';
// import ClientSidebar from '../Sidebar/ClientSidebar';
// import './ClientLayout.css';

// function ClientLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="client-layout">
//       {/* Sidebar */}
//       <ClientSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content Area */}
//       <div className={`client-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
//         {/* Top Navbar */}
//         <Navbar toggleSidebar={toggleSidebar} />

//         {/* Page Content */}
//         <div className="client-content-wrapper">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ClientLayout;



import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import ClientSidebar from '../Sidebar/ClientSidebar';
import './ClientLayout.css';

function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Desktop par sidebar hamesha open
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="client-layout">
      {/* Sidebar */}
      <ClientSidebar isOpen={sidebarOpen} />

      {/* Overlay (ONLY mobile) */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`client-main-content ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        {/* Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="client-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ClientLayout;
