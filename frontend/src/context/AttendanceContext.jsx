import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

// Create Attendance Context
const AttendanceContext = createContext();

// Custom hook to use Attendance Context
export const useAttendanceContext = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendanceContext must be used within AttendanceProvider');
  }
  return context;
};

// Attendance Provider Component
export const AttendanceProvider = ({ children }) => {
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load attendance status from localStorage on mount
  useEffect(() => {
    loadAttendanceStatus();
  }, []);

  // Load attendance status from localStorage
  const loadAttendanceStatus = () => {
    const savedStatus = localStorage.getItem('attendanceStatus');
    const savedCheckInTime = localStorage.getItem('checkInTime');
    
    if (savedStatus && savedCheckInTime) {
      const status = JSON.parse(savedStatus);
      setAttendanceStatus(status);
      setIsCheckedIn(status.isCheckedIn || false);
      setCheckInTime(savedCheckInTime);
    }
  };

  // Save attendance status to localStorage
  const saveAttendanceStatus = (status) => {
    localStorage.setItem('attendanceStatus', JSON.stringify(status));
    if (status.checkInTime) {
      localStorage.setItem('checkInTime', status.checkInTime);
    }
  };

  // Check In
  const checkIn = async (location = 'Office') => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const status = {
        isCheckedIn: true,
        checkInTime: now,
        location: location,
        date: new Date().toLocaleDateString(),
      };

      setAttendanceStatus(status);
      setIsCheckedIn(true);
      setCheckInTime(now);
      saveAttendanceStatus(status);

      toast.success('Checked in successfully!');
      return { success: true, data: status };
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check Out
  const checkOut = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const workTime = calculateWorkTime(checkInTime, now);

      const status = {
        ...attendanceStatus,
        isCheckedIn: false,
        checkOutTime: now,
        totalWorkTime: workTime,
      };

      setAttendanceStatus(status);
      setIsCheckedIn(false);
      setCheckOutTime(now);
      setTotalWorkTime(workTime);
      
      // Clear check-in data
      localStorage.removeItem('attendanceStatus');
      localStorage.removeItem('checkInTime');

      toast.success(`Checked out successfully! Total work time: ${formatWorkTime(workTime)}`);
      return { success: true, data: status };
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Calculate work time in minutes
  const calculateWorkTime = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffMs = checkOutDate - checkInDate;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  // Format work time (minutes to hours:minutes)
  const formatWorkTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get current work time (if checked in)
  const getCurrentWorkTime = () => {
    if (!isCheckedIn || !checkInTime) return 0;
    return calculateWorkTime(checkInTime, new Date().toISOString());
  };

  // Reset attendance (for new day)
  const resetAttendance = () => {
    setAttendanceStatus(null);
    setIsCheckedIn(false);
    setCheckInTime(null);
    setCheckOutTime(null);
    setTotalWorkTime(0);
    localStorage.removeItem('attendanceStatus');
    localStorage.removeItem('checkInTime');
  };

  const value = {
    attendanceStatus,
    isCheckedIn,
    checkInTime,
    checkOutTime,
    totalWorkTime,
    loading,
    checkIn,
    checkOut,
    getCurrentWorkTime,
    formatWorkTime,
    resetAttendance,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export default AttendanceContext;