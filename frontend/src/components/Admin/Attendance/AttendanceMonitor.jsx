import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../../utils/api';
import { FiCalendar, FiClock, FiUsers, FiAlertCircle, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AttendanceMonitor.css';

function AttendanceMonitor() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  });
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Use ref for polling interval
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchAttendance();

    // ✅ Set up auto-refresh polling every 30 seconds for today's date
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
      console.log('🔄 Setting up auto-refresh polling for attendance monitor (30s interval)');
      pollingIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refreshing attendance data...');
        refreshAttendance();
      }, 30000); // 30 seconds
    }

    // Cleanup on unmount or date change
    return () => {
      if (pollingIntervalRef.current) {
        console.log('🧹 Cleaning up attendance polling interval');
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      console.log('====================================');
      console.log('🔍 ATTENDANCE MONITOR - Fetching attendance for:', selectedDate);
      console.log('====================================');
      
      const response = await adminAPI.getDailyAttendance({ date: selectedDate });
      
      console.log('📊 ATTENDANCE MONITOR API RESPONSE:');
      console.log('Full response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.attendance:', response.data.attendance);
      console.log('response.data.data:', response.data.data);
      
      // ✅ Handle different API response structures
      let attendanceList = [];
      
      // Try different possible structures
      if (response.data && response.data.attendance) {
        attendanceList = response.data.attendance;
        console.log('✅ Found attendance in response.data.attendance');
      } else if (response.data && response.data.data && response.data.data.attendance) {
        attendanceList = response.data.data.attendance;
        console.log('✅ Found attendance in response.data.data.attendance');
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        attendanceList = response.data.data;
        console.log('✅ Found attendance as array in response.data.data');
      } else if (response.data && Array.isArray(response.data)) {
        attendanceList = response.data;
        console.log('✅ Found attendance as array in response.data');
      }
      
      console.log('✅ Attendance list:', attendanceList);
      console.log('✅ Number of records:', attendanceList.length);
      
      if (attendanceList.length > 0) {
        console.log('✅ First record sample:', attendanceList[0]);
      }
      
      setAttendanceData(attendanceList);
      
      // Calculate stats
      const total = attendanceList.length;
      const present = attendanceList.filter(a => 
        a.status === 'present' || a.status === 'Present'
      ).length;
      const late = attendanceList.filter(a => 
        a.status === 'late' || a.status === 'Late'
      ).length;
      const absent = total - present - late;

      console.log('📊 Calculated stats:', { total, present, late, absent });
      
      setStats({ total, present, absent, late });
      setLastRefreshTime(new Date());
      
      console.log('====================================');
    } catch (error) {
      console.error('====================================');
      console.error('❌ ATTENDANCE MONITOR - Error fetching attendance');
      console.error('====================================');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('====================================');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh function for auto-polling (doesn't show loading spinner)
  const refreshAttendance = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing attendance data (background)...');
      
      const response = await adminAPI.getDailyAttendance({ date: selectedDate });
      
      // Handle different API response structures
      let attendanceList = [];
      
      // if (response.data && response.data.attendance) {
      //   attendanceList = response.data.attendance;
      // } else if (response.data && response.data.data && response.data.data.attendance) {
      //   attendanceList = response.data.data.attendance;
      // } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      //   attendanceList = response.data.data;
      // } else if (response.data && Array.isArray(response.data)) {
      //   attendanceList = response.data;
      // }
      // Backend directly sends: { success: true, stats: {...}, attendance: [...] }
if (response.data && response.data.attendance && Array.isArray(response.data.attendance)) {
  attendanceList = response.data.attendance;
}

if (response.data && response.data.stats) {
  statsData = response.data.stats;
}
      setAttendanceData(attendanceList);
      
      // Calculate stats
      const total = attendanceList.length;
      const present = attendanceList.filter(a => 
        a.status === 'present' || a.status === 'Present'
      ).length;
      const late = attendanceList.filter(a => 
        a.status === 'late' || a.status === 'Late'
      ).length;
      const absent = total - present - late;

      setStats({ total, present, absent, late });
      setLastRefreshTime(new Date());
      
      console.log('✅ Attendance refreshed successfully:', attendanceList.length, 'records');
      
    } catch (error) {
      console.error('❌ Error refreshing attendance:', error);
      // Don't show toast on auto-refresh errors
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Manual refresh handler
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchAttendance();
    toast.success('Attendance data refreshed!');
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
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
    return status?.toLowerCase() || 'absent';
  };

  const formatTime = (time) => {
    if (!time) return '-';
    try {
      return new Date(time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      console.error('Error formatting time:', time, e);
      return '-';
    }
  };

  const formatLastRefresh = () => {
    const now = new Date();
    const diff = Math.floor((now - lastRefreshTime) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 120) return '1 minute ago';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastRefreshTime.toLocaleTimeString('en-US', { 
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
          {/* Last refresh indicator */}
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            {refreshing ? (
              <>
                <FiRefreshCw style={{ 
                  animation: 'spin 1s linear infinite', 
                  marginRight: '4px',
                  display: 'inline-block'
                }} /> 
                Refreshing...
              </>
            ) : (
              <>Last updated: {formatLastRefresh()}</>
            )}
          </p>
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
          <button 
            className="btn btn-primary" 
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
          >
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
          <h3>Attendance Records ({attendanceData.length})</h3>
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
                  <tr key={record._id || index}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {record.employeeName?.charAt(0) || record.employee?.name?.charAt(0) || 'E'}
                        </div>
                        <span>{record.employeeName || record.employee?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="email-cell">{record.email || record.employee?.email || '-'}</td>
                    <td className="time-cell">{formatTime(record.checkIn || record.checkInTime)}</td>
                    <td className="time-cell">{formatTime(record.checkOut || record.checkOutTime)}</td>
                    <td className="hours-cell">
                      {record.workHours || record.totalHours || '-'}
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

      {/* Add CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default AttendanceMonitor;