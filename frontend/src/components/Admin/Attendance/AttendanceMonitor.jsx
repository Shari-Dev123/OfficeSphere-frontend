import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../utils/api';
import { FiCalendar, FiClock, FiUsers, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AttendanceMonitor.css';

function AttendanceMonitor() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDailyAttendance({ date: selectedDate });
      
      if (response.data) {
        setAttendanceData(response.data.attendance || []);
        
        // Calculate stats
        const total = response.data.attendance?.length || 0;
        const present = response.data.attendance?.filter(a => a.status === 'present').length || 0;
        const late = response.data.attendance?.filter(a => a.status === 'late').length || 0;
        const absent = total - present - late;

        setStats({ total, present, absent, late });
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FiCheckCircle className="status-icon present" />;
      case 'late':
        return <FiAlertCircle className="status-icon late" />;
      case 'absent':
        return <FiXCircle className="status-icon absent" />;
      default:
        return <FiClock className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return status || 'absent';
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="attendance-monitor">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-monitor">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Attendance Monitor</h1>
          <p>Track and manage employee attendance</p>
        </div>
        <div className="header-actions">
          <div className="date-selector">
            <FiCalendar />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button className="btn btn-primary" onClick={fetchAttendance}>
            <FiClock /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="attendance-stats">
        <div className="attendance-stat-card">
          <div className="attendance-stat-icon total">
            <FiUsers />
          </div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Total Employees</p>
            <h3 className="attendance-stat-value">{stats.total}</h3>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon present">
            <FiCheckCircle />
          </div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Present</p>
            <h3 className="attendance-stat-value">{stats.present}</h3>
            <span className="attendance-stat-percentage">
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon late">
            <FiAlertCircle />
          </div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Late</p>
            <h3 className="attendance-stat-value">{stats.late}</h3>
            <span className="attendance-stat-percentage">
              {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon absent">
            <FiXCircle />
          </div>
          <div className="attendance-stat-content">
            <p className="attendance-stat-label">Absent</p>
            <h3 className="attendance-stat-value">{stats.absent}</h3>
            <span className="attendance-stat-percentage">
              {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <div className="table-header">
          <h3>Attendance Records</h3>
          <p className="date-display">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {attendanceData.length > 0 ? (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {record.employeeName?.charAt(0) || 'E'}
                        </div>
                        <span>{record.employeeName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="email-cell">{record.email || '-'}</td>
                    <td className="time-cell">{formatTime(record.checkIn)}</td>
                    <td className="time-cell">{formatTime(record.checkOut)}</td>
                    <td className="hours-cell">
                      {record.workHours ? `${record.workHours}h` : '-'}
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(record.status)}
                        <span className={`status-badge ${getStatusClass(record.status)}`}>
                          {record.status || 'Absent'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FiUsers className="empty-icon" />
            <h3>No Attendance Data</h3>
            <p>No attendance records found for this date</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceMonitor;