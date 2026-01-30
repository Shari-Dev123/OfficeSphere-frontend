import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { ProjectProvider } from './context/ProjectContext';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketContext';
import './App.css';

function App() {
  return (
    <SocketProvider>
    <BrowserRouter>
      <AuthProvider>
        <AttendanceProvider>
          <ProjectProvider>
            {/* Main Application Routes */}
            <AppRoutes />
            
            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </ProjectProvider>
        </AttendanceProvider>
      </AuthProvider>
    </BrowserRouter>
    </SocketProvider>
  );
}

export default App;