import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import { FiClock, FiMapPin, FiWifi, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { MdQrCodeScanner } from 'react-icons/md';
import './AutoAttendance.css';

function AutoAttendance() {
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [checkInMethod, setCheckInMethod] = useState('auto'); // auto, manual, qr
  const [workingDuration, setWorkingDuration] = useState(null);

  useEffect(() => {
    fetchAttendanceStatus();
    getLocation();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (attendanceStatus?.checkIn && !attendanceStatus?.checkOut) {
      calculateDuration();
      const durationTimer = setInterval(calculateDuration, 60000); // Update every minute
      return () => clearInterval(durationTimer);
    }
  }, [attendanceStatus]);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await employeeAPI.getAttendanceStatus();
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
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
          console.error('Error getting location:', error);
          toast.warning('Location access denied. You can still check in manually.');
        }
      );
    }
  };

  const calculateDuration = () => {
    if (!attendanceStatus?.checkIn) return;
    
    const checkInTime = new Date(attendanceStatus.checkIn);
    const now = new Date();
    const diff = now - checkInTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setWorkingDuration(`${hours}h ${minutes}m`);
  };

  const handleCheckIn = async () => {
  try {
    setLoading(true);
    const locationType = location ? 'Field' : 'Office';
    const checkInData = {
      method: checkInMethod,
      location: location ? JSON.stringify(location) : null, // <-- stringify here
      timestamp: new Date(),
    };

    const response = await employeeAPI.checkIn(checkInData);
    setAttendanceStatus(response.data);
    toast.success('Checked in successfully!');
    
  } catch (error) {
    console.error('Check-in error:', error);
    toast.error(error.response?.data?.message || 'Failed to check in');
  } finally {
    setLoading(false);
  }
};

const handleCheckOut = async () => {
  try {
    setLoading(true);

    const checkOutData = {
      location: location ? JSON.stringify(location) : null, // <-- stringify here
      timestamp: new Date(),
    };

    const response = await employeeAPI.checkOut(checkOutData);
    setAttendanceStatus(response.data);
    toast.success('Checked out successfully!');
    
  } catch (error) {
    console.error('Check-out error:', error);
    toast.error(error.response?.data?.message || 'Failed to check out');
  } finally {
    setLoading(false);
  }
};


  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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

  const isCheckedIn = attendanceStatus?.checkIn && !attendanceStatus?.checkOut;
  const isCheckedOut = attendanceStatus?.checkIn && attendanceStatus?.checkOut;

  return (
    <div className="auto-attendance">
      <div className="attendance-header">
        <h1>Attendance</h1>
        <p>{formatDate(currentTime)}</p>
      </div>

      {/* Current Time Display */}
      <div className="time-display">
        <FiClock className="clock-icon" />
        <div className="time-info">
          <h2>{currentTime.toLocaleTimeString('en-US', { hour12: false })}</h2>
          <p>Current Time</p>
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
                <p>Working Duration: {workingDuration || 'Calculating...'}</p>
              </div>
            </>
          )}
          {isCheckedOut && (
            <>
              <FiCheckCircle className="status-icon" />
              <div>
                <h3>Completed for Today</h3>
                <p>You have checked out</p>
              </div>
            </>
          )}
          {!isCheckedIn && !isCheckedOut && (
            <>
              <FiXCircle className="status-icon warning" />
              <div>
                <h3>Not Checked In</h3>
                <p>Mark your attendance to start tracking</p>
              </div>
            </>
          )}
        </div>

        {attendanceStatus && (
          <div className="attendance-times">
            <div className="time-box">
              <label>Check In</label>
              <p className="time">{formatTime(attendanceStatus.checkIn)}</p>
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
                Check In
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
                Check Out
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
      {attendanceStatus && (
        <div className="today-summary">
          <h3>Today's Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Status</label>
              <span className={`badge ${attendanceStatus.status}`}>
                {attendanceStatus.status}
              </span>
            </div>
            <div className="summary-item">
              <label>Check-In Method</label>
              <span>{attendanceStatus.method || 'N/A'}</span>
            </div>
            {attendanceStatus.totalHours && (
              <div className="summary-item">
                <label>Total Hours</label>
                <span>{attendanceStatus.totalHours}</span>
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