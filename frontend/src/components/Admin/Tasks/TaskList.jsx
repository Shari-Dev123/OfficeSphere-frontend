import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './TaskList.css';

function TaskList() {
  const navigate = useNavigate(); // ✅ Already have this
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTasks();
      console.log('Tasks response:', response.data);
      
      // ✅ Handle nested 'data' structure
      const tasksData = response.data.data || response.data.tasks || response.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteTask(id);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // ✅ NEW: Handle Edit button
  const handleEdit = (id) => {
    navigate(`/admin/tasks/edit/${id}`);
    // OR if you don't have edit page yet:
    // toast.info('Edit functionality coming soon');
  };

  // ✅ NEW: Handle Create Task button
  const handleCreateTask = () => {
    navigate('/admin/tasks/create');
    // OR if you don't have create page yet:
    // toast.info('Create task page coming soon');
  };

  const getFilteredTasks = () => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTasks = getFilteredTasks();

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="task-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>Manage and assign tasks to employees</p>
        </div>
        {/* ✅ FIXED: Added onClick handler */}
        <button 
          className="btn btn-primary"
          onClick={handleCreateTask}
        >
          <FiPlus /> Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="admin-task-stats">
        <div className="admin-stat-item">
          <span className="admin-stat-value">{stats.total}</span>
          <span className="admin-stat-label">Total Tasks</span>
        </div>
        <div className="admin-stat-item">
          <span className="admin-stat-value admin-stat-info">{stats.pending}</span>
          <span className="admin-stat-label">Pending</span>
        </div>
        <div className="admin-stat-item">
          <span className="admin-stat-value admin-stat-warning">{stats.inProgress}</span>
          <span className="admin-stat-label">In Progress</span>
        </div>
        <div className="admin-stat-item">
          <span className="admin-stat-value admin-stat-success">{stats.completed}</span>
          <span className="admin-stat-label">Completed</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({stats.inProgress})
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length > 0 ? (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <div className="task-priority">
                  <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'Medium'}
                  </span>
                </div>
                <div className="task-actions">
                  {/* ✅ FIXED: Added onClick handler */}
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => handleEdit(task._id)}
                    title="Edit Task"
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(task._id, task.title)}
                    title="Delete Task"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">
                  {task.description || 'No description provided'}
                </p>

                <div className="task-meta">
                  <div className="meta-item">
                    <FiUser />
                    <span>
                      {task.assignedTo?.name || 
                       task.assignedTo?.userId?.name || 
                       'Unassigned'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <FiCalendar />
                    <span>{formatDate(task.dueDate || task.deadline)}</span>
                  </div>
                  <div className="meta-item">
                    <FiClock />
                    <span>{task.estimatedHours || 0}h</span>
                  </div>
                </div>
              </div>

              <div className="task-footer">
                <span className={`status-badge ${getStatusColor(task.status)}`}>
                  {task.status?.replace('-', ' ') || 'Pending'}
                </span>
                {task.project && (
                  <span className="project-tag">
                    {task.project.name || task.project}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FiClock className="empty-icon" />
          <h3>No Tasks Found</h3>
          <p>
            {filter !== 'all'
              ? `No ${filter.replace('-', ' ')} tasks`
              : 'Start by creating your first task'}
          </p>
          {/* ✅ FIXED: Added onClick handler */}
          <button 
            className="btn btn-primary"
            onClick={handleCreateTask}
          >
            <FiPlus /> Create First Task
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskList;