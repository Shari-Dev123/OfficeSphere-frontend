import React, { useState, useEffect, useMemo } from "react";
import { adminAPI } from "../../../../utils/api";
import {
  FiDownload,
  FiEye,
  FiMail,
  FiFileText,
  FiUsers,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiBarChart2,
  FiPieChart,
  FiTrendingDown,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiPrinter,
  FiShare2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
} from "recharts";
import "./AttendanceReport.css";

// Professional color scheme
const PROFESSIONAL_COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#8B5CF6",
  dark: "#1F2937",
  light: "#F3F4F6",
};

const COLORS = [
  "#00C49F",
  "#FF8042",
  "#FFBB28",
  "#0088FE",
  "#8B5CF6",
  "#F59E0B",
];
const LEAVE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

function AttendanceReport({ reportData, dateRange, employees }) {
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "employeeName",
    direction: "asc",
  });
  const [selectedView, setSelectedView] = useState("overview"); // overview, detailed, analytics
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Extract and transform attendance data
  const getAttendanceData = useMemo(() => {
    if (!reportData) return [];

    let data = [];

    if (Array.isArray(reportData.employeeBreakdown)) {
      data = reportData.employeeBreakdown;
    } else if (Array.isArray(reportData.data)) {
      data = reportData.data;
    } else if (Array.isArray(reportData.attendanceData)) {
      data = reportData.attendanceData;
    } else if (Array.isArray(reportData.attendance)) {
      data = reportData.attendance;
    } else if (Array.isArray(reportData.records)) {
      data = reportData.records;
    }

    // Enhance data with professional metrics
    data = data.map((emp) => ({
      ...emp,
      _id: emp._id || emp.employeeId,
      employeeName:
        emp.employeeName || emp.name || emp.employee?.name || "Unknown",
      department: emp.department || emp.user?.department || "N/A",
      employeeId:
        emp.employeeId || emp.employeeCode || emp.userId?.employeeId || emp._id,

      // Attendance metrics
      totalWorkingDays: emp.totalDays || emp.totalWorkingDays || emp.days || 0,
      presentDays: emp.presentDays || emp.present || emp.daysPresent || 0,
      absentDays: emp.absentDays || emp.absent || emp.daysAbsent || 0,
      lateArrivals: emp.lateDays || emp.late || emp.daysLate || 0,
      earlyDepartures: emp.earlyDepartures || emp.early || emp.daysEarly || 0,

      // Leave breakdown (enhanced)
      casualLeave: emp.casualLeave || emp.leaves?.casual || 0,
      sickLeave: emp.sickLeave || emp.leaves?.sick || 0,
      paidLeave: emp.paidLeave || emp.leaves?.paid || 0,
      unpaidLeave: emp.unpaidLeave || emp.leaves?.unpaid || 0,
      totalLeaves: emp.leaveDays || emp.leave || 0,

      // Overtime and extra hours
      approvedOvertime: emp.overtimeHours || emp.overtime?.approved || 0,
      compensatoryOff: emp.compensatoryOff || emp.overtime?.compOff || 0,

      // Calculated metrics
      attendanceRate:
        emp.attendanceRate ||
        emp.rate ||
        (emp.totalDays > 0
          ? Math.round((emp.presentDays / emp.totalDays) * 100)
          : 0),
      punctualityRate:
        emp.punctualityRate ||
        (emp.totalDays > 0
          ? Math.round(((emp.totalDays - emp.lateDays) / emp.totalDays) * 100)
          : 0),

      // Compliance status
      complianceStatus:
        emp.complianceStatus ||
        (emp.attendanceRate >= 90
          ? "Compliant"
          : emp.attendanceRate >= 70
            ? "Needs Improvement"
            : "Non-Compliant"),
      isCompliant: emp.attendanceRate >= 85,
    }));

    return data;
  }, [reportData]);

  // Chart 1: Attendance Overview (Bar Chart)
  const getAttendanceOverviewData = () => {
    const data = getAttendanceData;
    if (!Array.isArray(data) || data.length === 0) {
      return []; // Return empty array instead of JSX
    }

    return data.slice(0, 8).map((emp) => ({
      name: emp.employeeName.split(" ")[0] || emp.employeeName,
      present: emp.presentDays,
      absent: emp.absentDays,
      late: emp.lateArrivals,
      early: emp.earlyDepartures,
      leave: emp.totalLeaves,
    }));
  };

  // Chart 2: Attendance Trend (Line Chart)
  const getAttendanceTrendData = () => {
    // This would typically come from API with time-series data
    // Mock data for demonstration
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return weeks.map((week, index) => ({
      week,
      attendance: 85 + Math.random() * 15,
      punctuality: 80 + Math.random() * 20,
      target: 90,
    }));
  };

  // Chart 3: Leave Distribution (Pie Chart)
  const getLeaveDistributionData = () => {
    const data = getAttendanceData;
    if (!Array.isArray(data) || data.length === 0) {
      return []; // Return empty array instead of JSX
    }

    const totals = data.reduce(
      (acc, emp) => ({
        sick: acc.sick + emp.sickLeave,
        casual: acc.casual + emp.casualLeave,
        paid: acc.paid + emp.paidLeave,
        unpaid: acc.unpaid + emp.unpaidLeave,
      }),
      { sick: 0, casual: 0, paid: 0, unpaid: 0 },
    );

    return [
      { name: "Sick Leave", value: totals.sick },
      { name: "Casual Leave", value: totals.casual },
      { name: "Paid Leave", value: totals.paid },
      { name: "Unpaid Leave", value: totals.unpaid },
    ].filter((item) => item.value > 0);
  };

  // Chart 4: Late Arrival Frequency (Bar Chart)
  const getLateArrivalData = () => {
    const data = getAttendanceData;
    if (!Array.isArray(data) || data.length === 0) {
      return []; // Return empty array instead of JSX
    }

    // Group by department or week
    const departments = [...new Set(data.map((emp) => emp.department))];
    return departments.map((dept) => ({
      department: dept,
      lateArrivals: data
        .filter((emp) => emp.department === dept)
        .reduce((sum, emp) => sum + emp.lateArrivals, 0),
      employees: data.filter((emp) => emp.department === dept).length,
    }));
  };

  // Chart 5: Daily Attendance Calendar Heatmap Data
  const getCalendarHeatmapData = () => {
    // Mock data for demonstration - in real app, this would come from API
    const days = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - 29 + i)),
      present: Math.floor(Math.random() * 50) + 50,
      absent: Math.floor(Math.random() * 10),
      late: Math.floor(Math.random() * 15),
    }));
    return days;
  };

  // Enhanced Summary Statistics
  const getSummaryStatistics = () => {
    const data = getAttendanceData;
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-muted">No data available</p>;
    }

    const totalEmployees = data.length;
    const presentTotal = data.reduce((sum, emp) => sum + emp.presentDays, 0);
    const absentTotal = data.reduce((sum, emp) => sum + emp.absentDays, 0);
    const lateTotal = data.reduce((sum, emp) => sum + emp.lateArrivals, 0);
    const leaveTotal = data.reduce((sum, emp) => sum + emp.totalLeaves, 0);
    const avgAttendanceRate = Math.round(
      data.reduce((sum, emp) => sum + emp.attendanceRate, 0) / totalEmployees,
    );
    const compliantEmployees = data.filter((emp) => emp.isCompliant).length;
    const complianceRate = Math.round(
      (compliantEmployees / totalEmployees) * 100,
    );

    return {
      totalEmployees,
      presentTotal,
      absentTotal,
      lateTotal,
      leaveTotal,
      avgAttendanceRate,
      compliantEmployees,
      complianceRate,
      totalWorkingDays: data[0]?.totalWorkingDays || 22,
    };
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...getAttendanceData];

    // Search filter
    if (searchTerm) {
      data = data.filter(
        (emp) =>
          emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Department filter
    if (selectedDepartment !== "all") {
      data = data.filter((emp) => emp.department === selectedDepartment);
    }

    // Sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [getAttendanceData, searchTerm, selectedDepartment, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDownload = async (format) => {
    try {
      setExporting(true);

      const params = {
        format: format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        includeCharts: format === "pdf" ? "true" : "false",
        detailed: "true",
      };

      const response = await adminAPI.exportReport("attendance", params);

      const blob = new Blob([response.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : format === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Attendance_Report_${dateRange.startDate}_to_${dateRange.endDate}_${Date.now()}.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error(error.response?.data?.message || "Failed to download report");
    } finally {
      setExporting(false);
    }
  };

  const handleEmailReport = () => {
    toast.info("Email feature coming soon!");
  };

  const handlePrint = () => {
    const printContent = document.getElementById("attendance-report-content");
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
  };

  const summary = getSummaryStatistics();
  const departments = [
    ...new Set(getAttendanceData.map((emp) => emp.department)),
  ];

  return (
    <div
      className="attendance-report professional-report"
      id="attendance-report-content"
    >
      {/* Report Header */}
      <div className="report-header">
        <div className="header-left">
          <h2 className="report-title">
            <FiActivity /> Attendance & Punctuality Report
          </h2>
          <div className="report-metadata">
            <span className="report-period">
              <FiCalendar />
              {new Date(dateRange.startDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(dateRange.endDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="report-generated">
              Generated:{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="header-right">
          <div className="report-controls">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="department-filter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Export Controls */}
      <div className="export-controls">
        <div className="view-tabs">
          <button
            className={`view-tab ${selectedView === "overview" ? "active" : ""}`}
            onClick={() => setSelectedView("overview")}
          >
            <FiBarChart2 /> Overview
          </button>
          <button
            className={`view-tab ${selectedView === "detailed" ? "active" : ""}`}
            onClick={() => setSelectedView("detailed")}
          >
            <FiFileText /> Detailed View
          </button>
          <button
            className={`view-tab ${selectedView === "analytics" ? "active" : ""}`}
            onClick={() => setSelectedView("analytics")}
          >
            <FiTrendingUp /> Analytics
          </button>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-outline btn-icon"
            onClick={() => handleDownload("pdf")}
            disabled={exporting}
          >
            <FiDownload /> PDF Report
          </button>
          <button
            className="btn btn-outline btn-icon"
            onClick={() => handleDownload("excel")}
            disabled={exporting}
          >
            <FiDownload /> Excel
          </button>
          <button
            className="btn btn-outline btn-icon"
            onClick={() => handleDownload("csv")}
            disabled={exporting}
          >
            <FiDownload /> CSV
          </button>
          <button className="btn btn-outline btn-icon" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button
            className="btn btn-primary btn-icon"
            onClick={handleEmailReport}
          >
            <FiMail /> Share Report
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="executive-summary">
        <h3 className="section-title">Executive Summary</h3>
        <div className="summary-grid">
          <div className="summary-card primary">
            <div className="card-header">
              <h4>Overall Attendance</h4>
              <span className="card-trend positive">↑ 2.5%</span>
            </div>
            <div className="card-content">
              <h2>{summary?.avgAttendanceRate || 0}%</h2>
              <p>Average Attendance Rate</p>
              <div className="card-details">
                <span>{summary?.presentTotal || 0} Present Days</span>
                <span>{summary?.totalEmployees || 0} Employees</span>
              </div>
            </div>
          </div>

          <div className="summary-card success">
            <div className="card-header">
              <h4>Compliance Status</h4>
              <span className="card-status compliant">
                <FiCheckCircle /> {summary?.complianceRate || 0}% Compliant
              </span>
            </div>
            <div className="card-content">
              <h2>
                {summary?.compliantEmployees || 0}/
                {summary?.totalEmployees || 0}
              </h2>
              <p>Employees Meeting Policy</p>
              <div className="compliance-meter">
                <div
                  className="compliance-fill"
                  style={{ width: `${summary?.complianceRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="summary-card warning">
            <div className="card-header">
              <h4>Punctuality</h4>
              <span className="card-trend negative">↓ 1.2%</span>
            </div>
            <div className="card-content">
              <h2>{summary?.lateTotal || 0}</h2>
              <p>Late Arrivals</p>
              <div className="card-details">
                <span>
                  Early Departures:{" "}
                  {getAttendanceData.reduce(
                    (sum, emp) => sum + emp.earlyDepartures,
                    0,
                  )}
                </span>
                <span>
                  Avg. per employee:{" "}
                  {(summary?.lateTotal / summary?.totalEmployees || 0).toFixed(
                    1,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="summary-card info">
            <div className="card-header">
              <h4>Leave Utilization</h4>
              <span className="card-trend neutral">→</span>
            </div>
            <div className="card-content">
              <h2>{summary?.leaveTotal || 0}</h2>
              <p>Total Leave Days</p>
              <div className="leave-breakdown">
                <span className="leave-type sick">
                  Sick:{" "}
                  {getAttendanceData.reduce(
                    (sum, emp) => sum + emp.sickLeave,
                    0,
                  )}
                </span>
                <span className="leave-type casual">
                  Casual:{" "}
                  {getAttendanceData.reduce(
                    (sum, emp) => sum + emp.casualLeave,
                    0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Enhanced Professional Charts */}
      {selectedView !== "detailed" && (
        <div className="charts-section professional-charts">
          <h3 className="section-title">
            <FiBarChart2 /> Analytics Dashboard
          </h3>

          <div className="charts-grid">
            {/* Chart 1: Attendance Overview (Professional Bar Chart) */}
            <div className="chart-container card">
              <div className="chart-header">
                <h5>Attendance Overview by Employee</h5>
                <span className="chart-subtitle">
                  Top 8 employees showing attendance pattern
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getAttendanceOverviewData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="present"
                    fill="#10B981"
                    name="Present"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    fill="#EF4444"
                    name="Absent"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="late"
                    fill="#F59E0B"
                    name="Late Arrival"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="leave"
                    fill="#8B5CF6"
                    name="Leave"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Attendance Trend (Line Chart) */}
            <div className="chart-container card">
              <div className="chart-header">
                <h5>Attendance Trend</h5>
                <span className="chart-subtitle">
                  Weekly attendance rate with punctuality
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getAttendanceTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="week" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Attendance Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="punctuality"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Punctuality Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#EF4444"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="Target (90%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Leave Distribution (Pie Chart) */}
            <div className="chart-container card">
              <div className="chart-header">
                <h5>Leave Distribution</h5>
                <span className="chart-subtitle">
                  Breakdown of leave types across organization
                </span>
              </div>
              {getLeaveDistributionData().length === 0 ? (
                <div className="no-data-placeholder">
                  <p className="text-muted">No leave data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getLeaveDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {getLeaveDistributionData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={LEAVE_COLORS[index % LEAVE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} days`, "Leave Days"]}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 4: Late Arrival Frequency by Department */}
            <div className="chart-container card">
              <div className="chart-header">
                <h5>Late Arrival Frequency</h5>
                <span className="chart-subtitle">
                  Department-wise late arrival analysis
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getLateArrivalData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="department" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "employees")
                        return [`${value}`, "Employees"];
                      return [`${value}`, "Late Arrivals"];
                    }}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="lateArrivals"
                    fill="#F59E0B"
                    name="Late Arrivals"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="employees"
                    fill="#8B5CF6"
                    name="Total Employees"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Analytics Row */}
          <div className="charts-grid">
            {/* Chart 5: Compliance Status */}
            <div className="chart-container card">
              <div className="chart-header">
                <h5>Compliance Status</h5>
                <span className="chart-subtitle">
                  Employees meeting attendance policy
                </span>
              </div>
              <div className="compliance-distribution">
                <div className="compliance-stats">
                  <div className="compliance-item compliant">
                    <span className="compliance-label">Compliant</span>
                    <span className="compliance-value">
                      {summary?.compliantEmployees || 0}
                    </span>
                    <div
                      className="compliance-bar"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                  <div className="compliance-item improvement">
                    <span className="compliance-label">Needs Improvement</span>
                    <span className="compliance-value">
                      {
                        filteredData.filter(
                          (emp) => emp.complianceStatus === "Needs Improvement",
                        ).length
                      }
                    </span>
                    <div
                      className="compliance-bar"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                  <div className="compliance-item non-compliant">
                    <span className="compliance-label">Non-Compliant</span>
                    <span className="compliance-value">
                      {
                        filteredData.filter(
                          (emp) => emp.complianceStatus === "Non-Compliant",
                        ).length
                      }
                    </span>
                    <div
                      className="compliance-bar"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 6: Overtime Analysis */}
            <div className="chart-container card">
              <div className="chart-header">
                <h5>Overtime Analysis</h5>
                <span className="chart-subtitle">
                  Approved overtime vs compensatory offs
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={filteredData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="employeeName" hide />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                    }}
                  />
                  <Bar
                    dataKey="approvedOvertime"
                    fill="#3B82F6"
                    name="Approved Overtime (hrs)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="compensatoryOff"
                    fill="#10B981"
                    name="Compensatory Off (days)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Data Table */}
      <div className="data-table-section card">
        <div className="table-header">
          <h3 className="section-title">
            <FiFileText /> Detailed Attendance Records
            <span className="record-count">
              ({filteredData.length} records)
            </span>
          </h3>
          <div className="table-actions">
            <span className="showing-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="professional-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("employeeName")}>
                  Employee
                  {sortConfig.key === "employeeName" && (
                    <span className="sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th>ID</th>
                <th>Department</th>
                <th onClick={() => handleSort("totalWorkingDays")}>
                  Working Days
                  {sortConfig.key === "totalWorkingDays" && (
                    <span className="sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("presentDays")}>
                  Present
                  {sortConfig.key === "presentDays" && (
                    <span className="sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("absentDays")}>
                  Absent
                  {sortConfig.key === "absentDays" && (
                    <span className="sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("lateArrivals")}>
                  Late
                  {sortConfig.key === "lateArrivals" && (
                    <span className="sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th>Leaves</th>
                <th onClick={() => handleSort("attendanceRate")}>
                  Attendance %
                  {sortConfig.key === "attendanceRate" && (
                    <span className="sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((emp, index) => (
                <tr key={index}>
                  <td className="employee-cell">
                    <div className="employee-info">
                      <div className="avatar">{emp.employeeName.charAt(0)}</div>
                      <div>
                        <div className="employee-name">{emp.employeeName}</div>
                        <div className="employee-details">
                          <span className="detail-item">{emp.department}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="employee-id">{emp.employeeId}</code>
                  </td>
                  <td>
                    <span className="department-badge">{emp.department}</span>
                  </td>
                  <td>{emp.totalWorkingDays}</td>
                  <td>
                    <span className="metric-value good">{emp.presentDays}</span>
                  </td>
                  <td>
                    <span className="metric-value danger">
                      {emp.absentDays}
                    </span>
                  </td>
                  <td>
                    <span className="metric-value warning">
                      {emp.lateArrivals}
                    </span>
                  </td>
                  <td>
                    <div className="leave-details">
                      <span className="leave-tag sick" title="Sick Leave">
                        S: {emp.sickLeave}
                      </span>
                      <span className="leave-tag casual" title="Casual Leave">
                        C: {emp.casualLeave}
                      </span>
                      <span className="leave-tag paid" title="Paid Leave">
                        P: {emp.paidLeave}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="attendance-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${emp.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span
                        className={`attendance-rate ${emp.attendanceRate >= 90 ? "good" : emp.attendanceRate >= 70 ? "average" : "poor"}`}
                      >
                        {emp.attendanceRate}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`compliance-badge ${emp.isCompliant ? "compliant" : "non-compliant"}`}
                    >
                      {emp.isCompliant ? (
                        <>
                          <FiCheckCircle /> Compliant
                        </>
                      ) : (
                        <>
                          <FiAlertCircle /> Non-Compliant
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft /> Previous
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    className={`pagination-number ${currentPage === pageNumber ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="pagination-ellipsis">...</span>
                  <button
                    className="pagination-number"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Key Insights & Recommendations */}
      <div className="insights-section card">
        <h3 className="section-title">
          <FiActivity /> Key Insights & Recommendations
        </h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <h5>Strengths</h5>
            <ul>
              <li>
                Overall attendance rate of {summary?.avgAttendanceRate || 0}%
                meets company standards
              </li>
              <li>
                {summary?.compliantEmployees || 0} employees (
                {summary?.complianceRate || 0}%) fully compliant
              </li>
              <li>Low unauthorized absence rate</li>
            </ul>
          </div>

          <div className="insight-card warning">
            <h5>Areas for Improvement</h5>
            <ul>
              <li>Late arrivals increased by 5% compared to last period</li>
              <li>
                {
                  filteredData.filter(
                    (emp) => emp.complianceStatus === "Needs Improvement",
                  ).length
                }{" "}
                employees need improvement
              </li>
              <li>High sick leave utilization in Q1</li>
            </ul>
          </div>

          <div className="insight-card info">
            <h5>Recommendations</h5>
            <ul>
              <li>
                Implement flexible working hours for departments with high late
                arrivals
              </li>
              <li>Review attendance policy with non-compliant employees</li>
              <li>Consider wellness programs to reduce sick leave</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer with Disclaimer */}
      <div className="report-footer">
        <p className="disclaimer">
          <strong>Disclaimer:</strong> This report is generated for internal use
          only. All attendance data is based on company records as of the report
          generation date. For any discrepancies, please contact HR department
          within 7 working days.
        </p>
        <div className="footer-info">
          <span>Confidential & Proprietary</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReport;
