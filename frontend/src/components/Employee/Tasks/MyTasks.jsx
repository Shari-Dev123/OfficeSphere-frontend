//Emoployee Task

import React, { useState, useEffect } from 'react';
import { employeeAPI, uploadAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import { FiPlay, FiPause, FiCheckCircle, FiClock, FiFilter, FiDownload, FiFile, FiUpload, FiX } from 'react-icons/fi';
import { MdAssignment } from 'react-icons/md';
import './MyTasks.css';

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [completionAttachments, setCompletionAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getMyTasks();
      setTasks(response.data.tasks || []); 
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tasks/employee/${taskId}/timer/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start timer');
      }

      setActiveTimer(taskId);
      setTimerSeconds(0);
      toast.success('Timer started');
      fetchTasks();
    } catch (error) {
      console.error('Start timer error:', error);
      toast.error(error.message || 'Failed to start timer');
    }
  };

  const handleStopTimer = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tasks/employee/${taskId}/timer/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stop timer');
      }

      const data = await response.json();
      
      setActiveTimer(null);
      setTimerSeconds(0);
      toast.success(`Timer stopped. Time logged: ${data.data.timeLogged}`);
      fetchTasks();
    } catch (error) {
      console.error('Stop timer error:', error);
      toast.error(error.message || 'Failed to stop timer');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // If marking as completed, show modal for file upload
    if (newStatus === 'completed') {
      const task = tasks.find(t => t._id === taskId);
      setCompletingTask(task);
      setShowCompletionModal(true);
      return;
    }

    // For other status changes, proceed normally
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tasks/employee/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }

      toast.success('Task status updated');
      
      // Auto-start timer when status changes to in-progress
      if (newStatus === 'in-progress') {
        toast.info('Timer started automatically');
      }
      
      fetchTasks();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error('Some files exceed 10MB limit');
      return;
    }

    try {
      setUploadingFiles(true);

      const uploadPromises = files.map(async (file) => {
        const uploadRes = await uploadAPI.uploadFile(file, 'task-completion');
        return {
          name: file.name,
          url: uploadRes.data.url || uploadRes.data.file?.url,
          uploadedAt: new Date()
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setCompletionAttachments(prev => [...prev, ...uploadedFiles]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const removeCompletionAttachment = (index) => {
    setCompletionAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteTask = async () => {
    if (!completingTask) return;

    try {
      setSubmittingCompletion(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tasks/employee/${completingTask._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'completed',
          attachments: completionAttachments
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete task');
      }

      toast.success('Task completed successfully!');
      setShowCompletionModal(false);
      setCompletingTask(null);
      setCompletionAttachments([]);
      fetchTasks();
    } catch (error) {
      console.error('Complete task error:', error);
      toast.error(error.message || 'Failed to complete task');
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const cancelCompletion = () => {
    setShowCompletionModal(false);
    setCompletingTask(null);
    setCompletionAttachments([]);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeLogged = (task) => {
    if (!task.actualHours || task.actualHours === 0) {
      return 'No time logged';
    }
    const hours = Math.floor(task.actualHours);
    const minutes = Math.round((task.actualHours - hours) * 60);
    return `${hours}h ${minutes}m logged`;
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

  if (loading) {
    return (
      <div className="my-tasks">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-tasks">
      <div className="tasks-header">
        <div className="tasks-header-left">
          <h1><MdAssignment /> My Tasks</h1>
          <p>{filteredTasks.length} tasks</p>
        </div>
        <div className="header-right">
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
      </div>

      {activeTimer && (
        <div className="active-timer-banner">
          <FiClock className="timer-icon" />
          <span>Timer Running: {formatTime(timerSeconds)}</span>
        </div>
      )}

      <div className="tasks-grid">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-card-header">
                <div className="task-title-section">
                  <h3>{task.title}</h3>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority}
                  </span>
                </div>
                <span className={`status-badge ${task.status}`}>
                  {task.status.replace('-', ' ')}
                </span>
              </div>

              <p className="task-description">{task.description}</p>

              <div className="task-meta">
                <div className="meta-item">
                  <FiClock />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                {task.project && (
                  <div className="meta-item">
                    <MdAssignment />
                    <span>{task.project.name}</span>
                  </div>
                )}
              </div>

              {task.attachments && task.attachments.length > 0 && (
                <div className="task-attachments">
                  <h4><FiFile /> Attachments:</h4>
                  <div className="attachments-list">
                    {task.attachments.map((file, index) => (
                      <a 
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        <FiDownload />
                        <span>{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="task-timer">
                {activeTimer === task._id ? (
                  <div className="timer-active">
                    <span className="timer-display">{formatTime(timerSeconds)}</span>
                    <button 
                      className="timer-btn stop"
                      onClick={() => handleStopTimer(task._id)}
                    >
                      <FiPause /> Stop
                    </button>
                  </div>
                ) : (
                  <div className="timer-inactive">
                    <span className="time-logged">
                      {formatTimeLogged(task)}
                    </span>
                    {task.status !== 'completed' && (
                      <button 
                        className="timer-btn start"
                        onClick={() => handleStartTimer(task._id)}
                        disabled={activeTimer !== null}
                      >
                        <FiPlay /> Start Timer
                      </button>
                    )}
                  </div>
                )}
              </div>

              {task.status !== 'completed' && (
                <div className="task-actions">
                  {task.status === 'pending' && (
                    <button 
                      className="action-btn start-btn"
                      onClick={() => handleStatusChange(task._id, 'in-progress')}
                    >
                      Start Task
                    </button>
                  )}
                  {task.status === 'in-progress' && (
                    <button 
                      className="action-btn complete-btn"
                      onClick={() => handleStatusChange(task._id, 'completed')}
                    >
                      <FiCheckCircle /> Mark Complete
                    </button>
                  )}
                </div>
              )}

              {task.status === 'completed' && (
                <div className="completed-indicator">
                  <FiCheckCircle />
                  <span>Completed</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-tasks">
            <MdAssignment className="no-tasks-icon" />
            <h3>No tasks found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any tasks assigned yet"
                : `No ${filter.replace('-', ' ')} tasks`
              }
            </p>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="modal-overlay">
          <div className="completion-modal">
            <div className="modal-header">
              <h2>Complete Task</h2>
              <button onClick={cancelCompletion} className="close-btn">
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="task-info">
                <h3>{completingTask?.title}</h3>
                <p>{completingTask?.description}</p>
              </div>

              <div className="completion-section">
                <h4>Attach Completion Files (Optional)</h4>
                <p className="help-text">Upload any files related to task completion (screenshots, documents, etc.)</p>

                <div className="file-upload-area">
                  <input
                    type="file"
                    id="completion-files"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploadingFiles}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="completion-files" className="file-upload-label">
                    <FiUpload />
                    <span>{uploadingFiles ? 'Uploading...' : 'Click to upload files'}</span>
                    <small>PDF, DOC, TXT, Images, Excel (Max 10MB each)</small>
                  </label>
                </div>

                {completionAttachments.length > 0 && (
                  <div className="attachments-list">
                    {completionAttachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <FiFile />
                        <span className="attachment-name">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeCompletionAttachment(index)}
                          className="remove-btn"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={cancelCompletion} 
                className="btn-cancel"
                disabled={submittingCompletion}
              >
                Cancel
              </button>
              <button 
                onClick={handleCompleteTask}
                className="btn-complete"
                disabled={submittingCompletion || uploadingFiles}
              >
                {submittingCompletion ? (
                  <>
                    <div className="spinner-small"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Complete Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTasks;