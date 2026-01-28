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

  const [location, setLocation] = useState(null);
  const [checkInMethod, setCheckInMethod] = useState('auto');

  // Use refs to maintain intervals
  const timerIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);
  const syncIntervalRef = useRef(null);

  // Get current user ID from auth (adjust based on your auth setup)
  const getCurrentUserId = () => {
    // Method 1: From localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Method 2: From token (if you store it)
    // const token = localStorage.getItem('token');
    
    // Method 3: From your auth context/state
    // return authContext.user?.id;
    
    return user?.id || user?._id || null;
  };

  // Check if attendance belongs to current logged-in user
  const isCurrentUserSession = () => {
    const currentUserId = getCurrentUserId();
    const storedUserId = localStorage.getItem('attendance_userId');
    
    console.log('👤 User Check:', {
      currentUserId,
      storedUserId,
      matches: currentUserId === storedUserId
    });
    
    return currentUserId && storedUserId && currentUserId === storedUserId;
  };

  // Initialize on mount
  useEffect(() => {
    console.log('🚀 Component mounted - Starting initialization');
    
    // Clear old attendance data if different user
    const currentUserId = getCurrentUserId();
    const storedUserId = localStorage.getItem('attendance_userId');
    
    if (storedUserId && currentUserId !== storedUserId) {
      console.log('⚠️ Different user detected - Clearing old attendance data');
      clearAttendanceFromStorage();
    }
    
    // Check localStorage for existing session (only if same user)
    const hasActiveSession = checkLocalStorageSession();
    
    if (hasActiveSession && isCurrentUserSession()) {
      console.log('✅ Found active session for current user - Restoring timer');
      restoreTimerFromLocalStorage();
    } else if (hasActiveSession && !isCurrentUserSession()) {
      console.log('⚠️ Found session but different user - Clearing');
      clearAttendanceFromStorage();
    }
    
    // Fetch from server
    fetchAttendanceStatus();
    getLocation();

    // Update current time every second
    clockIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Sync with server every 3 minutes
    syncIntervalRef.current = setInterval(() => {
      console.log('🔄 Periodic server sync...');
      syncWithServer();
    }, 3 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Component unmounting - Cleaning up intervals');
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Listen for logout event
  useEffect(() => {
    const handleLogout = (e) => {
      console.log('🚪 Logout detected - Clearing attendance data');
      clearAttendanceFromStorage();
      stopTimer();
      setWorkingSeconds(0);
      setAttendanceStatus(null);
    };

    // Listen for custom logout event
    window.addEventListener('user-logout', handleLogout);
    
    // Listen for storage changes (if logout happens in another tab)
    const handleStorageChange = (e) => {
      // If auth token is removed, it means user logged out
      if (e.key === 'token' && !e.newValue) {
        console.log('🚪 Logout detected via storage event');
        handleLogout();
      }
      
      // If user data is removed
      if (e.key === 'user' && !e.newValue) {
        console.log('🚪 Logout detected via user removal');
        handleLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Clear attendance data from localStorage
  const clearAttendanceFromStorage = () => {
    console.log('🧹 Clearing all attendance data from localStorage');
    localStorage.removeItem('attendance_checkInTime');
    localStorage.removeItem('attendance_checkInDate');
    localStorage.removeItem('attendance_isActive');
    localStorage.removeItem('attendance_userId');
  };

  // Check if there's an active session in localStorage
  const checkLocalStorageSession = () => {
    const isActive = localStorage.getItem('attendance_isActive');
    const checkInTime = localStorage.getItem('attendance_checkInTime');
    const checkInDate = localStorage.getItem('attendance_checkInDate');
    const today = new Date().toDateString();

    console.log('📦 LocalStorage Check:', {
      isActive,
      checkInTime,
      checkInDate,
      today,
      isToday: checkInDate === today
    });

    return isActive === 'true' && checkInTime && checkInDate === today;
  };

  // Restore timer from localStorage
  const restoreTimerFromLocalStorage = () => {
    const checkInTime = localStorage.getItem('attendance_checkInTime');
    
    if (checkInTime) {
      const checkIn = new Date(checkInTime);
      const now = new Date();
      const diffInSeconds = Math.floor((now - checkIn) / 1000);
      
      console.log('⏰ Restoring timer:', {
        checkInTime: checkIn.toISOString(),
        currentTime: now.toISOString(),
        elapsedSeconds: diffInSeconds,
        elapsedFormatted: formatDuration(diffInSeconds)
      });
      
      setWorkingSeconds(diffInSeconds);
      startTimer(checkIn);
    }
  };

  // Sync with server
  const syncWithServer = async () => {
    try {
      const res = await employeeAPI.getAttendanceStatus();
      const serverData = res.data;
      
      console.log('📡 Server response:', serverData);
      
      // Check if we have active localStorage session for current user
      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();
      
      if (hasLocalSession && isCurrentUser) {
        const localCheckInTime = localStorage.getItem('attendance_checkInTime');
        const serverCheckInTime = serverData?.checkInTime;
        
        console.log('🔍 Comparing sessions:', {
          localCheckInTime,
          serverCheckInTime,
          serverHasCheckOut: !!serverData?.checkOut
        });
        
        // If server says checked out but we have active local session
        if (serverData?.checkOut) {
          console.warn('⚠️ Server shows checkout but localStorage shows active session');
          console.warn('⚠️ Server data is more reliable - accepting checkout');
          
          // Trust server data for checkout
          setAttendanceStatus(serverData);
          clearAttendanceFromStorage();
          return;
        }
        
        // If check-in times match, we're in sync
        if (serverCheckInTime && new Date(serverCheckInTime).getTime() === new Date(localCheckInTime).getTime()) {
          console.log('✅ Server and localStorage in sync');
          setAttendanceStatus(serverData);
        }
      } else {
        // No local session or different user, trust server
        console.log('📥 No local session or different user - accepting server data');
        setAttendanceStatus(serverData);
      }
    } catch (err) {
      console.error('❌ Server sync error:', err);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const res = await employeeAPI.getAttendanceStatus();
      const serverData = res.data;
      
      console.log('📡 Initial fetch - Server response:', serverData);
      
      // Always trust server data on initial fetch
      setAttendanceStatus(serverData);
      
    } catch (err) {
      console.error('❌ Error fetching attendance status:', err);
      
      // If fetch fails but we have local session for current user, keep timer running
      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();
      
      if (hasLocalSession && isCurrentUser) {
        console.log('⚠️ Server fetch failed but local session exists - continuing with local timer');
        restoreTimerFromLocalStorage();
      }
    }
  };

  // Handle attendance status changes
  useEffect(() => {
    console.log('🔄 Attendance status changed:', attendanceStatus);
    
    if (attendanceStatus?.checkInTime && !attendanceStatus?.checkOut) {
      // Checked in - start timer
      console.log('✅ Status: Checked In - Starting timer');
      
      const checkInTime = new Date(attendanceStatus.checkInTime);
      const now = new Date();
      const initialSeconds = Math.floor((now - checkInTime) / 1000);
      
      setWorkingSeconds(initialSeconds);
      
      // Save to localStorage with user ID
      const currentUserId = getCurrentUserId();
      const today = new Date().toDateString();
      
      localStorage.setItem('attendance_checkInTime', checkInTime.toISOString());
      localStorage.setItem('attendance_checkInDate', today);
      localStorage.setItem('attendance_isActive', 'true');
      localStorage.setItem('attendance_userId', currentUserId);
      
      console.log('💾 Saved to localStorage:', {
        checkInTime: checkInTime.toISOString(),
        date: today,
        isActive: true,
        userId: currentUserId
      });
      
      startTimer(checkInTime);
      
    } else if (attendanceStatus?.checkInTime && attendanceStatus?.checkOut) {
      // Checked out - stop timer
      console.log('🛑 Status: Checked Out - Stopping timer');
      
      stopTimer();
      
      const checkInTime = new Date(attendanceStatus.checkInTime);
      const checkOutTime = new Date(attendanceStatus.checkOut);
      const finalDuration = Math.floor((checkOutTime - checkInTime) / 1000);
      
      setWorkingSeconds(finalDuration);
      
      // Clear localStorage
      clearAttendanceFromStorage();
      console.log('🧹 Cleared localStorage after checkout');
      
    } else {
      // Not checked in
      console.log('⭕ Status: Not Checked In');
      
      stopTimer();
      setWorkingSeconds(0);
      
      // Clear attendance data
      clearAttendanceFromStorage();
    }
  }, [attendanceStatus]);

  // Start timer function
  const startTimer = (checkInTime) => {
    console.log('▶️ Starting timer with check-in time:', checkInTime);
    
    // Clear existing interval if any
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Start new interval that calculates from check-in time
    timerIntervalRef.current = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((now - new Date(checkInTime)) / 1000);
      setWorkingSeconds(diffInSeconds);
    }, 1000);
    
    console.log('✅ Timer started successfully');
  };

  // Stop timer function
  const stopTimer = () => {
    console.log('⏹️ Stopping timer');
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('👁️ Visibility changed - hidden:', document.hidden);
      
      if (!document.hidden) {
        // Tab is now visible
        const hasLocalSession = checkLocalStorageSession();
        const isCurrentUser = isCurrentUserSession();
        
        if (hasLocalSession && isCurrentUser) {
          console.log('🔄 Tab visible - Recalculating timer from localStorage');
          restoreTimerFromLocalStorage();
        }
      }
    };

    const handleFocus = () => {
      console.log('🎯 Window focused');
      
      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();
      
      if (hasLocalSession && isCurrentUser) {
        console.log('🔄 Window focused - Recalculating timer');
        restoreTimerFromLocalStorage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          console.log('📍 Location detected:', position.coords);
        },
        (error) => {
          console.error('❌ Error getting location:', error);
          toast.warning('Location access denied. You can still check in manually.');
        }
      );
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      console.log('🔐 Check-in initiated');

      if (!location) {
        toast.warning('Location not detected. Please enable location or choose Manual method.');
      }

      const now = new Date();
      const currentUserId = getCurrentUserId();
      
      const checkInData = {
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        } : null,
        notes: `Check-in via ${checkInMethod}`,
        timestamp: now.toISOString()
      };

      console.log('📤 Sending check-in data:', checkInData);
      const response = await employeeAPI.checkIn(checkInData);
      console.log('✅ Check-in response:', response.data);

      // Store in localStorage with user ID
      localStorage.setItem('attendance_checkInTime', now.toISOString());
      localStorage.setItem('attendance_checkInDate', now.toDateString());
      localStorage.setItem('attendance_isActive', 'true');
      localStorage.setItem('attendance_userId', currentUserId);
      
      console.log('💾 Saved to localStorage with userId:', currentUserId);

      // Update state
      setAttendanceStatus(response.data.data);
      toast.success('Checked in successfully! Timer started.');

    } catch (error) {
      console.error('❌ Check-in error:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      console.log('🚪 Check-out initiated');

      const checkOutData = {
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        } : null,
        timestamp: new Date().toISOString(),
        totalSeconds: workingSeconds,
        totalHours: formatDurationForAdmin(workingSeconds)
      };

      console.log('📤 Sending check-out data:', checkOutData);
      const response = await employeeAPI.checkOut(checkOutData);
      console.log('✅ Check-out response:', response.data);
      
      // Clear localStorage
      clearAttendanceFromStorage();
      console.log('🧹 Cleared localStorage');
      
      // Stop timer
      stopTimer();
      
      // Update status
      setAttendanceStatus(response.data);
      
      toast.success(`Checked out successfully! Total time: ${formatDuration(workingSeconds)}`);

    } catch (error) {
      console.error('❌ Check-out error:', error);
      toast.error(error.response?.data?.message || 'Failed to check out');
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

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDurationForAdmin = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const isCheckedIn = attendanceStatus?.checkInTime && !attendanceStatus?.checkOut;
  const isCheckedOut = attendanceStatus?.checkInTime && attendanceStatus?.checkOut;

  return (
    <div className="auto-attendance">
      <div className="attendance-header">
        <h1>Attendance</h1>
        <p>{formatDate(currentTime)}</p>
      </div>

      {/* Working Duration Timer Display */}
      <div className="time-display">
        <FiClock className="clock-icon" />
        <div className="time-info">
          <h2>
            {isCheckedIn
              ? formatDuration(workingSeconds)
              : isCheckedOut && attendanceStatus?.checkOut
                ? formatDuration(
                    Math.floor((new Date(attendanceStatus.checkOut) - new Date(attendanceStatus.checkInTime)) / 1000)
                  )
                : "--:--:--"}
          </h2>
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
                <p>Timer is running - Working since {formatTime(attendanceStatus.checkInTime)}</p>
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
              <p className="time">{formatTime(attendanceStatus.checkOut)}</p>
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