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

  // Use refs to maintain intervals
  const timerIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);
  const syncIntervalRef = useRef(null);

  // Derived state
  const isCheckedIn = attendanceStatus?.checkInTime && !attendanceStatus?.checkOut;
  const isCheckedOut = attendanceStatus?.checkInTime && attendanceStatus?.checkOut;

  // Get current user ID from auth
  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id || user?._id || null;
  };

  // Check if attendance belongs to current logged-in user
  const isCurrentUserSession = () => {
    const currentUserId = getCurrentUserId();
    const storedUserId = localStorage.getItem('attendance_userId');

    return currentUserId && storedUserId && currentUserId === storedUserId;
  };

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

    return isActive === 'true' && checkInTime && checkInDate === today;
  };

  // Format duration helper
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ FIX: Restore timer from localStorage - ALWAYS recalculate
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

      // ✅ Immediately set the calculated seconds
      setWorkingSeconds(diffInSeconds);
      startTimer(checkIn);
    }
  };
  const calculateElapsedSeconds = (checkInTime) => {
    if (!checkInTime) return 0;
    const now = new Date();
    const checkIn = new Date(checkInTime);
    return Math.floor((now - checkIn) / 1000);
  };
  // Start timer function
  const startTimer = (checkInTime) => {
    if (!checkInTime) return;

    // ❗ Always clear previous interval first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const checkIn = new Date(checkInTime);

    // ⏱️ Set immediately
    setWorkingSeconds(Math.floor((Date.now() - checkIn) / 1000));

    // ⏱️ Single source of truth
    timerIntervalRef.current = setInterval(() => {
      setWorkingSeconds(
        Math.floor((Date.now() - checkIn) / 1000)
      );
    }, 1000);
  };

  // Stop timer function
  const stopTimer = () => {
    console.log('⏹️ Stopping timer');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Sync with server
  const syncWithServer = async () => {
    try {
      const res = await employeeAPI.getAttendanceStatus();
      const serverData = res.data;

      console.log('📡 Server sync response:', serverData);

      // Check if we have active localStorage session for current user
      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();

      if (hasLocalSession && isCurrentUser) {
        const localCheckInTime = localStorage.getItem('attendance_checkInTime');
        const serverCheckInTime = serverData?.data?.checkInTime;

        // If server says checked out but we have active local session
        if (serverData?.data?.checkOut) {
          console.warn('⚠️ Server shows checkout - accepting');
          setAttendanceStatus(serverData.data);
          clearAttendanceFromStorage();
          stopTimer();
          return;
        }

        // If times match, don't update state (keeps timer running)
        if (serverCheckInTime && new Date(serverCheckInTime).toISOString() === localCheckInTime) {
          console.log('✅ Server and localStorage in sync - keeping timer');
          // ✅ FIX: Recalculate timer to sync with reality
          restoreTimerFromLocalStorage();
          return;
        }
      }

      // Trust server data
      if (serverData?.data) {
        setAttendanceStatus(serverData.data);
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

      // Check if we have a local session
      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();

      // ✅ FIX: If we have valid local session, restore timer first
      if (hasLocalSession && isCurrentUser) {
        console.log('✅ Valid local session found - Restoring timer from localStorage');
        restoreTimerFromLocalStorage();

        const localCheckInTime = localStorage.getItem('attendance_checkInTime');

        if (serverData?.data?.checkInTime && !serverData?.data?.checkOut) {
          const serverCheckInTime = new Date(serverData.data.checkInTime).toISOString();

          if (localCheckInTime === serverCheckInTime) {
            console.log('✅ Local and server times match - Keeping local timer');
            // Set attendance status but timer is already running
            setAttendanceStatus(serverData.data);
            return;
          }
        }
      }

      // Otherwise, trust server data
      console.log('📥 Setting attendance status from server');
      if (serverData?.data) {
        setAttendanceStatus(serverData.data);
      } else {
        setAttendanceStatus(null);
      }

    } catch (err) {
      console.error('❌ Error fetching attendance status:', err);

      // If fetch fails but we have local session for current user, keep timer running
      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();

      if (hasLocalSession && isCurrentUser) {
        console.log('⚠️ Server fetch failed but local session exists - Restoring timer');
        restoreTimerFromLocalStorage();
      }
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
          console.log('📍 Location detected:', position.coords);
        },
        (error) => {
          console.error('❌ Error getting location:', error);
          toast.warning('Location access denied. You can still check in manually.');
        }
      );
    }
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

    // ✅ FIX: Check localStorage for existing session (only if same user)
    const hasActiveSession = checkLocalStorageSession();
    if (hasActiveSession && isCurrentUserSession()) {
      const localCheckInTime = localStorage.getItem('attendance_checkInTime');
      startTimer(localCheckInTime);  // Timer starts immediately
    }
    if (hasActiveSession && isCurrentUserSession()) {
      console.log('✅ Found active session for current user - Restoring timer IMMEDIATELY');
      restoreTimerFromLocalStorage();
    } else if (hasActiveSession && !isCurrentUserSession()) {
      console.log('⚠️ Found session but different user - Clearing');
      clearAttendanceFromStorage();
    }

    // Mark as initialized BEFORE fetching from server
    setIsInitialized(true);

    // Fetch from server (this will update attendanceStatus)
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
  }, []); // ✅ Empty dependency array - runs only once on mount

  // ✅ FIX: Listen for logout event and auto-checkout
  useEffect(() => {
    const handleLogout = async () => {
      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();

      if (hasLocalSession && isCurrentUser && isCheckedIn) {
        const checkInTime = localStorage.getItem('attendance_checkInTime');
        const totalSeconds = Math.floor(
          (Date.now() - new Date(checkInTime)) / 1000
        );

        try {
          await employeeAPI.checkOut({
            timestamp: new Date().toISOString(),
            totalSeconds,
            autoCheckout: true,
            reason: 'User logged out'
          });
        } catch (err) {
          console.error('Auto checkout failed', err);
        }
      }

      // HARD RESET
      clearAttendanceFromStorage();
      localStorage.removeItem('daily_report_submitted');

      stopTimer();
      setWorkingSeconds(0);
      setAttendanceStatus(null);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        console.log('🚪 Logout detected via storage event');
        handleLogout();
      }

      if (e.key === 'user' && !e.newValue) {
        console.log('🚪 Logout detected via user removal');
        handleLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // ✅ NEW: Listen for beforeunload (browser close/refresh)
    const handleBeforeUnload = (e) => {
      // Don't auto-checkout on refresh/close - just keep localStorage
      console.log('🔄 Page unloading - Keeping attendance data in localStorage');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isCheckedIn, workingSeconds, location]);

  // Handle attendance status changes - ONLY AFTER INITIALIZATION
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitialized) {
      console.log('⏳ Skipping - Not initialized yet');
      return;
    }

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

      const storedCheckInTime = localStorage.getItem('attendance_checkInTime');
      if (storedCheckInTime !== checkInTime.toISOString()) {
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
      }

      startTimer(checkInTime);

    } else if (attendanceStatus?.checkInTime && attendanceStatus?.checkOut) {
      // Checked out - stop timer
      console.log('🛑 Status: Checked Out - Stopping timer');

      stopTimer();

      const checkInTime = new Date(attendanceStatus.checkInTime);
      const checkOutTime = new Date(attendanceStatus.checkOut);
      const finalDuration = Math.floor((checkOutTime - checkInTime) / 1000);

      setWorkingSeconds(finalDuration);

      clearAttendanceFromStorage();
      console.log('🧹 Cleared localStorage after checkout');

    } else if (attendanceStatus === null) {
      // Status is null - check localStorage
      console.log('⚠️ Status is NULL - checking localStorage');

      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();

      if (hasLocalSession && isCurrentUser) {
        console.log('✅ Valid local session exists - Restoring timer');
        restoreTimerFromLocalStorage();
      } else {
        console.log('❌ No valid session - clearing timer');
        stopTimer();
        setWorkingSeconds(0);
        clearAttendanceFromStorage();
      }
    } else {
      // Not checked in
      console.log('⭕ Status: Not Checked In from server');

      const hasLocalSession = checkLocalStorageSession();
      const isCurrentUser = isCurrentUserSession();

      if (!hasLocalSession || !isCurrentUser) {
        console.log('🧹 No valid local session - clearing');
        stopTimer();
        setWorkingSeconds(0);
        clearAttendanceFromStorage();
      } else {
        console.log('✅ Valid local session exists - Restoring timer');
        restoreTimerFromLocalStorage();
      }
    }
  }, [attendanceStatus, isInitialized]); // ✅ Proper dependency array

  // ✅ FIX: Handle visibility change (tab switching) - RESTORE TIMER
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('👁️ Visibility changed - hidden:', document.hidden);

      if (!document.hidden) {
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
      const errorMessage = error.response?.data?.message || 'Failed to check in';
      toast.error(errorMessage);

      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
      }
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

      clearAttendanceFromStorage();
      console.log('🧹 Cleared localStorage');

      stopTimer();

      setAttendanceStatus(response.data.data);

      toast.success(`Checked out successfully! Total time: ${formatDuration(workingSeconds)}`);

    } catch (error) {
      console.error('❌ Check-out error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to check out';
      toast.error(errorMessage);

      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
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

  const formatDurationForAdmin = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

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
            {(isCheckedIn || workingSeconds > 0)
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