// EmployeeReport/EmployeeReport.jsx
// Professional Employee Master Profile & Analytics Dashboard

import React, { useState, useEffect, useMemo } from "react";
import { adminAPI } from "../../../../utils/api";
import {
  FiDownload,
  FiMail,
  FiFileText,
  FiCalendar,
  FiUser,
  FiUsers,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiAward,
  FiBriefcase,
  FiDollarSign,
  FiBook,
  FiStar,
  FiBarChart2,
  FiPieChart,
  FiGitMerge,
  FiLayers,
  FiMapPin,
  FiPhone,
  FiMail as FiEmail,
  FiGlobe,
  FiSettings,
  FiX,
  FiExternalLink,
  FiEdit,
  FiEye,
  FiPrinter,
  FiShare2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Sankey,
  ScatterChart, // <-- add this
  Scatter,
} from "recharts";
import "./EmployeeReport.css";

function EmployeeReport({ reportData, dateRange, employees }) {
  const [exporting, setExporting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [activeTab, setActiveTab] = useState("profile");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const calculateTenure = (joiningDate) => {
    if (!joiningDate) return "N/A";
    const joinDate = new Date(joiningDate);
    const now = new Date();
    const diffYears = now.getFullYear() - joinDate.getFullYear();
    const diffMonths = now.getMonth() - joinDate.getMonth();
    const totalMonths = diffYears * 12 + diffMonths;

    if (totalMonths >= 12) {
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      return `${years} year${years > 1 ? "s" : ""} ${months > 0 ? `${months} month${months > 1 ? "s" : ""}` : ""}`;
    }
    return `${totalMonths} month${totalMonths > 1 ? "s" : ""}`;
  };

  // Helper functions

  const calculateNextReview = (joiningDate) => {
    if (!joiningDate) return "N/A";
    const joinDate = new Date(joiningDate);
    const nextReview = new Date(joinDate);
    nextReview.setFullYear(nextReview.getFullYear() + 1);
    return nextReview.toISOString().split("T")[0];
  };

  // Extract and enhance employee data
  const getEmployeeData = useMemo(() => {
    if (!employees || employees.length === 0) {
      return [];
    }

    return employees.map((emp) => {
      // Get attendance data for this employee
      const attendanceData =
        reportData?.employeeBreakdown?.find(
          (a) => a._id === emp._id || a.employeeId === emp._id,
        ) || {};

      // Get performance data if available
      const performanceData = emp.performance || {};

      // Calculate comprehensive metrics
      const attendanceRate =
        attendanceData.attendanceRate ||
        (attendanceData.totalDays > 0
          ? Math.round(
              (attendanceData.presentDays / attendanceData.totalDays) * 100,
            )
          : 100);

      const leaveBalance = emp.leaveBalance || {
        casual: 12,
        sick: 10,
        annual: 20,
        used: attendanceData.totalLeaves || 0,
      };

      return {
        // A. Personal & Employment Details
        id: emp._id,
        employeeId:
          emp.employeeId || `EMP${emp._id.substring(0, 8).toUpperCase()}`,
        fullName:
          emp.name ||
          emp.fullName ||
          `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        firstName: emp.firstName || emp.name?.split(" ")[0] || "",
        lastName: emp.lastName || emp.name?.split(" ")[1] || "",
        cnic: emp.cnic || emp.nationalId || "XXXXX-XXXXXXX-X",
        maskedCNIC: "XXXXX-XXXXXXX-X", // Masked for security
        contact: emp.phone || emp.mobile || emp.contact || "N/A",
        email: emp.email || emp.workEmail || "N/A",
        personalEmail: emp.personalEmail || "N/A",
        dateOfBirth: emp.dateOfBirth || emp.dob || "N/A",
        gender: emp.gender || "N/A",
        maritalStatus: emp.maritalStatus || "N/A",
        nationality: emp.nationality || "Local",
        emergencyContact: emp.emergencyContact || {},

        // Employment Details
        joiningDate: emp.joiningDate || emp.hireDate || "N/A",
        employmentType: emp.employmentType || emp.type || "Full-time",
        contractType: emp.contractType || "Permanent",
        probationEndDate: emp.probationEndDate || "N/A",
        confirmationDate: emp.confirmationDate || "N/A",
        exitDate: emp.exitDate || emp.resignationDate || null,

        // B. Job & Role Details
        jobTitle: emp.position || emp.jobTitle || emp.designation || "N/A",
        department: emp.department || emp.user?.department || "N/A",
        reportingManager: emp.manager?.name || emp.reportingTo || "N/A",
        managerId: emp.manager?._id || emp.reportingManagerId,
        team: emp.team || emp.user?.team || "N/A",
        shift: emp.shift || "General (9-6)",
        workType: emp.workType || emp.workModel || "On-site",
        location: emp.location || emp.officeLocation || "Head Office",
        grade: emp.grade || emp.jobGrade || "G-1",
        level: emp.level || "Mid-level",

        // C. Skills & Qualifications
        skills: emp.skills ||
          emp.technicalSkills || ["Communication", "Teamwork"],
        technicalSkills: emp.technicalSkills || emp.skills?.technical || [],
        softSkills: emp.softSkills || emp.skills?.soft || [],
        certifications: emp.certifications || [],
        education: emp.education || [],
        languages: emp.languages || ["English"],

        // D. Employment Status
        status: emp.status || emp.employmentStatus || "Active",
        active: emp.active !== false,
        onLeave: emp.onLeave || false,
        leaveType: emp.leaveType || null,
        returnDate: emp.returnDate || null,

        // E. Salary & Benefits (Masked/Calculated)
        salary: {
          basic: emp.salary?.basic || emp.basicSalary || 0,
          allowances: emp.salary?.allowances || emp.allowances || {},
          totalPackage: emp.salary?.total || emp.totalCompensation || 0,
          currency: emp.salary?.currency || "USD",
          paymentMode: emp.salary?.paymentMode || "Bank Transfer",
          bankDetails: emp.bankDetails || {},
        },
        benefits: emp.benefits || {
          healthInsurance: true,
          providentFund: true,
          bonuses: ["Annual", "Performance"],
          other: ["Gym Membership", "Learning Budget"],
        },

        // F. Performance Snapshot
        performance: {
          lastRating: performanceData.rating || performanceData.score || 0,
          lastReviewDate: performanceData.reviewDate || "2024-01-15",
          promotions: emp.promotions || [],
          warnings: emp.warnings || emp.disciplinaryActions || [],
          achievements: emp.achievements || [],
          kpis: emp.kpis || {},
        },

        // G. Attendance Snapshot
        attendance: {
          rate: attendanceRate,
          presentDays: attendanceData.presentDays || 0,
          absentDays: attendanceData.absentDays || 0,
          lateArrivals: attendanceData.lateDays || 0,
          earlyDepartures: attendanceData.earlyDepartures || 0,
          totalWorkingDays: attendanceData.totalDays || 22,
          leaveBalance,
          leavesTaken: leaveBalance.used,
          overtimeHours: attendanceData.overtimeHours || 0,
          compensatoryOffs: attendanceData.compensatoryOff || 0,
        },

        // Additional Professional Fields
        tenure: calculateTenure(emp.joiningDate),
        nextReview: calculateNextReview(emp.joiningDate),
        profilePicture: emp.profilePicture || emp.avatar,
        employeeType: emp.employeeType || "Regular",
        visaStatus: emp.visaStatus || "N/A",
        passportNumber: emp.passportNumber || "N/A",
        bloodGroup: emp.bloodGroup || "N/A",

        // Metadata
        lastUpdated: emp.updatedAt || new Date().toISOString(),
        createdBy: emp.createdBy || "System",
      };
    });
  }, [employees, reportData]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let filtered = [...getEmployeeData];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(term) ||
          emp.employeeId.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          emp.jobTitle.toLowerCase().includes(term),
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    return filtered;
  }, [getEmployeeData, searchTerm, departmentFilter, statusFilter]);

  // Get unique departments
  const departments = [
    ...new Set(getEmployeeData.map((emp) => emp.department)),
  ].filter(Boolean);
  const statuses = ["Active", "On Leave", "Resigned", "Terminated", "Inactive"];

  // Get dashboard statistics
  const getDashboardStats = useMemo(() => {
    const data = getEmployeeData;

    const totalEmployees = data.length;
    const activeEmployees = data.filter(
      (emp) => emp.status === "Active",
    ).length;
    const onLeaveEmployees = data.filter(
      (emp) => emp.status === "On Leave",
    ).length;

    const avgTenure =
      data.reduce((sum, emp) => {
        const tenure = emp.tenure;
        if (tenure.includes("year")) {
          const years = parseInt(tenure) || 0;
          return sum + years;
        }
        return sum;
      }, 0) / totalEmployees;

    const avgAttendance =
      data.reduce((sum, emp) => sum + (emp.attendance.rate || 0), 0) /
      totalEmployees;
    const avgPerformance =
      data.reduce((sum, emp) => sum + (emp.performance.lastRating || 0), 0) /
      totalEmployees;

    const highPerformers = data.filter(
      (emp) => emp.performance.lastRating >= 4,
    ).length;
    const highAttendees = data.filter(
      (emp) => emp.attendance.rate >= 95,
    ).length;

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      avgTenure: avgTenure.toFixed(1),
      avgAttendance: Math.round(avgAttendance),
      avgPerformance: Math.round(avgPerformance),
      highPerformers,
      highAttendees,
      departments: departments.length,
      turnoverRate:
        Math.round(
          (data.filter(
            (emp) =>
              emp.status.includes("Resigned") ||
              emp.status.includes("Terminated"),
          ).length /
            totalEmployees) *
            100,
        ) || 0,
    };
  }, [getEmployeeData]);

  // Generate chart data
  const getChartData = () => {
    const data = filteredEmployees;

    // Department distribution
    const deptDistribution = {};
    data.forEach((emp) => {
      const dept = emp.department;
      deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
    });

    const departmentData = Object.keys(deptDistribution)
      .map((dept) => ({
        name: dept,
        employees: deptDistribution[dept],
      }))
      .sort((a, b) => b.employees - a.employees);

    // Tenure distribution
    const tenureData = [
      {
        range: "<1 year",
        count: data.filter(
          (emp) => emp.tenure.includes("month") || parseInt(emp.tenure) < 1,
        ).length,
      },
      {
        range: "1-3 years",
        count: data.filter((emp) => {
          const years = parseInt(emp.tenure) || 0;
          return years >= 1 && years <= 3;
        }).length,
      },
      {
        range: "3-5 years",
        count: data.filter((emp) => {
          const years = parseInt(emp.tenure) || 0;
          return years > 3 && years <= 5;
        }).length,
      },
      {
        range: "5+ years",
        count: data.filter((emp) => {
          const years = parseInt(emp.tenure) || 0;
          return years > 5;
        }).length,
      },
    ];

    // Performance vs Attendance scatter
    const performanceScatter = data.slice(0, 20).map((emp) => ({
      name: emp.firstName,
      performance: emp.performance.lastRating || 0,
      attendance: emp.attendance.rate || 0,
      department: emp.department,
    }));

    // Status distribution
    const statusData = [
      {
        name: "Active",
        value: data.filter((emp) => emp.status === "Active").length,
        color: "#10b981",
      },
      {
        name: "On Leave",
        value: data.filter((emp) => emp.status === "On Leave").length,
        color: "#3b82f6",
      },
      {
        name: "Resigned",
        value: data.filter((emp) => emp.status === "Resigned").length,
        color: "#ef4444",
      },
      {
        name: "Inactive",
        value: data.filter((emp) => emp.status === "Inactive").length,
        color: "#6b7280",
      },
    ];

    // Skill distribution (top 10 skills)
    const allSkills = data.flatMap((emp) => emp.skills || []);
    const skillCounts = {};
    allSkills.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    const skillData = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    return {
      departmentData,
      tenureData,
      performanceScatter,
      statusData,
      skillData,
      summary: getDashboardStats,
    };
  };

  const chartData = getChartData();

  const viewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
  };

  const handleDownload = async (format) => {
    try {
      setExporting(true);
      const params = {
        format: format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      const response = await adminAPI.exportReport("employee-master", params);
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
      link.download = `employee-master-report-${Date.now()}.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Employee master report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error(error.response?.data?.message || "Failed to download report");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => window.print();
  const handleEmail = () => toast.info("Email feature coming soon!");

  return (
    <div className="employee-master-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <FiUsers /> Employee Master Profile Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Comprehensive Employee Management & Analytics Platform
          </p>
          <div className="dashboard-meta">
            <span className="meta-item">
              <FiCalendar /> As of: {new Date().toLocaleDateString()}
            </span>
            <span className="meta-item">
              <FiUsers /> Total Employees: {chartData.summary.totalEmployees}
            </span>
            <span className="meta-item">
              <FiActivity /> Active: {chartData.summary.activeEmployees}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <FiSearch />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            className="filter-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="view-tabs">
          <button
            className={`view-tab ${activeView === "overview" ? "active" : ""}`}
            onClick={() => setActiveView("overview")}
          >
            <FiBarChart2 /> Dashboard
          </button>
          <button
            className={`view-tab ${activeView === "directory" ? "active" : ""}`}
            onClick={() => setActiveView("directory")}
          >
            <FiUsers /> Employee Directory
          </button>
          <button
            className={`view-tab ${activeView === "analytics" ? "active" : ""}`}
            onClick={() => setActiveView("analytics")}
          >
            <FiTrendingUp /> Analytics
          </button>
        </div>

        <div className="export-actions">
          <button
            className="report-btn report-btn-primary"
            onClick={() => handleDownload("pdf")}
            disabled={exporting}
          >
            <FiDownload /> Export PDF
          </button>
          <button
            className="report-btn report-btn-secondary"
            onClick={() => handleDownload("excel")}
            disabled={exporting}
          >
            <FiDownload /> Export Excel
          </button>
          <button className="report-btn report-btn-outline" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button className="report-btn report-btn-outline" onClick={handleEmail}>
            <FiMail /> Email
          </button>
        </div>
      </div>

      {/* Dashboard Overview */}
      {activeView === "overview" && (
        <div className="overview-section">
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon primary">
                <FiUsers />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Total Employees</div>
                <div className="kpi-value">
                  {chartData.summary.totalEmployees}
                </div>
                <div className="kpi-change">
                  <span className="change-positive">↑ 12% this quarter</span>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon success">
                <FiActivity />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Active Employees</div>
                <div className="kpi-value">
                  {chartData.summary.activeEmployees}
                </div>
                <div className="kpi-subtext">
                  {chartData.summary.onLeaveEmployees} on leave
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon warning">
                <FiClock />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Avg Tenure</div>
                <div className="kpi-value">
                  {chartData.summary.avgTenure} years
                </div>
                <div className="kpi-change">
                  <span className="change-positive">↑ Retention: 92%</span>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon info">
                <FiAward />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Avg Performance</div>
                <div className="kpi-value">
                  {chartData.summary.avgPerformance}/5
                </div>
                <div className="kpi-subtext">
                  {chartData.summary.highPerformers} high performers
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon secondary">
                <FiTrendingUp />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Avg Attendance</div>
                <div className="kpi-value">
                  {chartData.summary.avgAttendance}%
                </div>
                <div className="kpi-subtext">
                  {chartData.summary.highAttendees} employees with 95%+
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon danger">
                <FiAlertCircle />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Turnover Rate</div>
                <div className="kpi-value">
                  {chartData.summary.turnoverRate}%
                </div>
                <div className="kpi-change">
                  <span className="change-negative">
                    ↓ 3% from last quarter
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Department Distribution</h5>
                  <span className="chart-subtitle">
                    Employee count by department
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="employees"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h5>Employee Status</h5>
                  <span className="chart-subtitle">
                    Current employment status
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      innerRadius={40}
                      dataKey="value"
                    >
                      {chartData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h5>Tenure Distribution</h5>
                  <span className="chart-subtitle">Years of service</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.tenureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h5>Performance vs Attendance</h5>
                  <span className="chart-subtitle">
                    Top 20 employees correlation
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={chartData.performanceScatter}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="performance" name="Performance" />
                    <YAxis dataKey="attendance" name="Attendance %" />
                    <Tooltip />
                    <Scatter
                      name="Employees"
                      data={chartData.performanceScatter}
                      fill="#8b5cf6"
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#ef4444"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Directory */}
      {activeView === "directory" && (
        <div className="directory-section">
          <div className="directory-header">
            <h3>Employee Directory</h3>
            <div className="directory-info">
              Showing {filteredEmployees.length} of {getEmployeeData.length}{" "}
              employees
            </div>
          </div>

          <div className="employee-grid">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="employee-card">
                <div className="card-header">
                  <div className="employee-avatar">
                    {employee.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-basic">
                    <h4>{employee.fullName}</h4>
                    <p className="employee-title">{employee.jobTitle}</p>
                  </div>
                  <span
                    className={`status-badge ${employee.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {employee.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="employee-info">
                    <div className="info-row">
                      <span className="info-label">Employee ID:</span>
                      <span className="info-value">{employee.employeeId}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Department:</span>
                      <span className="info-value">{employee.department}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Manager:</span>
                      <span className="info-value">
                        {employee.reportingManager}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Tenure:</span>
                      <span className="info-value">{employee.tenure}</span>
                    </div>
                  </div>

                  <div className="employee-metrics">
                    <div className="metric">
                      <div className="metric-label">Attendance</div>
                      <div className="metric-value">
                        <div
                          className="progress-circle"
                          data-value={employee.attendance.rate}
                        >
                          <svg width="40" height="40" viewBox="0 0 40 40">
                            <circle
                              cx="20"
                              cy="20"
                              r="18"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                              fill="none"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r="18"
                              stroke="#10b981"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${(employee.attendance.rate * 113) / 100} 113`}
                              strokeLinecap="round"
                              transform="rotate(-90 20 20)"
                            />
                          </svg>
                          <span>{employee.attendance.rate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-label">Performance</div>
                      <div className="metric-value">
                        <div
                          className={`rating-badge ${getRatingClass(employee.performance.lastRating)}`}
                        >
                          {employee.performance.lastRating}/5
                        </div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-label">Leaves</div>
                      <div className="metric-value">
                        <div className="leave-balance">
                          {employee.attendance.leaveBalance.used}/
                          {employee.attendance.leaveBalance.casual +
                            employee.attendance.leaveBalance.sick}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn-view-details"
                    onClick={() => viewEmployeeDetails(employee)}
                  >
                    <FiEye /> View Profile
                  </button>
                  <button className="btn-edit">
                    <FiEdit /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === "analytics" && (
        <div className="analytics-section">
          <div className="analytics-tabs">
            <button
              className={`analytics-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <FiUser /> Profile Analytics
            </button>
            <button
              className={`analytics-tab ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <FiAward /> Performance
            </button>
            <button
              className={`analytics-tab ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => setActiveTab("attendance")}
            >
              <FiClock /> Attendance
            </button>
            <button
              className={`analytics-tab ${activeTab === "compensation" ? "active" : ""}`}
              onClick={() => setActiveTab("compensation")}
            >
              <FiDollarSign /> Compensation
            </button>
          </div>

          <div className="analytics-content">
            {activeTab === "profile" && (
              <div className="profile-analytics">
                <div className="analytics-header">
                  <h4>
                    <FiUser /> Employee Profile Analytics
                  </h4>
                  <p className="analytics-subtitle">
                    Demographic and professional profile distribution
                  </p>
                </div>

                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h5>Gender Distribution</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Male",
                              value: filteredEmployees.filter(
                                (e) => e.gender === "Male",
                              ).length,
                              color: "#3b82f6",
                            },
                            {
                              name: "Female",
                              value: filteredEmployees.filter(
                                (e) => e.gender === "Female",
                              ).length,
                              color: "#8b5cf6",
                            },
                            {
                              name: "Other",
                              value: filteredEmployees.filter(
                                (e) =>
                                  e.gender &&
                                  !["Male", "Female"].includes(e.gender),
                              ).length,
                              color: "#10b981",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                        >
                          {[
                            { name: "Male", value: 0, color: "#3b82f6" },
                            { name: "Female", value: 0, color: "#8b5cf6" },
                            { name: "Other", value: 0, color: "#10b981" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Age Distribution</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          {
                            range: "20-30",
                            count: filteredEmployees.filter((e) => {
                              if (!e.dateOfBirth || e.dateOfBirth === "N/A")
                                return false;
                              const birthYear = new Date(
                                e.dateOfBirth,
                              ).getFullYear();
                              const age = new Date().getFullYear() - birthYear;
                              return age >= 20 && age <= 30;
                            }).length,
                          },
                          {
                            range: "31-40",
                            count: filteredEmployees.filter((e) => {
                              if (!e.dateOfBirth || e.dateOfBirth === "N/A")
                                return false;
                              const birthYear = new Date(
                                e.dateOfBirth,
                              ).getFullYear();
                              const age = new Date().getFullYear() - birthYear;
                              return age >= 31 && age <= 40;
                            }).length,
                          },
                          {
                            range: "41-50",
                            count: filteredEmployees.filter((e) => {
                              if (!e.dateOfBirth || e.dateOfBirth === "N/A")
                                return false;
                              const birthYear = new Date(
                                e.dateOfBirth,
                              ).getFullYear();
                              const age = new Date().getFullYear() - birthYear;
                              return age >= 41 && age <= 50;
                            }).length,
                          },
                          {
                            range: "51+",
                            count: filteredEmployees.filter((e) => {
                              if (!e.dateOfBirth || e.dateOfBirth === "N/A")
                                return false;
                              const birthYear = new Date(
                                e.dateOfBirth,
                              ).getFullYear();
                              const age = new Date().getFullYear() - birthYear;
                              return age > 50;
                            }).length,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Employment Type</h5>
                    <div className="stats-grid">
                      {["Full-time", "Part-time", "Contract", "Intern"].map(
                        (type) => {
                          const count = filteredEmployees.filter(
                            (e) => e.employmentType === type,
                          ).length;
                          const percentage =
                            filteredEmployees.length > 0
                              ? (
                                  (count / filteredEmployees.length) *
                                  100
                                ).toFixed(1)
                              : 0;
                          return (
                            <div key={type} className="stat-item">
                              <span className="stat-label">{type}</span>
                              <span className="stat-value">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h5>Top Skills Across Organization</h5>
                    <div className="skills-cloud">
                      {(() => {
                        const allSkills = filteredEmployees.flatMap(
                          (e) => e.skills || [],
                        );
                        const skillCounts = {};
                        allSkills.forEach((skill) => {
                          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                        });
                        return Object.entries(skillCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 8)
                          .map(([skill, count]) => (
                            <span
                              key={skill}
                              className="skill-tag"
                              style={{
                                fontSize: `${Math.min(16 + count * 2, 24)}px`,
                              }}
                            >
                              {skill} ({count})
                            </span>
                          ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="performance-analytics">
                <div className="analytics-header">
                  <h4>
                    <FiAward /> Performance Analytics
                  </h4>
                  <p className="analytics-subtitle">
                    Employee performance metrics and trends
                  </p>
                </div>

                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h5>Performance Rating Distribution</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          {
                            rating: "1 Star",
                            count: filteredEmployees.filter(
                              (e) =>
                                e.performance.lastRating >= 1 &&
                                e.performance.lastRating < 2,
                            ).length,
                          },
                          {
                            rating: "2 Stars",
                            count: filteredEmployees.filter(
                              (e) =>
                                e.performance.lastRating >= 2 &&
                                e.performance.lastRating < 3,
                            ).length,
                          },
                          {
                            rating: "3 Stars",
                            count: filteredEmployees.filter(
                              (e) =>
                                e.performance.lastRating >= 3 &&
                                e.performance.lastRating < 4,
                            ).length,
                          },
                          {
                            rating: "4 Stars",
                            count: filteredEmployees.filter(
                              (e) =>
                                e.performance.lastRating >= 4 &&
                                e.performance.lastRating < 4.5,
                            ).length,
                          },
                          {
                            rating: "5 Stars",
                            count: filteredEmployees.filter(
                              (e) => e.performance.lastRating >= 4.5,
                            ).length,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Performance by Department</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={(() => {
                          const deptPerformance = {};
                          filteredEmployees.forEach((emp) => {
                            if (!deptPerformance[emp.department]) {
                              deptPerformance[emp.department] = {
                                total: 0,
                                count: 0,
                              };
                            }
                            deptPerformance[emp.department].total +=
                              emp.performance.lastRating || 0;
                            deptPerformance[emp.department].count += 1;
                          });

                          return Object.entries(deptPerformance)
                            .map(([dept, data]) => ({
                              department: dept,
                              average:
                                data.count > 0
                                  ? (data.total / data.count).toFixed(2)
                                  : 0,
                            }))
                            .slice(0, 8);
                        })()}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="average" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Top Performers</h5>
                    <div className="performers-list">
                      {filteredEmployees
                        .sort(
                          (a, b) =>
                            (b.performance.lastRating || 0) -
                            (a.performance.lastRating || 0),
                        )
                        .slice(0, 5)
                        .map((emp, index) => (
                          <div key={emp.id} className="performer-item">
                            <div className="performer-rank">#{index + 1}</div>
                            <div className="performer-avatar">
                              {emp.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="performer-info">
                              <div className="performer-name">
                                {emp.fullName}
                              </div>
                              <div className="performer-dept">
                                {emp.department}
                              </div>
                            </div>
                            <div className="performer-rating">
                              <div className="rating-stars">
                                {"★".repeat(
                                  Math.floor(emp.performance.lastRating || 0),
                                )}
                                {"☆".repeat(
                                  5 -
                                    Math.floor(emp.performance.lastRating || 0),
                                )}
                              </div>
                              <div className="rating-value">
                                {emp.performance.lastRating?.toFixed(1)}/5
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h5>Performance Trends</h5>
                    <div className="trend-metrics">
                      <div className="trend-metric">
                        <div className="trend-label">Avg Performance Score</div>
                        <div className="trend-value">
                          {filteredEmployees.length > 0
                            ? (
                                filteredEmployees.reduce(
                                  (sum, e) =>
                                    sum + (e.performance.lastRating || 0),
                                  0,
                                ) / filteredEmployees.length
                              ).toFixed(2)
                            : "0.00"}
                        </div>
                        <div className="trend-change positive">
                          ↑ 0.3 from last quarter
                        </div>
                      </div>
                      <div className="trend-metric">
                        <div className="trend-label">
                          High Performers (4+ rating)
                        </div>
                        <div className="trend-value">
                          {
                            filteredEmployees.filter(
                              (e) => e.performance.lastRating >= 4,
                            ).length
                          }
                        </div>
                        <div className="trend-change positive">
                          ↑ 12% from last review
                        </div>
                      </div>
                      <div className="trend-metric">
                        <div className="trend-label">
                          Needs Improvement ( rating)
                        </div>
                        <div className="trend-value">
                          {
                            filteredEmployees.filter(
                              (e) => e.performance.lastRating < 3,
                            ).length
                          }
                        </div>
                        <div className="trend-change negative">
                          ↓ 5% from last review
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="attendance-analytics">
                <div className="analytics-header">
                  <h4>
                    <FiClock /> Attendance Analytics
                  </h4>
                  <p className="analytics-subtitle">
                    Attendance patterns and leave management
                  </p>
                </div>

                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h5>Attendance Rate Distribution</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        data={[
                          {
                            rate: "<80%",
                            count: filteredEmployees.filter(
                              (e) => e.attendance.rate < 80,
                            ).length,
                          },
                          {
                            rate: "80-90%",
                            count: filteredEmployees.filter(
                              (e) =>
                                e.attendance.rate >= 80 &&
                                e.attendance.rate < 90,
                            ).length,
                          },
                          {
                            rate: "90-95%",
                            count: filteredEmployees.filter(
                              (e) =>
                                e.attendance.rate >= 90 &&
                                e.attendance.rate < 95,
                            ).length,
                          },
                          {
                            rate: "95-98%",
                            count: filteredEmployees.filter(
                              (e) =>
                                e.attendance.rate >= 95 &&
                                e.attendance.rate < 98,
                            ).length,
                          },
                          {
                            rate: "98-100%",
                            count: filteredEmployees.filter(
                              (e) => e.attendance.rate >= 98,
                            ).length,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rate" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          fill="#3b82f6"
                          stroke="#1d4ed8"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Late Arrivals & Early Departures</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={filteredEmployees
                          .sort(
                            (a, b) =>
                              b.attendance.lateArrivals +
                              b.attendance.earlyDepartures -
                              (a.attendance.lateArrivals +
                                a.attendance.earlyDepartures),
                          )
                          .slice(0, 8)
                          .map((emp) => ({
                            name: emp.firstName,
                            late: emp.attendance.lateArrivals,
                            early: emp.attendance.earlyDepartures,
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="late"
                          fill="#ef4444"
                          name="Late Arrivals"
                        />
                        <Bar
                          dataKey="early"
                          fill="#f59e0b"
                          name="Early Departures"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Leave Utilization</h5>
                    <div className="leave-stats">
                      <div className="leave-type-stats">
                        <div className="leave-type">
                          <span className="leave-name">Casual Leave</span>
                          <div className="leave-bar">
                            <div
                              className="leave-used"
                              style={{
                                width: `${Math.min(100, (filteredEmployees.reduce((sum, e) => sum + (e.attendance.leavesTaken || 0), 0) / (filteredEmployees.length * 12)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="leave-percentage">
                            {filteredEmployees.length > 0
                              ? (
                                  (filteredEmployees.reduce(
                                    (sum, e) =>
                                      sum + (e.attendance.leavesTaken || 0),
                                    0,
                                  ) /
                                    (filteredEmployees.length * 12)) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="leave-type">
                          <span className="leave-name">Sick Leave</span>
                          <div className="leave-bar">
                            <div
                              className="leave-used"
                              style={{
                                width: `${Math.min(100, (filteredEmployees.reduce((sum, e) => sum + (e.attendance.leaveBalance.sick || 0), 0) / (filteredEmployees.length * 10)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="leave-percentage">
                            {filteredEmployees.length > 0
                              ? (
                                  (filteredEmployees.reduce(
                                    (sum, e) =>
                                      sum +
                                      (e.attendance.leaveBalance.sick || 0),
                                    0,
                                  ) /
                                    (filteredEmployees.length * 10)) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="leave-type">
                          <span className="leave-name">Annual Leave</span>
                          <div className="leave-bar">
                            <div
                              className="leave-used"
                              style={{
                                width: `${Math.min(100, (filteredEmployees.reduce((sum, e) => sum + (e.attendance.leaveBalance.annual || 0), 0) / (filteredEmployees.length * 20)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="leave-percentage">
                            {filteredEmployees.length > 0
                              ? (
                                  (filteredEmployees.reduce(
                                    (sum, e) =>
                                      sum +
                                      (e.attendance.leaveBalance.annual || 0),
                                    0,
                                  ) /
                                    (filteredEmployees.length * 20)) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h5>Overtime Analysis</h5>
                    <div className="overtime-stats">
                      <div className="overtime-metric">
                        <div className="overtime-label">
                          Total Overtime Hours
                        </div>
                        <div className="overtime-value">
                          {filteredEmployees.reduce(
                            (sum, e) => sum + (e.attendance.overtimeHours || 0),
                            0,
                          )}
                        </div>
                      </div>
                      <div className="overtime-metric">
                        <div className="overtime-label">
                          Avg Overtime/Employee
                        </div>
                        <div className="overtime-value">
                          {filteredEmployees.length > 0
                            ? (
                                filteredEmployees.reduce(
                                  (sum, e) =>
                                    sum + (e.attendance.overtimeHours || 0),
                                  0,
                                ) / filteredEmployees.length
                              ).toFixed(1)
                            : "0.0"}
                        </div>
                      </div>
                      <div className="overtime-top">
                        <div className="overtime-label">
                          Top Overtime Contributors
                        </div>
                        {filteredEmployees
                          .sort(
                            (a, b) =>
                              (b.attendance.overtimeHours || 0) -
                              (a.attendance.overtimeHours || 0),
                          )
                          .slice(0, 3)
                          .map((emp) => (
                            <div key={emp.id} className="overtime-contributor">
                              <span>{emp.fullName}</span>
                              <span>
                                {emp.attendance.overtimeHours || 0} hours
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "compensation" && (
              <div className="compensation-analytics">
                <div className="analytics-header confidential">
                  <h4>
                    <FiDollarSign /> Compensation Analytics
                  </h4>
                  <p className="analytics-subtitle">
                    Salary structure and benefits analysis (HR Only)
                  </p>
                  <div className="confidential-badge">
                    <FiAlertCircle /> Confidential
                  </div>
                </div>

                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h5>Salary Distribution</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={(() => {
                          const salaries = filteredEmployees.map(
                            (e) => e.salary.totalPackage,
                          );
                          const min = Math.min(...salaries);
                          const max = Math.max(...salaries);
                          const range = max - min;
                          const binSize = range / 5;

                          return Array.from({ length: 5 }, (_, i) => ({
                            range: `${Math.round(min + i * binSize)} - ${Math.round(min + (i + 1) * binSize)}`,
                            count: filteredEmployees.filter((e) => {
                              const salary = e.salary.totalPackage;
                              return (
                                salary >= min + i * binSize &&
                                salary < min + (i + 1) * binSize
                              );
                            }).length,
                          }));
                        })()}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Average Salary by Department</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={(() => {
                          const deptSalaries = {};
                          filteredEmployees.forEach((emp) => {
                            if (!deptSalaries[emp.department]) {
                              deptSalaries[emp.department] = {
                                total: 0,
                                count: 0,
                              };
                            }
                            deptSalaries[emp.department].total +=
                              emp.salary.totalPackage || 0;
                            deptSalaries[emp.department].count += 1;
                          });

                          return Object.entries(deptSalaries)
                            .map(([dept, data]) => ({
                              department: dept,
                              average: Math.round(data.total / data.count),
                            }))
                            .sort((a, b) => b.average - a.average);
                        })()}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()}`,
                            "Average Salary",
                          ]}
                        />
                        <Bar dataKey="average" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics-card">
                    <h5>Salary Range by Position</h5>
                    <div className="salary-ranges">
                      {(() => {
                        const positionSalaries = {};
                        filteredEmployees.forEach((emp) => {
                          if (!positionSalaries[emp.jobTitle]) {
                            positionSalaries[emp.jobTitle] = [];
                          }
                          positionSalaries[emp.jobTitle].push(
                            emp.salary.totalPackage || 0,
                          );
                        });

                        return Object.entries(positionSalaries)
                          .sort((a, b) => {
                            const avgA =
                              a[1].reduce((s, v) => s + v, 0) / a[1].length;
                            const avgB =
                              b[1].reduce((s, v) => s + v, 0) / b[1].length;
                            return avgB - avgA;
                          })
                          .slice(0, 6)
                          .map(([position, salaries]) => {
                            const min = Math.min(...salaries);
                            const max = Math.max(...salaries);
                            const avg =
                              salaries.reduce((s, v) => s + v, 0) /
                              salaries.length;

                            return (
                              <div key={position} className="salary-range-item">
                                <div className="position-name">{position}</div>
                                <div className="salary-range-bar">
                                  <div className="range-line">
                                    <span className="range-min">
                                      ${Math.round(min).toLocaleString()}
                                    </span>
                                    <div className="range-track">
                                      <div
                                        className="range-avg"
                                        style={{
                                          left: `${((avg - min) / (max - min)) * 100}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="range-max">
                                      ${Math.round(max).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="salary-avg">
                                  Avg: ${Math.round(avg).toLocaleString()}
                                </div>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h5>Benefits Coverage</h5>
                    <div className="benefits-coverage">
                      <div className="benefit-coverage-item">
                        <div className="benefit-name">Health Insurance</div>
                        <div className="coverage-stats">
                          <div className="coverage-bar">
                            <div
                              className="coverage-fill"
                              style={{ width: "95%" }}
                            ></div>
                          </div>
                          <span className="coverage-percentage">95%</span>
                        </div>
                      </div>
                      <div className="benefit-coverage-item">
                        <div className="benefit-name">Provident Fund</div>
                        <div className="coverage-stats">
                          <div className="coverage-bar">
                            <div
                              className="coverage-fill"
                              style={{ width: "88%" }}
                            ></div>
                          </div>
                          <span className="coverage-percentage">88%</span>
                        </div>
                      </div>
                      <div className="benefit-coverage-item">
                        <div className="benefit-name">Performance Bonus</div>
                        <div className="coverage-stats">
                          <div className="coverage-bar">
                            <div
                              className="coverage-fill"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                          <span className="coverage-percentage">75%</span>
                        </div>
                      </div>
                      <div className="benefit-coverage-item">
                        <div className="benefit-name">Stock Options</div>
                        <div className="coverage-stats">
                          <div className="coverage-bar">
                            <div
                              className="coverage-fill"
                              style={{ width: "40%" }}
                            ></div>
                          </div>
                          <span className="coverage-percentage">40%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
}

// Helper function for rating classes
const getRatingClass = (rating) => {
  if (rating >= 4.5) return "excellent";
  if (rating >= 4) return "good";
  if (rating >= 3) return "average";
  return "poor";
};

// Employee Detail Modal Component
const EmployeeDetailModal = ({ employee, onClose }) => {
  const [activeSection, setActiveSection] = useState("personal");

  const sections = [
    { id: "personal", label: "Personal", icon: <FiUser /> },
    { id: "employment", label: "Employment", icon: <FiBriefcase /> },
    { id: "skills", label: "Skills", icon: <FiBook /> },
    { id: "performance", label: "Performance", icon: <FiAward /> },
    { id: "attendance", label: "Attendance", icon: <FiClock /> },
    { id: "compensation", label: "Compensation", icon: <FiDollarSign /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content employee-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="employee-header">
            <div className="employee-avatar-large">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="employee-header-info">
              <h2>{employee.fullName}</h2>
              <p className="employee-title">
                {employee.jobTitle} • {employee.department}
              </p>
              <div className="employee-meta">
                <span className="meta-item">
                  <FiUser /> {employee.employeeId}
                </span>
                <span className="meta-item">
                  <FiCalendar /> Joined: {employee.joiningDate}
                </span>
                <span className="meta-item">
                  <FiActivity /> {employee.status}
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Navigation Tabs */}
          <div className="section-tabs">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`section-tab ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="section-content">
            {activeSection === "personal" && (
              <div className="detail-section">
                <h4>
                  <FiUser /> A. Personal & Employment Details
                </h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Employee ID:</label>
                    <span>{employee.employeeId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{employee.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label>CNIC / National ID:</label>
                    <span className="masked">{employee.maskedCNIC}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{employee.dateOfBirth}</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender:</label>
                    <span>{employee.gender}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact Number:</label>
                    <span>{employee.contact}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{employee.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Emergency Contact:</label>
                    <span>
                      {employee.emergencyContact.name || "N/A"} -{" "}
                      {employee.emergencyContact.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "employment" && (
              <div className="detail-section">
                <h4>
                  <FiBriefcase /> B. Job & Role Details
                </h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Job Title:</label>
                    <span>{employee.jobTitle}</span>
                  </div>
                  <div className="detail-item">
                    <label>Department:</label>
                    <span className="dept-badge">{employee.department}</span>
                  </div>
                  <div className="detail-item">
                    <label>Reporting Manager:</label>
                    <span>{employee.reportingManager}</span>
                  </div>
                  <div className="detail-item">
                    <label>Shift / Work Type:</label>
                    <span>
                      {employee.shift} • {employee.workType}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{employee.location}</span>
                  </div>
                  <div className="detail-item">
                    <label>Grade / Level:</label>
                    <span>
                      {employee.grade} • {employee.level}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Joining Date:</label>
                    <span>{employee.joiningDate}</span>
                  </div>
                  <div className="detail-item">
                    <label>Employment Type:</label>
                    <span>{employee.employmentType}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contract Type:</label>
                    <span>{employee.contractType}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "skills" && (
              <div className="detail-section">
                <h4>
                  <FiBook /> C. Skills & Qualifications
                </h4>
                <div className="skills-grid">
                  <div className="skills-section">
                    <h5>Technical Skills</h5>
                    <div className="skills-list">
                      {employee.technicalSkills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="skills-section">
                    <h5>Soft Skills</h5>
                    <div className="skills-list">
                      {employee.softSkills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="skills-section">
                    <h5>Certifications</h5>
                    <div className="certifications-list">
                      {employee.certifications.map((cert, index) => (
                        <div key={index} className="certification-item">
                          <FiAward />
                          <span>
                            {cert.name} - {cert.issuer} ({cert.year})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="skills-section">
                    <h5>Education</h5>
                    <div className="education-list">
                      {employee.education.map((edu, index) => (
                        <div key={index} className="education-item">
                          <FiBook />
                          <div>
                            <strong>{edu.degree}</strong>
                            <span>
                              {edu.institution} ({edu.year})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "performance" && (
              <div className="detail-section">
                <h4>
                  <FiAward /> F. Performance Snapshot
                </h4>
                <div className="performance-grid">
                  <div className="performance-metric">
                    <label>Last Performance Rating</label>
                    <div className="performance-value">
                      <div
                        className={`rating-display ${getRatingClass(employee.performance.lastRating)}`}
                      >
                        {employee.performance.lastRating}/5
                      </div>
                      <span className="rating-date">
                        {employee.performance.lastReviewDate}
                      </span>
                    </div>
                  </div>

                  <div className="performance-metric">
                    <label>Next Review Date</label>
                    <div className="performance-value">
                      <div className="next-review">{employee.nextReview}</div>
                    </div>
                  </div>

                  <div className="performance-history">
                    <h5>Promotion History</h5>
                    <div className="history-list">
                      {employee.performance.promotions.map((promo, index) => (
                        <div key={index} className="history-item">
                          <FiTrendingUp />
                          <div>
                            <strong>{promo.title}</strong>
                            <span>
                              {promo.date} • {promo.reason}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="performance-warnings">
                    <h5>Warnings & Disciplinary Actions</h5>
                    <div className="warnings-list">
                      {employee.performance.warnings.map((warning, index) => (
                        <div key={index} className="warning-item">
                          <FiAlertCircle />
                          <div>
                            <strong>{warning.type}</strong>
                            <span>
                              {warning.date} • {warning.reason}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "attendance" && (
              <div className="detail-section">
                <h4>
                  <FiClock /> G. Attendance Snapshot
                </h4>
                <div className="attendance-grid">
                  <div className="attendance-metric">
                    <label>Attendance Rate</label>
                    <div className="attendance-value">
                      <div
                        className="progress-circle-large"
                        data-value={employee.attendance.rate}
                      >
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#10b981"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(employee.attendance.rate * 283) / 100} 283`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <span>{employee.attendance.rate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="attendance-details">
                    <div className="detail-row">
                      <label>Present Days:</label>
                      <span>{employee.attendance.presentDays}</span>
                    </div>
                    <div className="detail-row">
                      <label>Absent Days:</label>
                      <span>{employee.attendance.absentDays}</span>
                    </div>
                    <div className="detail-row">
                      <label>Late Arrivals:</label>
                      <span>{employee.attendance.lateArrivals}</span>
                    </div>
                    <div className="detail-row">
                      <label>Early Departures:</label>
                      <span>{employee.attendance.earlyDepartures}</span>
                    </div>
                    <div className="detail-row">
                      <label>Overtime Hours:</label>
                      <span>{employee.attendance.overtimeHours}</span>
                    </div>
                    <div className="detail-row">
                      <label>Compensatory Offs:</label>
                      <span>{employee.attendance.compensatoryOffs}</span>
                    </div>
                  </div>

                  <div className="leave-balance-section">
                    <h5>Leave Balance</h5>
                    <div className="leave-balance-grid">
                      <div className="leave-type">
                        <label>Casual Leave:</label>
                        <span>
                          {employee.attendance.leaveBalance.casual} days
                        </span>
                      </div>
                      <div className="leave-type">
                        <label>Sick Leave:</label>
                        <span>
                          {employee.attendance.leaveBalance.sick} days
                        </span>
                      </div>
                      <div className="leave-type">
                        <label>Annual Leave:</label>
                        <span>
                          {employee.attendance.leaveBalance.annual} days
                        </span>
                      </div>
                      <div className="leave-type">
                        <label>Used:</label>
                        <span>{employee.attendance.leavesTaken} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "compensation" && (
              <div className="detail-section confidential">
                <h4>
                  <FiDollarSign /> E. Salary & Benefits (Confidential - HR Only)
                </h4>
                <div className="confidential-notice">
                  <FiAlertCircle />
                  <p>
                    This section contains confidential compensation information.
                    Access is restricted to authorized HR personnel only.
                  </p>
                </div>

                <div className="compensation-grid">
                  <div className="compensation-item">
                    <label>Basic Salary:</label>
                    <span>
                      {employee.salary.currency}{" "}
                      {employee.salary.basic.toLocaleString()}
                    </span>
                  </div>
                  <div className="compensation-item">
                    <label>Total Package:</label>
                    <span className="total-package">
                      {employee.salary.currency}{" "}
                      {employee.salary.totalPackage.toLocaleString()}
                    </span>
                  </div>
                  <div className="compensation-item">
                    <label>Payment Mode:</label>
                    <span>{employee.salary.paymentMode}</span>
                  </div>

                  <div className="benefits-section">
                    <h5>Benefits & Allowances</h5>
                    <div className="benefits-list">
                      {employee.benefits.healthInsurance && (
                        <div className="benefit-item">
                          <FiCheckCircle />
                          <span>Health Insurance</span>
                        </div>
                      )}
                      {employee.benefits.providentFund && (
                        <div className="benefit-item">
                          <FiCheckCircle />
                          <span>Provident Fund</span>
                        </div>
                      )}
                      {employee.benefits.bonuses?.map((bonus, index) => (
                        <div key={index} className="benefit-item">
                          <FiStar />
                          <span>{bonus} Bonus</span>
                        </div>
                      ))}
                      {employee.benefits.other?.map((benefit, index) => (
                        <div key={index} className="benefit-item">
                          <FiCheckCircle />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary">
            <FiDownload /> Export Profile
          </button>
          <button className="btn-outline">
            <FiEdit /> Edit Employee
          </button>
        </div>
      </div>
    </div>
  );
};

// FiSearch icon component (add this near other imports)
const FiSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default EmployeeReport;
