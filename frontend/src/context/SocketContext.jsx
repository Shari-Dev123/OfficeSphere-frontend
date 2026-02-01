// frontend/src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      console.log('⚠️ No user/token found, skipping socket connection');
      return;
    }

    const user = JSON.parse(userStr);

    // Backend URL - adjust if your backend is on a different port
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    console.log('🔌 Connecting to socket server:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);

      // Join appropriate rooms based on user role
      if (user.role === 'admin') {
        newSocket.emit('join-room', { role: 'admin', userId: user.id });
        console.log('👑 Joined admin room');
      } else if (user.role === 'employee') {
        newSocket.emit('join-room', { role: 'employee', userId: user.id });
        console.log('👤 Joined employee room');
      }
    });

    // ============================================
    // ADMIN TASK NOTIFICATIONS
    // ============================================
    if (user.role === 'admin') {
      // Task notifications
      newSocket.on('task-timer-started', (data) => {
        console.log('📡 Task timer started:', data);
        toast.info(
          `🟢 ${data.employeeName} started working on "${data.title}"`,
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
          }
        );
      });

      newSocket.on('task-timer-stopped', (data) => {
        console.log('📡 Task timer stopped:', data);
        toast.info(
          `⏸️ ${data.employeeName} logged ${data.timeLogged} on "${data.title}"`,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      });

      newSocket.on('task-status-updated', (data) => {
        console.log('📡 Task status updated:', data);
        const statusEmoji = data.status === 'in-progress' ? '▶️' : '📝';
        toast.info(
          `${statusEmoji} ${data.employeeName} updated "${data.title}" to ${data.status.replace('-', ' ')}`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      newSocket.on('task-completed', (data) => {
        console.log('📡 Task completed:', data);
        const hasAttachments = data.attachments && data.attachments.length > 0;
        toast.success(
          `✅ ${data.employeeName} completed "${data.title}" in ${data.actualHours?.toFixed(1) || 0}h ${hasAttachments ? '📎 with files' : ''}`,
          {
            position: 'top-right',
            autoClose: 6000,
          }
        );
      });

      newSocket.on('task-created', (data) => {
        console.log('📡 New task created:', data);
        toast.success(
          `📋 New task "${data.task.title}" assigned to ${data.employeeName}`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      // ============================================
      // ATTENDANCE NOTIFICATIONS
      // ============================================
      newSocket.on('employee-checked-in', (data) => {
        console.log('📡 Employee checked in:', data);
        toast.info(
          `👋 ${data.employeeName} checked in${data.isLate ? ' (Late)' : ''}`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      newSocket.on('employee-checked-out', (data) => {
        console.log('📡 Employee checked out:', data);
        toast.info(
          `🚪 ${data.employeeName} checked out - ${data.totalHours} hours`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      newSocket.on('leave-request', (data) => {
        console.log('📡 Leave request:', data);
        toast.warning(
          `🏖️ ${data.employeeName} requested ${data.leaveType} leave`,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      });

      newSocket.on('attendance-correction-request', (data) => {
        console.log('📡 Attendance correction:', data);
        toast.warning(
          `📝 ${data.employeeName} requested attendance correction`,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      });

      // ============================================
      // PROJECT NOTIFICATIONS
      // ============================================
      newSocket.on('project-created', (data) => {
        console.log('📡 Project created:', data);
        toast.success(
          `🎯 New project "${data.name}" created`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      newSocket.on('project-updated', (data) => {
        console.log('📡 Project updated:', data);
        toast.info(
          `📊 Project "${data.name}" updated - Status: ${data.status}`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      newSocket.on('project-completed', (data) => {
        console.log('📡 Project completed:', data);
        toast.success(
          `🎉 Project "${data.name}" completed!`,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      });

      // ============================================
      // MEETING NOTIFICATIONS
      // ============================================
      newSocket.on('meeting-scheduled', (data) => {
        console.log('📡 Meeting scheduled:', data);
        toast.info(
          `📅 Meeting "${data.title}" scheduled for ${data.date}`,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      });

      newSocket.on('meeting-cancelled', (data) => {
        console.log('📡 Meeting cancelled:', data);
        toast.warning(
          `❌ Meeting "${data.title}" cancelled`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      // ============================================
      // REPORT NOTIFICATIONS
      // ============================================
      newSocket.on('daily-report-submitted', (data) => {
        console.log('📡 Daily report submitted:', data);
        toast.info(
          `📄 ${data.employeeName} submitted daily report`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      newSocket.on('report-generated', (data) => {
        console.log('📡 Report generated:', data);
        toast.success(
          `📊 ${data.reportType} report ready`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      // ============================================
      // CLIENT NOTIFICATIONS
      // ============================================
      newSocket.on('client-registered', (data) => {
        console.log('📡 Client registered:', data);
        toast.success(
          `🤝 New client: ${data.companyName}`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      newSocket.on('client-feedback', (data) => {
        console.log('📡 Client feedback:', data);
        toast.info(
          `⭐ ${data.clientName} submitted feedback (${data.rating}/5)`,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      });

      // ============================================
      // EMPLOYEE NOTIFICATIONS (Admin view)
      // ============================================
      newSocket.on('employee-added', (data) => {
        console.log('📡 Employee added:', data);
        toast.success(
          `👤 ${data.name} joined as ${data.position}`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });

      // ============================================
      // GENERAL NOTIFICATIONS
      // ============================================
      newSocket.on('new-notification', (notification) => {
        console.log('📡 New notification:', notification);
        
        // Show toast based on type
        const toastFn = notification.type === 'alert' ? toast.error : toast.info;
        toastFn(notification.message, {
          position: 'top-right',
          autoClose: 4000,
        });
        
        // Trigger a refresh of notifications page if it's open
        // You can use a state manager or event emitter here
        window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
      });
    }

    // ============================================
    // EMPLOYEE TASK NOTIFICATIONS
    // ============================================
    if (user.role === 'employee') {
      // When admin assigns a new task
      newSocket.on('task-assigned', (data) => {
        console.log('📡 New task assigned:', data);
        toast.info(
          `📋 New task assigned: "${data.task.title}" (Priority: ${data.task.priority})`,
          {
            position: 'top-right',
            autoClose: 6000,
          }
        );
      });

      // When admin updates a task
      newSocket.on('task-updated', (data) => {
        console.log('📡 Task updated by admin:', data);
        toast.info(
          `📝 Task "${data.title}" was updated`,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
      });
    }

    newSocket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error:', error.message);
      setConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing socket connection');
      if (user.role === 'admin') {
        newSocket.emit('leave-room', { role: 'admin', userId: user.id });
      } else if (user.role === 'employee') {
        newSocket.emit('leave-room', { role: 'employee', userId: user.id });
      }
      newSocket.close();
    };
  }, []);

  const value = {
    socket,
    connected,
    isConnected: connected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;