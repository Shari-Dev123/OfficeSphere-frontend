import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useRealTimeUpdates = (userRole, userId) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // User ko apne room mein join karwao
    socket.emit('join-room', { role: userRole, userId });

    // Common events for all roles
    const events = {
      'task-created': handleTaskCreated,
      'task-updated': handleTaskUpdated,
      'task-deleted': handleTaskDeleted,
      'project-created': handleProjectCreated,
      'project-updated': handleProjectUpdated,
      'project-deleted': handleProjectDeleted,
      'meeting-scheduled': handleMeetingScheduled,
      'meeting-updated': handleMeetingUpdated,
      'attendance-marked': handleAttendanceMarked,
      'feedback-submitted': handleFeedbackSubmitted,
      'employee-added': handleEmployeeAdded,
      'client-added': handleClientAdded,
    };

    // Register all event listeners
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup
    return () => {
      Object.keys(events).forEach(event => {
        socket.off(event);
      });
      socket.emit('leave-room', { role: userRole, userId });
    };
  }, [socket, userRole, userId]);

  // Event Handlers
  function handleTaskCreated(data) {
    console.log('New task created:', data);
    addNotification(`New task assigned: ${data.task.title}`);
    window.dispatchEvent(new CustomEvent('refresh-tasks', { detail: data }));
  }

  function handleTaskUpdated(data) {
    console.log('Task updated:', data);
    addNotification(`Task updated: ${data.task.title}`);
    window.dispatchEvent(new CustomEvent('refresh-tasks', { detail: data }));
  }

  function handleTaskDeleted(data) {
    addNotification(`Task deleted: ${data.taskId}`);
    window.dispatchEvent(new CustomEvent('refresh-tasks', { detail: data }));
  }

  function handleProjectCreated(data) {
    console.log('New project created:', data);
    addNotification(`New project: ${data.project.name}`);
    window.dispatchEvent(new CustomEvent('refresh-projects', { detail: data }));
  }

  function handleProjectUpdated(data) {
    console.log('Project updated:', data);
    addNotification(`Project updated: ${data.project.name}`);
    window.dispatchEvent(new CustomEvent('refresh-projects', { detail: data }));
  }

  function handleProjectDeleted(data) {
    addNotification(`Project deleted`);
    window.dispatchEvent(new CustomEvent('refresh-projects', { detail: data }));
  }

  function handleMeetingScheduled(data) {
    addNotification(`Meeting scheduled: ${data.meeting.title}`);
    window.dispatchEvent(new CustomEvent('refresh-meetings', { detail: data }));
  }

  function handleMeetingUpdated(data) {
    addNotification(`Meeting updated: ${data.meeting.title}`);
    window.dispatchEvent(new CustomEvent('refresh-meetings', { detail: data }));
  }

  function handleAttendanceMarked(data) {
    addNotification(`Attendance marked by ${data.employeeName}`);
    window.dispatchEvent(new CustomEvent('refresh-attendance', { detail: data }));
  }

  function handleFeedbackSubmitted(data) {
    addNotification(`New feedback from ${data.clientName}`);
    window.dispatchEvent(new CustomEvent('refresh-feedback', { detail: data }));
  }

  function handleEmployeeAdded(data) {
    addNotification(`New employee added: ${data.employee.name}`);
    window.dispatchEvent(new CustomEvent('refresh-employees', { detail: data }));
  }

  function handleClientAdded(data) {
    addNotification(`New client added: ${data.client.name}`);
    window.dispatchEvent(new CustomEvent('refresh-clients', { detail: data }));
  }

  function addNotification(message) {
    const notification = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    
    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification('OfficeSphere Update', { body: message });
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => setNotifications([]);

  return { notifications, markAsRead, clearAll };
};