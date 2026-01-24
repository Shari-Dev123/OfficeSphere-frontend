import { useAttendanceContext } from '../context/AttendanceContext';

/**
 * Custom hook for attendance management
 * Provides easy access to attendance context and helper methods
 */
const useAttendance = () => {
  const context = useAttendanceContext();

  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }

  // Check if user is currently checked in
  const isCurrentlyCheckedIn = () => {
    return context.isCheckedIn;
  };

  // Get check-in time in readable format
  const getCheckInTimeFormatted = () => {
    if (!context.checkInTime) return null;
    const date = new Date(context.checkInTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get check-out time in readable format
  const getCheckOutTimeFormatted = () => {
    if (!context.checkOutTime) return null;
    const date = new Date(context.checkOutTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get current work duration (if checked in)
  const getCurrentWorkDuration = () => {
    if (!context.isCheckedIn) return '0h 0m';
    const workTime = context.getCurrentWorkTime();
    return context.formatWorkTime(workTime);
  };

  // Get total work time formatted
  const getTotalWorkTimeFormatted = () => {
    return context.formatWorkTime(context.totalWorkTime);
  };

  // Check if user can check in (not already checked in)
  const canCheckIn = () => {
    return !context.isCheckedIn;
  };

  // Check if user can check out (already checked in)
  const canCheckOut = () => {
    return context.isCheckedIn;
  };

  // Get attendance summary
  const getAttendanceSummary = () => {
    return {
      isCheckedIn: context.isCheckedIn,
      checkInTime: getCheckInTimeFormatted(),
      checkOutTime: getCheckOutTimeFormatted(),
      currentWorkDuration: getCurrentWorkDuration(),
      totalWorkTime: getTotalWorkTimeFormatted(),
      status: context.attendanceStatus,
    };
  };

  // Calculate overtime (if work time > 8 hours)
  const calculateOvertime = () => {
    const workMinutes = context.isCheckedIn 
      ? context.getCurrentWorkTime() 
      : context.totalWorkTime;
    
    const standardWorkMinutes = 8 * 60; // 8 hours
    const overtimeMinutes = Math.max(0, workMinutes - standardWorkMinutes);
    
    return context.formatWorkTime(overtimeMinutes);
  };

  // Check if user is late (check-in after 9 AM)
  const isLateCheckIn = () => {
    if (!context.checkInTime) return false;
    
    const checkInDate = new Date(context.checkInTime);
    const checkInHour = checkInDate.getHours();
    const checkInMinutes = checkInDate.getMinutes();
    
    // Late if after 9:00 AM
    return checkInHour > 9 || (checkInHour === 9 && checkInMinutes > 0);
  };

  // Check if user is early checkout (before 5 PM)
  const isEarlyCheckOut = () => {
    if (!context.checkOutTime) return false;
    
    const checkOutDate = new Date(context.checkOutTime);
    const checkOutHour = checkOutDate.getHours();
    
    // Early if before 5:00 PM (17:00)
    return checkOutHour < 17;
  };

  return {
    // From context
    attendanceStatus: context.attendanceStatus,
    isCheckedIn: context.isCheckedIn,
    checkInTime: context.checkInTime,
    checkOutTime: context.checkOutTime,
    totalWorkTime: context.totalWorkTime,
    loading: context.loading,
    checkIn: context.checkIn,
    checkOut: context.checkOut,
    getCurrentWorkTime: context.getCurrentWorkTime,
    formatWorkTime: context.formatWorkTime,
    resetAttendance: context.resetAttendance,
    
    // Helper methods
    isCurrentlyCheckedIn,
    getCheckInTimeFormatted,
    getCheckOutTimeFormatted,
    getCurrentWorkDuration,
    getTotalWorkTimeFormatted,
    canCheckIn,
    canCheckOut,
    getAttendanceSummary,
    calculateOvertime,
    isLateCheckIn,
    isEarlyCheckOut,
  };
};

export default useAttendance;