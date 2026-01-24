import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import { FiPlay, FiPause, FiCheckCircle, FiClock, FiFilter } from 'react-icons/fi';
import { MdAssignment } from 'react-icons/md';
import './MyTasks.css';

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

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
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = async (taskId) => {
    try {
      await employeeAPI.startTaskTimer(taskId);
      setActiveTimer(taskId);
      setTimerSeconds(0);
      toast.success('Timer started');
    } catch (error) {
      toast.error('Failed to start timer');
    }
  };

  const handleStopTimer = async (taskId) => {
    try {
      await employeeAPI.stopTaskTimer(taskId);
      setActiveTimer(null);
      setTimerSeconds(0);
      toast.success('Timer stopped');
      fetchTasks(); // Refresh to get updated time
    } catch (error) {
      toast.error('Failed to stop timer');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await employeeAPI.updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <div className="header-left">
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

      {/* Active Timer Display */}
      {activeTimer && (
        <div className="active-timer-banner">
          <FiClock className="timer-icon" />
          <span>Timer Running: {formatTime(timerSeconds)}</span>
        </div>
      )}

      {/* Tasks List */}
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

              {/* Timer Section */}
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
                      {task.timeLogged ? `${task.timeLogged} logged` : 'No time logged'}
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

              {/* Status Update Buttons */}
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
    </div>
  );
}

export default MyTasks;