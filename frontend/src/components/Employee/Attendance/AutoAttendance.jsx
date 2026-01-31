// ✅✅✅ COMPLETE FIX for AutoAttendance.jsx
// This fixes both issues:
// 1. Check-out stops timer properly
// 2. Timer doesn't restart on new check-in after checkout

import React, { useState, useEffect, useRef } from 'react';
import { employeeAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import { FiClock, FiMapPin, FiWifi, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { MdQrCodeScanner } from 'react-icons/md';
import './AutoAttendance.css';

function AutoAttendance() {
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [location, setLocation] = useState(null);
  const [checkInMethod, setCheckInMethod] = useState('auto');

  const timerIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);
  const syncIntervalRef = useRef(null);

  // ✅✅✅ CRITICAL FIX: Derive states from attendanceStatus directly
  const isCheckedIn = Boolean(
    attendanceStatus?.checkInTime && 
    !attendanceStatus?.checkOutTime &&
    !attendanceStatus?.checkOut
  );
  
  const isCheckedOut = Boolean(
    attendanceStatus?.checkInTime && 
    (attendanceStatus?.checkOutTime || attendanceStatus?.checkOut)
  );

  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        id: user?.id || user?._id || null,
        name: user?.name || 'Unknown',
        email: user?.email || 'unknown@example.com'
      };
    } catch (e) {
      return { id: null, name: 'Unknown', email: 'unknown@example.com' };
    }
  };

  const isCurrentUserSession = () => {
    const currentUser = getCurrentUser();
    const storedUserId = localStorage.getItem('attendance_userId');
    return currentUser.id && storedUserId && currentUser.id === storedUserId;
  };

  const clearAttendanceFromStorage = () => {
    console.log('🧹 Clearing attendance data from localStorage');
    localStorage.removeItem('attendance_checkInTime');
    localStorage.removeItem('attendance_checkInDate');
    localStorage.removeItem('attendance_isActive');
    localStorage.removeItem('attendance_userId');
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDurationForAdmin = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  // ✅✅✅ FIXED: Timer management
  const startTimer = (checkInTime) => {
    if (!checkInTime) {
      console.warn('⚠️ No check-in time provided');
      return;
    }

    stopTimer(); // Clear any existing timer first

    const checkIn = new Date(checkInTime);
    console.log('⏱️ Starting timer from:', checkIn.toISOString());

    const initialSeconds = Math.floor((Date.now() - checkIn) / 1000);
    setWorkingSeconds(initialSeconds);

    timerIntervalRef.current = setInterval(() => {
      const currentSeconds = Math.floor((Date.now() - checkIn) / 1000);
      setWorkingSeconds(currentSeconds);
    }, 1000);

    console.log('✅ Timer started');
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      console.log('⏹️ Stopping timer');
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // ✅✅✅ FIXED: Server sync
  const syncWithServer = async () => {
    try {
      const res = await employeeAPI.getAttendanceStatus();
      const serverData = res.data;

      console.log('📡 Server sync:', serverData);

      // Check if checked out
      if (serverData?.data?.checkOut || serverData?.data?.checkOutTime) {
        console.log('✅ Server shows checkout');
        
        setAttendanceStatus(serverData.data);
        
        const checkIn = new Date(serverData.data.checkInTime);
        const checkOut = new Date(serverData.data.checkOut || serverData.data.checkOutTime);
        const finalSeconds = Math.floor((checkOut - checkIn) / 1000);
        
        setWorkingSeconds(finalSeconds);
        clearAttendanceFromStorage();
        stopTimer();
        return;
      }

      // If active session
      if (serverData?.data?.checkInTime && !serverData?.data?.checkOut && !serverData?.data?.checkOutTime) {
        console.log('✅ Active session on server');
        setAttendanceStatus(serverData.data);
        
        if (!timerIntervalRef.current) {
          startTimer(serverData.data.checkInTime);
        }
      }

    } catch (err) {
      console.error('❌ Server sync error:', err);
    }
  };

  // ✅✅✅ FIXED: Initial fetch
  const fetchAttendanceStatus = async () => {
    try {
      const res = await employeeAPI.getAttendanceStatus();
      const serverData = res.data;

      console.log('📡 Initial fetch:', serverData);

      // CRITICAL: Check for checkout FIRST
      if (serverData?.data?.checkOut || serverData?.data?.checkOutTime) {
        console.log('✅ Already checked out today');
        setAttendanceStatus(serverData.data);
        
        const checkIn = new Date(serverData.data.checkInTime);
        const checkOut = new Date(serverData.data.checkOut || serverData.data.checkOutTime);
        const finalSeconds = Math.floor((checkOut - checkIn) / 1000);
        setWorkingSeconds(finalSeconds);
        
        clearAttendanceFromStorage();
        stopTimer();
        return;
      }

      // If checked in but not out
      if (serverData?.data?.checkInTime) {
        console.log('✅ Active check-in found');
        setAttendanceStatus(serverData.data);
        startTimer(serverData.data.checkInTime);
        
        const currentUser = getCurrentUser();
        const checkInTime = new Date(serverData.data.checkInTime);
        const today = new Date().toDateString();
        
        localStorage.setItem('attendance_checkInTime', checkInTime.toISOString());
        localStorage.setItem('attendance_checkInDate', today);
        localStorage.setItem('attendance_isActive', 'true');
        localStorage.setItem('attendance_userId', currentUser.id);
        return;
      }

      // No attendance
      console.log('⭕ No attendance today');
      setAttendanceStatus(null);
      clearAttendanceFromStorage();
      stopTimer();

    } catch (err) {
      console.error('❌ Fetch error:', err);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('❌ Location error:', error);
          toast.warning('Location access denied');
        }
      );
    }
  };

  const handleAutoCheckout = async () => {
    const hasLocalSession = localStorage.getItem('attendance_isActive') === 'true';
    const isCurrentUser = isCurrentUserSession();

    console.log('🚪 Logout - checking session');

    if (hasLocalSession && isCurrentUser && isCheckedIn) {
      const checkInTime = localStorage.getItem('attendance_checkInTime');
      const checkInDate = new Date(checkInTime);
      const checkOutDate = new Date();
      const totalSeconds = Math.floor((checkOutDate - checkInDate) / 1000);

      try {
        const currentUser = getCurrentUser();
        
        const checkOutData = {
          location: location,
          timestamp: checkOutDate.toISOString(),
          totalSeconds: totalSeconds,
          totalHours: formatDurationForAdmin(totalSeconds),
          autoCheckout: true,
          reason: 'User logged out',
          employeeName: currentUser.name,
          email: currentUser.email
        };

        await employeeAPI.checkOut(checkOutData);
        console.log('✅ Auto-checkout successful');

      } catch (err) {
        console.error('❌ Auto-checkout failed:', err);
      }
    }

    clearAttendanceFromStorage();
    stopTimer();
    setWorkingSeconds(0);
    setAttendanceStatus(null);
  };

  // Initialize
  useEffect(() => {
    console.log('🚀 Component mounted');

    const currentUser = getCurrentUser();
    const storedUserId = localStorage.getItem('attendance_userId');

    if (storedUserId && currentUser.id !== storedUserId) {
      console.log('⚠️ Different user - clearing data');
      clearAttendanceFromStorage();
    }

    setIsInitialized(true);
    fetchAttendanceStatus();
    getLocation();

    clockIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    syncIntervalRef.current = setInterval(() => {
      syncWithServer();
    }, 2 * 60 * 1000);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Listen for logout
  useEffect(() => {
    const handleLogoutEvent = () => {
      console.log('🚪 Logout event');
      handleAutoCheckout();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        handleAutoCheckout();
      }
    };

    window.addEventListener('user-logout', handleLogoutEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('user-logout', handleLogoutEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isCheckedIn, location]);

  // ✅✅✅ CRITICAL FIX: Attendance status handler
  useEffect(() => {
    if (!isInitialized) return;

    console.log('🔄 Attendance status changed:', {
      checkIn: attendanceStatus?.checkInTime,
      checkOut: attendanceStatus?.checkOut || attendanceStatus?.checkOutTime,
      status: attendanceStatus?.status
    });

    // ✅ CHECKED OUT - Stop everything
    if (attendanceStatus?.checkOut || attendanceStatus?.checkOutTime) {
      console.log('🛑 CHECKED OUT - Stopping timer');

      stopTimer();

      const checkInTime = new Date(attendanceStatus.checkInTime);
      const checkOutTime = new Date(attendanceStatus.checkOut || attendanceStatus.checkOutTime);
      const finalDuration = Math.floor((checkOutTime - checkInTime) / 1000);

      console.log('📊 Final duration:', formatDuration(finalDuration));
      setWorkingSeconds(finalDuration);

      clearAttendanceFromStorage();
      return;
    }

    // ✅ CHECKED IN (active)
    if (attendanceStatus?.checkInTime && !attendanceStatus?.checkOut && !attendanceStatus?.checkOutTime) {
      console.log('✅ CHECKED IN - Starting timer');

      const checkInTime = new Date(attendanceStatus.checkInTime);
      const currentUser = getCurrentUser();
      const today = new Date().toDateString();

      localStorage.setItem('attendance_checkInTime', checkInTime.toISOString());
      localStorage.setItem('attendance_checkInDate', today);
      localStorage.setItem('attendance_isActive', 'true');
      localStorage.setItem('attendance_userId', currentUser.id);

      startTimer(checkInTime);
      return;
    }

    // ✅ NOT CHECKED IN
    console.log('⭕ NOT CHECKED IN');
    stopTimer();
    setWorkingSeconds(0);
    clearAttendanceFromStorage();

  }, [attendanceStatus, isInitialized]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncWithServer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // ✅✅✅ FIXED: Check-in handler
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      console.log('🔐 Check-in initiated');

      if (isCheckedIn) {
        toast.warning('You are already checked in!');
        setLoading(false);
        return;
      }

      // Reset everything
      stopTimer();
      setWorkingSeconds(0);
      clearAttendanceFromStorage();

      const currentUser = getCurrentUser();
      const now = new Date();
      
      const checkInData = {
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        } : null,
        notes: `Check-in via ${checkInMethod}`,
        timestamp: now.toISOString(),
        employeeName: currentUser.name,
        email: currentUser.email,
        method: checkInMethod
      };

      console.log('📤 Sending check-in...');
      const response = await employeeAPI.checkIn(checkInData);
      console.log('✅ Check-in response:', response.data);

      setAttendanceStatus(response.data.data);
      toast.success('✅ Checked in successfully!');

    } catch (error) {
      console.error('❌ Check-in error:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
      
      if (error.response?.status === 400) {
        fetchAttendanceStatus();
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅✅✅ FIXED: Check-out handler
  const handleCheckOut = async () => {
    try {
      setLoading(true);
      console.log('🚪 Check-out initiated');

      if (!isCheckedIn) {
        toast.warning('You are not checked in!');
        setLoading(false);
        return;
      }

      const checkInTime = attendanceStatus?.checkInTime || 
                          localStorage.getItem('attendance_checkInTime');

      if (!checkInTime) {
        toast.error('No active check-in found');
        setLoading(false);
        return;
      }

      const currentUser = getCurrentUser();
      const checkInDate = new Date(checkInTime);
      const checkOutDate = new Date();
      const totalSeconds = Math.floor((checkOutDate - checkInDate) / 1000);

      const checkOutData = {
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        } : null,
        timestamp: checkOutDate.toISOString(),
        totalSeconds: totalSeconds,
        totalHours: formatDurationForAdmin(totalSeconds),
        employeeName: currentUser.name,
        email: currentUser.email,
        checkInTime: checkInDate.toISOString()
      };

      console.log('📤 Sending check-out...');
      const response = await employeeAPI.checkOut(checkOutData);
      console.log('✅ Check-out response:', response.data);

      // ✅ CRITICAL: Stop timer IMMEDIATELY
      stopTimer();
      
      // ✅ Update state with checkout data
      const updatedStatus = {
        ...attendanceStatus,
        checkOut: response.data.checkOut || response.data.data?.checkOut || response.data.data?.checkOutTime,
        checkOutTime: response.data.checkOut || response.data.data?.checkOutTime,
        workHours: response.data.workHours || response.data.data?.workHours
      };
      
      console.log('✅ Updated status after checkout:', updatedStatus);
      
      setAttendanceStatus(updatedStatus);
      setWorkingSeconds(totalSeconds);
      clearAttendanceFromStorage();

      toast.success(`✅ Checked out! Total: ${formatDuration(totalSeconds)}`);

    } catch (error) {
      console.error('❌ Check-out error:', error);
      toast.error(error.response?.data?.message || 'Failed to check out');
      
      if (error.response?.status === 400) {
        fetchAttendanceStatus();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "--:--:--";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="auto-attendance">
      <div className="attendance-header">
        <h1>Attendance</h1>
        <p>{formatDate(currentTime)}</p>
      </div>

      {/* Timer Display */}
      <div className="time-display">
        <FiClock className="clock-icon" />
        <div className="time-info">
          <h2>{formatDuration(workingSeconds)}</h2>
          <p>
            {isCheckedIn
              ? "Working Duration (Live)"
              : isCheckedOut
                ? "Total Working Time Today"
                : "Not Checked In"}
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`status-card ${isCheckedIn ? 'checked-in' : isCheckedOut ? 'checked-out' : 'not-checked-in'}`}>
        <div className="status-header">
          {isCheckedIn && (
            <>
              <FiCheckCircle className="status-icon success" />
              <div>
                <h3>You're Checked In</h3>
                <p>Timer running - Working since {formatTime(attendanceStatus.checkInTime)}</p>
              </div>
            </>
          )}
          {isCheckedOut && (
            <>
              <FiCheckCircle className="status-icon" />
              <div>
                <h3>Completed for Today</h3>
                <p>You have checked out - Data sent to admin</p>
              </div>
            </>
          )}
          {!isCheckedIn && !isCheckedOut && (
            <>
              <FiXCircle className="status-icon warning" />
              <div>
                <h3>Not Checked In</h3>
                <p>Check in to start tracking your time</p>
              </div>
            </>
          )}
        </div>

        {attendanceStatus && (attendanceStatus.checkInTime || attendanceStatus.checkOut) && (
          <div className="attendance-times">
            <div className="time-box">
              <label>Check In</label>
              <p className="time">{formatTime(attendanceStatus.checkInTime)}</p>
            </div>
            <div className="time-box">
              <label>Check Out</label>
              <p className="time">{formatTime(attendanceStatus.checkOut || attendanceStatus.checkOutTime)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Check In Methods */}
      {!isCheckedIn && !isCheckedOut && (
        <div className="check-in-methods">
          <h3>Choose Check-In Method</h3>
          <div className="methods-grid">
            <button
              className={`method-card ${checkInMethod === 'auto' ? 'active' : ''}`}
              onClick={() => setCheckInMethod('auto')}
            >
              <FiWifi />
              <span>Auto (Wi-Fi)</span>
            </button>
            <button
              className={`method-card ${checkInMethod === 'manual' ? 'active' : ''}`}
              onClick={() => setCheckInMethod('manual')}
            >
              <FiMapPin />
              <span>Manual</span>
            </button>
            <button
              className={`method-card ${checkInMethod === 'qr' ? 'active' : ''}`}
              onClick={() => setCheckInMethod('qr')}
            >
              <MdQrCodeScanner />
              <span>QR Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Location Info */}
      {location && (
        <div className="location-info">
          <FiMapPin />
          <div>
            <p><strong>Location Detected</strong></p>
            <p className="location-coords">
              Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
            </p>
            <p className="accuracy">Accuracy: ±{Math.round(location.accuracy)}m</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        {!isCheckedIn && !isCheckedOut && (
          <button
            className="btn-check-in"
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                <FiCheckCircle />
                Check In & Start Timer
              </>
            )}
          </button>
        )}

        {isCheckedIn && (
          <button
            className="btn-check-out"
            onClick={handleCheckOut}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                <FiXCircle />
                Check Out & Stop Timer
              </>
            )}
          </button>
        )}

        {isCheckedOut && (
          <div className="completed-message">
            <FiCheckCircle />
            <p>Attendance marked for today</p>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      {attendanceStatus && (attendanceStatus.checkInTime || attendanceStatus.status) && (
        <div className="today-summary">
          <h3>Today's Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Status</label>
              <span className={`badge ${attendanceStatus.status}`}>
                {attendanceStatus.status || (isCheckedIn ? 'Present' : isCheckedOut ? 'Completed' : 'Absent')}
              </span>
            </div>
            <div className="summary-item">
              <label>Check-In Method</label>
              <span>{checkInMethod.charAt(0).toUpperCase() + checkInMethod.slice(1)}</span>
            </div>
            {(isCheckedIn || isCheckedOut) && (
              <div className="summary-item">
                <label>Working Time</label>
                <span>{formatDurationForAdmin(workingSeconds)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="quick-links">
        <button onClick={() => window.location.href = '/employee/attendance/history'}>
          View History
        </button>
        <button onClick={() => window.location.href = '/employee/attendance/correction'}>
          Request Correction
        </button>
      </div>
    </div>
  );
}

export default AutoAttendance;