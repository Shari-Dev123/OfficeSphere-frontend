import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiFilter, 
  FiClock, 
  FiUser,
  FiDownload,
  FiFile,
  FiEye
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import './TaskList.css';

function AdminTaskList() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !connected) return;

    console.log('🔌 Setting up admin task listeners');

    // Listen for all task events and refresh
    const handleTaskUpdate = () => {
      console.log('📡 Task update received, refreshing list...');
      fetchTasks();
    };

    socket.on('task-timer-started', handleTaskUpdate);
    socket.on('task-timer-stopped', handleTaskUpdate);
    socket.on('task-status-updated', handleTaskUpdate);
    socket.on('task-completed', handleTaskUpdate);
    socket.on('task-created', handleTaskUpdate);
    socket.on('task-updated', handleTaskUpdate);

    return () => {
      socket.off('task-timer-started', handleTaskUpdate);
      socket.off('task-timer-stopped', handleTaskUpdate);
      socket.off('task-status-updated', handleTaskUpdate);
      socket.off('task-completed', handleTaskUpdate);
      socket.off('task-created', handleTaskUpdate);
      socket.off('task-updated', handleTaskUpdate);
    };
  }, [socket, connected]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTasks();
      console.log('Tasks response:', response.data);
      setTasks(response.data.data || response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await adminAPI.deleteTask(taskId);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTask(null);
  };

  const downloadFile = (fileUrl, fileName) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const formatTimeLogged = (task) => {
    if (!task.actualHours || task.actualHours === 0) {
      return 'No time logged';
    }
    const hours = Math.floor(task.actualHours);
    const minutes = Math.round((task.actualHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-pending',
      'in-progress': 'status-in-progress',
      completed: 'status-completed'
    };
    return classes[status] || 'status-default';
  };

  if (loading) {
    return (
      <div className="admin-tasks">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tasks">
      {/* Socket connection indicator */}
      

      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1>Task Management</h1>
          <p>{filteredTasks.length} tasks found</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/tasks/create')}
        >
          <FiPlus /> Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button 
            className={filter === 'in-progress' ? 'active' : ''}
            onClick={() => setFilter('in-progress')}
          >
            In Progress ({tasks.filter(t => t.status === 'in-progress').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Time Logged</th>
              <th>Files</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <div className="task-info">
                      <strong>{task.title}</strong>
                      <span className="task-description-preview">
                        {task.description?.substring(0, 60)}...
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="assignee-info">
                      <FiUser />
                      <span>{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="date-info">
                      <FiClock />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className="time-logged">
                      {formatTimeLogged(task)}
                    </span>
                  </td>
                  <td>
                    {task.attachments && task.attachments.length > 0 ? (
                      <button
                        className="btn-icon"
                        onClick={() => viewTaskDetails(task)}
                        title="View attachments"
                      >
                        <FiFile />
                        <span className="badge">{task.attachments.length}</span>
                      </button>
                    ) : (
                      <span className="text-muted">No files</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => viewTaskDetails(task)}
                        title="View details"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/admin/tasks/edit/${task._id}`)}
                        title="Edit task"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(task._id)}
                        title="Delete task"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  <p>No tasks found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Task Info */}
              <div className="detail-section">
                <h3>{selectedTask.title}</h3>
                <p className="task-description">{selectedTask.description}</p>
              </div>

              {/* Task Meta */}
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Assigned To:</label>
                    <span>{selectedTask.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Priority:</label>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}
                    >
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusBadgeClass(selectedTask.status)}`}>
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Due Date:</label>
                    <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Time Logged:</label>
                    <span>{formatTimeLogged(selectedTask)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Estimated Hours:</label>
                    <span>{selectedTask.estimatedHours || 0}h</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              {(selectedTask.startedAt || selectedTask.completedAt) && (
                <div className="detail-section">
                  <h4>Timeline</h4>
                  <div className="timeline">
                    {selectedTask.startedAt && (
                      <div className="timeline-item">
                        <span className="timeline-label">Started:</span>
                        <span>{new Date(selectedTask.startedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedTask.completedAt && (
                      <div className="timeline-item">
                        <span className="timeline-label">Completed:</span>
                        <span>{new Date(selectedTask.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div className="detail-section">
                  <h4>
                    <FiFile /> Attachments ({selectedTask.attachments.length})
                  </h4>
                  <div className="attachments-grid">
                    {selectedTask.attachments.map((file, index) => (
                      <div key={index} className="attachment-card">
                        <div className="attachment-info">
                          <FiFile className="file-icon" />
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <small className="file-date">
                              {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown date'}
                            </small>
                          </div>
                        </div>
                        <button
                          className="btn-download"
                          onClick={() => downloadFile(file.url, file.name)}
                        >
                          <FiDownload />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Categorize attachments by source */}
                  {selectedTask.status === 'completed' && (
                    <div className="attachment-note">
                      <small>
                        ℹ️ Files uploaded by employee at completion are marked with completion timestamp
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetailsModal}>
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  closeDetailsModal();
                  navigate(`/admin/tasks/edit/${selectedTask._id}`);
                }}
              >
                <FiEdit /> Edit Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTaskList;