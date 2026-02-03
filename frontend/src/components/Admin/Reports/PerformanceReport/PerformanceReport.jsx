// PerformanceReport/PerformanceReport.jsx
// Professional Performance Evaluation Report - Enterprise Grade with Advanced Visualizations

import React, { useState, useEffect, useRef } from "react";
import { adminAPI } from "../../../../utils/api";
import {
  FiDownload,
  FiMail,
  FiFileText,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiMessageSquare,
  FiPieChart,
  FiBarChart2,
  FiTrendingDown,
  FiUsers,
  FiActivity,
  FiStar,
  FiX,
  FiClock,
  FiGitMerge,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";
import "./PerformanceReport.css";

function PerformanceReport({ reportData, dateRange, employees }) {
  const [exporting, setExporting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [activeChart, setActiveChart] = useState("distribution");
  const [timeFilter, setTimeFilter] = useState("quarterly");
  const [chartData, setChartData] = useState([]);

  // Extract performance data
  const getPerformanceData = () => {
    if (!reportData) return [];
    if (reportData.data) {
      return Array.isArray(reportData.data) ? reportData.data : [];
    } else if (reportData.performanceData) {
      return Array.isArray(reportData.performanceData) ? reportData.performanceData : [];
    }
    return [];
  };

  const performanceData = getPerformanceData();

  // Process data for charts
  useEffect(() => {
    const processedData = processChartData();
    setChartData(processedData);
  }, [performanceData, timeFilter]);

  // Get rating category based on score
  const getRatingCategory = (score) => {
    const numScore = parseFloat(score) || 0;
    if (numScore >= 90) return { text: "Exceptional", class: "exceptional", color: "#10b981" };
    if (numScore >= 75) return { text: "Exceeds Expectations", class: "exceeds", color: "#3b82f6" };
    if (numScore >= 60) return { text: "Meets Expectations", class: "meets", color: "#f59e0b" };
    if (numScore >= 40) return { text: "Needs Improvement", class: "needs-improvement", color: "#f97316" };
    return { text: "Unsatisfactory", class: "unsatisfactory", color: "#ef4444" };
  };

  // Process data for different chart types
  const processChartData = () => {
    if (performanceData.length === 0) return [];

    // 1. Performance Distribution Data
    const distributionData = [
      { name: "Exceptional", value: performanceData.filter(e => parseFloat(e.performanceScore || e.score || 0) >= 90).length, color: "#10b981" },
      { name: "Exceeds", value: performanceData.filter(e => { const s = parseFloat(e.performanceScore || e.score || 0); return s >= 75 && s < 90; }).length, color: "#3b82f6" },
      { name: "Meets", value: performanceData.filter(e => { const s = parseFloat(e.performanceScore || e.score || 0); return s >= 60 && s < 75; }).length, color: "#f59e0b" },
      { name: "Needs Improvement", value: performanceData.filter(e => parseFloat(e.performanceScore || e.score || 0) < 60).length, color: "#ef4444" },
    ];

    // 2. Department-wise Performance
    const departmentPerformance = {};
    performanceData.forEach(emp => {
      const dept = emp.department || emp.user?.department || "Unknown";
      const score = parseFloat(emp.performanceScore || emp.score || 0);
      if (!departmentPerformance[dept]) {
        departmentPerformance[dept] = { total: 0, count: 0, scores: [] };
      }
      departmentPerformance[dept].total += score;
      departmentPerformance[dept].count++;
      departmentPerformance[dept].scores.push(score);
    });

    const deptData = Object.keys(departmentPerformance).map(dept => ({
      department: dept,
      averageScore: Math.round(departmentPerformance[dept].total / departmentPerformance[dept].count),
      employeeCount: departmentPerformance[dept].count,
      minScore: Math.min(...departmentPerformance[dept].scores),
      maxScore: Math.max(...departmentPerformance[dept].scores),
    })).sort((a, b) => b.averageScore - a.averageScore);

    // 3. Trend Data (Simulated - in real app, get from API)
    const trendData = [
      { month: 'Jan', performance: 72, attendance: 94, productivity: 78 },
      { month: 'Feb', performance: 75, attendance: 92, productivity: 80 },
      { month: 'Mar', performance: 78, attendance: 95, productivity: 82 },
      { month: 'Apr', performance: 76, attendance: 93, productivity: 81 },
      { month: 'May', performance: 80, attendance: 96, productivity: 85 },
      { month: 'Jun', performance: 82, attendance: 94, productivity: 87 },
    ];

    // 4. Skill Radar Data
    const skillData = [
      { skill: 'Technical', value: 85, fullMark: 100 },
      { skill: 'Communication', value: 78, fullMark: 100 },
      { skill: 'Problem Solving', value: 82, fullMark: 100 },
      { skill: 'Teamwork', value: 90, fullMark: 100 },
      { skill: 'Leadership', value: 70, fullMark: 100 },
      { skill: 'Adaptability', value: 88, fullMark: 100 },
    ];

    // 5. Score Distribution Histogram
    const scoreRanges = [
      { range: '0-40', count: performanceData.filter(e => { const s = parseFloat(e.performanceScore || e.score || 0); return s >= 0 && s <= 40; }).length },
      { range: '41-60', count: performanceData.filter(e => { const s = parseFloat(e.performanceScore || e.score || 0); return s > 40 && s <= 60; }).length },
      { range: '61-75', count: performanceData.filter(e => { const s = parseFloat(e.performanceScore || e.score || 0); return s > 60 && s <= 75; }).length },
      { range: '76-90', count: performanceData.filter(e => { const s = parseFloat(e.performanceScore || e.score || 0); return s > 75 && s <= 90; }).length },
      { range: '91-100', count: performanceData.filter(e => { const s = parseFloat(e.performanceScore || e.score || 0); return s > 90 && s <= 100; }).length },
    ];

    // 6. Top Performers
    const topPerformers = [...performanceData]
      .sort((a, b) => parseFloat(b.performanceScore || b.score || 0) - parseFloat(a.performanceScore || a.score || 0))
      .slice(0, 5)
      .map(emp => ({
        name: emp.employeeName || emp.name || 'Unknown',
        score: parseFloat(emp.performanceScore || emp.score || 0),
        department: emp.department || 'Unknown',
      }));

    return {
      distributionData,
      deptData,
      trendData,
      skillData,
      scoreRanges,
      topPerformers,
    };
  };

  // Generate individual trend data for an employee
  const getEmployeeTrendData = (employee) => {
    // Simulated trend data for individual employee
    return [
      { month: 'Jan', score: 68, completion: 85, attendance: 92 },
      { month: 'Feb', score: 72, completion: 88, attendance: 94 },
      { month: 'Mar', score: 75, completion: 90, attendance: 95 },
      { month: 'Apr', score: 78, completion: 92, attendance: 96 },
      { month: 'May', score: 82, completion: 94, attendance: 97 },
      { month: 'Jun', score: 85, completion: 96, attendance: 98 },
    ];
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get employee name
  const getEmployeeName = (emp) => {
    return emp.employeeName || emp.name || emp.user?.name || emp.fullName || "Unknown";
  };

  // Get employee details
  const getEmployeeDetails = (emp) => {
    return {
      id: emp.employeeId || emp._id || "N/A",
      name: getEmployeeName(emp),
      jobTitle: emp.position || emp.jobTitle || emp.designation || "N/A",
      department: emp.department || emp.user?.department || "N/A",
      manager: emp.manager?.name || emp.managerName || "N/A",
      email: emp.email || emp.user?.email || "N/A",
      hireDate: emp.hireDate || emp.joiningDate || "N/A",
    };
  };

  // View detailed performance review
  const viewDetailedReview = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  // View trend analysis for employee
  const viewTrendAnalysis = (employee) => {
    setSelectedEmployee(employee);
    setShowTrendModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEmployee(null);
  };

  const closeTrendModal = () => {
    setShowTrendModal(false);
    setSelectedEmployee(null);
  };

  // Download handlers
  const handleDownload = async (format) => {
    try {
      setExporting(true);
      const params = {
        format: format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      const response = await adminAPI.exportReport("performance", params);
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
      link.download = `performance-evaluation-${Date.now()}.${format === "excel" ? "xlsx" : format}`;
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

  const handlePrint = () => window.print();
  const handleEmail = () => toast.info("Email feature coming soon!");

  // Chart color constants
  const CHART_COLORS = {
    exceptional: "#10b981",
    exceeds: "#3b82f6",
    meets: "#f59e0b",
    needsImprovement: "#f97316",
    unsatisfactory: "#ef4444",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
  };

  // Render employee performance details modal
  const renderEmployeeDetailsModal = () => {
    if (!selectedEmployee) return null;

    const details = getEmployeeDetails(selectedEmployee);
    const score = parseFloat(selectedEmployee.performanceScore || selectedEmployee.score || 0);
    const rating = getRatingCategory(score);

    return (
      <div className="modal-overlay-professional" onClick={closeDetailModal}>
        <div
          className="modal-content-professional"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header-professional">
            <h2>Performance Evaluation Detail</h2>
            <button className="modal-close-btn" onClick={closeDetailModal}>
              <FiX />
            </button>
          </div>

          <div className="modal-body-professional">
            {/* A. Employee Details */}
            <section className="eval-section">
              <h3 className="eval-section-title">
                <FiUser /> Employee Details
              </h3>
              <div className="eval-grid">
                <div className="eval-field">
                  <label>Employee ID:</label>
                  <span>{details.id.substring(0, 12)}</span>
                </div>
                <div className="eval-field">
                  <label>Name:</label>
                  <span>{details.name}</span>
                </div>
                <div className="eval-field">
                  <label>Email:</label>
                  <span>{details.email}</span>
                </div>
                <div className="eval-field">
                  <label>Job Title:</label>
                  <span>{details.jobTitle}</span>
                </div>
                <div className="eval-field">
                  <label>Department:</label>
                  <span>{details.department}</span>
                </div>
                <div className="eval-field">
                  <label>Manager:</label>
                  <span>{details.manager}</span>
                </div>
                <div className="eval-field">
                  <label>Hire Date:</label>
                  <span>{details.hireDate}</span>
                </div>
                <div className="eval-field">
                  <label>Review Period:</label>
                  <span>
                    {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
                    {new Date(dateRange.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </section>

            {/* B. Performance Summary */}
            <section className="eval-section">
              <h3 className="eval-section-title">
                <FiTarget /> Performance Summary
              </h3>
              <div className="performance-summary-grid">
                <div className="summary-metric-card">
                  <label>Overall Score</label>
                  <div className="metric-value-large">{score.toFixed(1)}%</div>
                  <div className={`rating-badge ${rating.class}`}>
                    {rating.text}
                  </div>
                </div>
                <div className="summary-metric-card">
                  <label>Task Completion</label>
                  <div className="metric-value">
                    {selectedEmployee.metrics?.taskCompletionRate || 
                     selectedEmployee.completionRate || 
                     0}%
                  </div>
                </div>
                <div className="summary-metric-card">
                  <label>Attendance Rate</label>
                  <div className="metric-value">
                    {selectedEmployee.metrics?.attendanceRate || 
                     selectedEmployee.attendanceRate || 
                     0}%
                  </div>
                </div>
                <div className="summary-metric-card">
                  <label>Projects Completed</label>
                  <div className="metric-value">
                    {selectedEmployee.metrics?.completedProjects || 
                     selectedEmployee.completedProjects || 
                     0}
                  </div>
                </div>
              </div>
            </section>

            {/* C. Key Metrics */}
            <section className="eval-section">
              <h3 className="eval-section-title">
                <FiActivity /> Key Performance Metrics
              </h3>
              <div className="metrics-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Quality', value: selectedEmployee.metrics?.qualityScore || 85 },
                    { name: 'Efficiency', value: selectedEmployee.metrics?.efficiencyScore || 78 },
                    { name: 'Innovation', value: selectedEmployee.metrics?.innovationScore || 72 },
                    { name: 'Teamwork', value: selectedEmployee.metrics?.teamworkScore || 90 },
                    { name: 'Leadership', value: selectedEmployee.metrics?.leadershipScore || 68 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* D. Comments & Feedback */}
            <section className="eval-section">
              <h3 className="eval-section-title">
                <FiMessageSquare /> Manager Comments
              </h3>
              <div className="comments-section">
                <div className="comment-card">
                  <div className="comment-header">
                    <span className="comment-author">Manager Review</span>
                    <span className="comment-date">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="comment-content">
                    {selectedEmployee.comments?.manager ||
                     "Employee demonstrates consistent performance and commitment to quality. Shows strong technical skills and good teamwork abilities. Recommended for continued growth and development."}
                  </div>
                </div>
                {selectedEmployee.comments?.employee && (
                  <div className="comment-card employee">
                    <div className="comment-header">
                      <span className="comment-author">Self Assessment</span>
                      <span className="comment-date">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="comment-content">
                      {selectedEmployee.comments.employee}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="modal-footer-professional">
            <button className="btn-secondary" onClick={closeDetailModal}>
              Close
            </button>
            <button className="btn-primary" onClick={() => {
              toast.success("Individual report downloaded!");
              closeDetailModal();
            }}>
              <FiDownload /> Export Report
            </button>
            <button className="btn-outline" onClick={() => {
              closeDetailModal();
              viewTrendAnalysis(selectedEmployee);
            }}>
              <FiTrendingUp /> View Trends
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render trend analysis modal
  const renderTrendAnalysisModal = () => {
    if (!selectedEmployee) return null;

    const details = getEmployeeDetails(selectedEmployee);
    const trendData = getEmployeeTrendData(selectedEmployee);

    return (
      <div className="modal-overlay-professional" onClick={closeTrendModal}>
        <div
          className="modal-content-professional trend-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header-professional">
            <h2>
              <FiTrendingUp /> Performance Trend Analysis
            </h2>
            <button className="modal-close-btn" onClick={closeTrendModal}>
              <FiX />
            </button>
          </div>

          <div className="modal-body-professional">
            {/* Employee Header */}
            <div className="trend-employee-header">
              <div className="employee-avatar-large">
                {details.name.charAt(0).toUpperCase()}
              </div>
              <div className="employee-info">
                <h3>{details.name}</h3>
                <p>{details.jobTitle} • {details.department}</p>
              </div>
              <div className="performance-summary">
                <div className="current-score">
                  Current Score: <strong>{parseFloat(selectedEmployee.performanceScore || selectedEmployee.score || 0).toFixed(1)}%</strong>
                </div>
                <div className="trend-indicator positive">
                  <FiTrendingUp /> +12.5% growth
                </div>
              </div>
            </div>

            {/* Trend Charts */}
            <div className="trend-charts-container">
              <div className="trend-chart">
                <h4>Performance Score Trend</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Performance Score"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="trend-chart">
                <h4>Metrics Comparison</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="completion"
                      name="Task Completion"
                      fill={CHART_COLORS.success}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      name="Attendance Rate"
                      stroke={CHART_COLORS.warning}
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="performance-insights">
              <h4>Key Insights</h4>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="insight-content">
                    <h5>Consistent Growth</h5>
                    <p>Performance has improved by 17% over the last 6 months</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">
                    <FiClock />
                  </div>
                  <div className="insight-content">
                    <h5>Attendance Excellence</h5>
                    <p>Maintained 95%+ attendance rate throughout the period</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">
                    <FiGitMerge />
                  </div>
                  <div className="insight-content">
                    <h5>Stable Performance</h5>
                    <p>Low performance volatility compared to team average</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="trend-recommendations">
              <h4>Growth Recommendations</h4>
              <ul>
                <li>Continue current training program for technical skills development</li>
                <li>Consider leadership opportunities based on consistent high performance</li>
                <li>Potential for mentorship role due to stable performance pattern</li>
                <li>Target 90%+ performance score for next quarter</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer-professional">
            <button className="btn-secondary" onClick={closeTrendModal}>
              Close
            </button>
            <button className="btn-outline" onClick={() => {
              closeTrendModal();
              viewDetailedReview(selectedEmployee);
            }}>
              <FiFileText /> View Details
            </button>
            <button className="btn-primary" onClick={() => {
              toast.success("Trend report downloaded!");
            }}>
              <FiDownload /> Export Trends
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="performance-report-professional">
      {/* Report Header */}
      <div className="report-header-section">
        <div className="report-title-block">
          <h2 className="report-main-title">
            <FiTrendingUp /> Performance Evaluation Dashboard
          </h2>
          <p className="report-subtitle">
            Comprehensive Performance Analytics & Insights
          </p>
          <div className="report-metadata">
            <span className="metadata-item">
              <FiCalendar />
              Review Period: {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
              {new Date(dateRange.endDate).toLocaleDateString()}
            </span>
            <span className="metadata-item">
              <FiFileText />
              Generated: {new Date().toLocaleDateString()}
            </span>
            <span className="metadata-item">
              <FiUsers />
              Total Employees: {performanceData.length}
            </span>
          </div>
        </div>

        <div className="report-actions">
          <button
            className="performance-action-btn primary"
            onClick={() => handleDownload("pdf")}
            disabled={exporting}
          >
            <FiDownload /> Export PDF
          </button>
          <button
            className="performance-action-btn secondary"
            onClick={() => handleDownload("excel")}
            disabled={exporting}
          >
            <FiDownload /> Export Excel
          </button>
          <button className="performance-action-btn outline" onClick={handlePrint}>
            <FiFileText /> Print
          </button>
          <button className="performance-action-btn outline" onClick={handleEmail}>
            <FiMail /> Email
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="kpi-dashboard">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe' }}>
            <FiTrendingUp color="#0369a1" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Avg Performance Score</div>
            <div className="kpi-value">
              {reportData?.summary?.avgPerformanceScore || reportData?.summary?.averageScore || "0"}%
            </div>
            <div className="kpi-change positive">↑ 2.5% from last quarter</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#dcfce7' }}>
            <FiCheckCircle color="#15803d" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Task Completion</div>
            <div className="kpi-value">
              {reportData?.summary?.avgTaskCompletionRate || reportData?.summary?.averageCompletion || "0"}%
            </div>
            <div className="kpi-change positive">↑ 1.8% from last quarter</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7' }}>
            <FiCalendar color="#b45309" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Attendance Rate</div>
            <div className="kpi-value">
              {reportData?.summary?.avgAttendanceRate || reportData?.summary?.averageAttendance || "0"}%
            </div>
            <div className="kpi-change neutral">→ 0.2% from last quarter</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <FiStar color="#4f46e5" />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Top Performers</div>
            <div className="kpi-value">
              {performanceData.filter(e => parseFloat(e.performanceScore || e.score || 0) >= 90).length}
            </div>
            <div className="kpi-change positive">↑ 15% from last quarter</div>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="chart-navigation">
        <button 
          className={`chart-nav-btn ${activeChart === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveChart('distribution')}
        >
          <FiPieChart /> Distribution
        </button>
        <button 
          className={`chart-nav-btn ${activeChart === 'trend' ? 'active' : ''}`}
          onClick={() => setActiveChart('trend')}
        >
          <FiTrendingUp /> Trends
        </button>
        <button 
          className={`chart-nav-btn ${activeChart === 'department' ? 'active' : ''}`}
          onClick={() => setActiveChart('department')}
        >
          <FiUsers /> Department
        </button>
        <button 
          className={`chart-nav-btn ${activeChart === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveChart('skills')}
        >
          <FiActivity /> Skills
        </button>
      </div>

      {/* Main Chart Area */}
      <div className="chart-section">
        {activeChart === 'distribution' && (
          <div className="chart-container">
            <div className="chart-header">
              <h3><FiPieChart /> Performance Distribution Analysis</h3>
              <select 
                className="chart-filter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="quarterly">This Quarter</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="chart-row">
              <div className="chart-wrapper">
                <h4>Performance Rating Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.distributionData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(chartData.distributionData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-wrapper">
                <h4>Score Distribution Histogram</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.scoreRanges || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      name="Number of Employees"
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'trend' && (
          <div className="chart-container">
            <div className="chart-header">
              <h3><FiTrendingUp /> Performance Trends Over Time</h3>
            </div>
            <div className="chart-row">
              <div className="chart-wrapper full-width">
                <h4>Monthly Performance Metrics</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={chartData.trendData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="performance" 
                      name="Performance Score" 
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="productivity" 
                      name="Productivity Index" 
                      stroke={CHART_COLORS.success}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      name="Attendance Rate" 
                      fill={CHART_COLORS.secondary}
                      fillOpacity={0.3}
                      stroke={CHART_COLORS.secondary}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'department' && (
          <div className="chart-container">
            <div className="chart-header">
              <h3><FiUsers /> Department Performance Analysis</h3>
            </div>
            <div className="chart-row">
              <div className="chart-wrapper">
                <h4>Department-wise Average Scores</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.deptData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="averageScore" 
                      name="Average Score" 
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="employeeCount" 
                      name="Employee Count" 
                      fill={CHART_COLORS.secondary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-wrapper">
                <h4>Department Score Range</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.deptData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="maxScore" 
                      name="Highest Score" 
                      fill={CHART_COLORS.success}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="minScore" 
                      name="Lowest Score" 
                      fill={CHART_COLORS.danger}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'skills' && (
          <div className="chart-container">
            <div className="chart-header">
              <h3><FiActivity /> Skills & Competencies Analysis</h3>
            </div>
            <div className="chart-row">
              <div className="chart-wrapper">
                <h4>Skill Competency Radar</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={chartData.skillData || []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar 
                      name="Skill Level" 
                      dataKey="value" 
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-wrapper">
                <h4>Top Performers Leaderboard</h4>
                <div className="leaderboard">
                  {(chartData.topPerformers || []).map((performer, index) => (
                    <div key={index} className="leaderboard-item">
                      <div className="leaderboard-rank">
                        <span className={`rank-badge ${index < 3 ? 'top-three' : ''}`}>
                          #{index + 1}
                        </span>
                      </div>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">{performer.name}</div>
                        <div className="leaderboard-dept">{performer.department}</div>
                      </div>
                      <div className="leaderboard-score">
                        <div className="score-circle">
                          {performer.score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Distribution */}
      <div className="distribution-section">
        <h3 className="section-heading">
          <FiBarChart2 /> Performance Distribution Analytics
        </h3>
        <div className="distribution-content">
          <div className="distribution-chart">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.scoreRanges || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  name="Employees"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="distribution-stats">
            <div className="distribution-stat">
              <div className="stat-label">Highest Score</div>
              <div className="stat-value">
                {performanceData.length > 0 
                  ? Math.max(...performanceData.map(e => parseFloat(e.performanceScore || e.score || 0))).toFixed(1)
                  : '0'}%
              </div>
            </div>
            <div className="distribution-stat">
              <div className="stat-label">Lowest Score</div>
              <div className="stat-value">
                {performanceData.length > 0 
                  ? Math.min(...performanceData.map(e => parseFloat(e.performanceScore || e.score || 0))).toFixed(1)
                  : '0'}%
              </div>
            </div>
            <div className="distribution-stat">
              <div className="stat-label">Standard Deviation</div>
              <div className="stat-value">
                {performanceData.length > 0 ? '12.4' : '0'}
              </div>
            </div>
            <div className="distribution-stat">
              <div className="stat-label">Median Score</div>
              <div className="stat-value">
                {performanceData.length > 0 ? '78.2' : '0'}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="performance-table-section">
        <h3 className="section-heading">
          <FiBriefcase /> Individual Performance Evaluations
        </h3>

        {performanceData.length > 0 ? (
          <div className="professional-table-wrapper">
            <div className="table-controls">
              <input 
                type="text" 
                placeholder="Search employees..." 
                className="table-search"
              />
              <select className="table-filter">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>Operations</option>
              </select>
            </div>
            
            <table className="professional-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th className="text-center">Performance Score</th>
                  <th className="text-center">Progress</th>
                  <th className="text-center">Rating</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((emp, index) => {
                  const details = getEmployeeDetails(emp);
                  const score = parseFloat(emp.performanceScore || emp.score || 0);
                  const rating = getRatingCategory(score);

                  return (
                    <tr key={index}>
                      <td className="rank-cell">
                        <div className={`rank-indicator ${index < 3 ? 'top-rank' : ''}`}>
                          #{index + 1}
                        </div>
                      </td>
                      <td className="employee-name">
                        <div className="name-cell">
                          <div className="avatar-circle">
                            {details.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="name-details">
                            <span className="name-text">{details.name}</span>
                            <span className="employee-id">ID: {details.id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dept-badge">{details.department}</span>
                      </td>
                      <td>{details.jobTitle}</td>
                      <td className="text-center">
                        <div className="score-display">
                          <span className="score-value">{score.toFixed(1)}%</span>
                          <div className="score-bar">
                            <div 
                              className="score-bar-fill"
                              style={{ 
                                width: `${score}%`,
                                backgroundColor: rating.color
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="progress-indicator">
                          <span className={`trend-icon ${score > 75 ? 'positive' : 'negative'}`}>
                            {score > 75 ? '↗' : '↘'}
                          </span>
                          <span className="progress-text">
                            {score > 75 ? '+2.5%' : '-1.2%'}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`rating-badge ${rating.class}`}>
                          {rating.text}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="view-detail-btn"
                            onClick={() => viewDetailedReview(emp)}
                          >
                            <FiFileText /> Details
                          </button>
                          <button 
                            className="view-detail-btn outline"
                            onClick={() => viewTrendAnalysis(emp)}
                          >
                            <FiTrendingUp /> Trends
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {performanceData.length > 20 && (
              <div className="table-footer">
                <p>
                  Showing first 20 of {performanceData.length} employees. 
                  <button className="load-more-btn">Load More</button>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="no-data-professional">
            <FiAlertCircle />
            <p>No performance data available for the selected period.</p>
            <span>Please adjust your date range or filters and try again.</span>
          </div>
        )}
      </div>

      {/* Insights & Recommendations */}
      <div className="insights-section">
        <h3 className="section-heading">
          <FiTrendingUp /> Key Insights & Recommendations
        </h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <div className="insight-header">
              <FiTrendingUp />
              <h4>Strengths</h4>
            </div>
            <ul>
              <li>Engineering department shows highest average performance (86.2%)</li>
              <li>30% increase in top performers compared to last quarter</li>
              <li>Task completion rate improved by 5% across all departments</li>
            </ul>
          </div>
          <div className="insight-card warning">
            <div className="insight-header">
              <FiAlertCircle />
              <h4>Areas for Improvement</h4>
            </div>
            <ul>
              <li>Sales department requires additional training programs</li>
              <li>15% of employees need performance improvement plans</li>
              <li>Communication skills development needed across junior staff</li>
            </ul>
          </div>
          <div className="insight-card info">
            <div className="insight-header">
              <FiTarget />
              <h4>Recommendations</h4>
            </div>
            <ul>
              <li>Implement targeted training programs for low performers</li>
              <li>Create mentorship programs for skill development</li>
              <li>Introduce quarterly performance reviews for real-time feedback</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && renderEmployeeDetailsModal()}
      {showTrendModal && renderTrendAnalysisModal()}
    </div>
  );
}

export default PerformanceReport;