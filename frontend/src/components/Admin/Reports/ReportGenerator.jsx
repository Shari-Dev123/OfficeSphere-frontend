import React, { useState, useEffect } from "react";
import { adminAPI } from "../../../utils/api";
import {
  FiBarChart2,
  FiFilter,
  FiFileText,
  FiClock,
  FiUsers,
  FiActivity,
  FiTrendingUp,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import { MdAssignment } from "react-icons/md";
import { toast } from "react-toastify";
import PerformanceReport from "./PerformanceReport/PerformanceReport";
import AttendanceReport from "./AttendanceReport/AttendanceReport";
import ProductivityReport from "./ProductivityReport/ProductivityReport";
import EmployeeReport from "./EmployeeReport/EmployeeReport";
import DailyReport from "./DailyReport/DailyReport";
import "./ReportGenerator.css";

function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("performance");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = useState({
    employeeId: "",
    department: "",
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments] = useState([
    "Development",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
  ]);

  const reportTypes = [
    {
      id: "performance",
      name: "Performance Report",
      description: "Employee performance and productivity metrics",
      icon: <FiTrendingUp />,
      color: "primary",
    },
    {
      id: "attendance",
      name: "Attendance Report",
      description: "Employee attendance and punctuality statistics",
      icon: <FiClock />,
      color: "success",
    },
    {
      id: "productivity",
      name: "Productivity Report",
      description: "Task completion and project progress",
      icon: <FiActivity />,
      color: "warning",
    },
    {
      id: "employee",
      name: "Employee Report",
      description: "Comprehensive employee data and insights",
      icon: <FiUsers />,
      color: "info",
    },
    {
      id: "daily",
      name: "Daily Reports",
      description: "Employee daily work reports and submissions",
      icon: <MdAssignment />,
      color: "secondary",
    },
  ];

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await adminAPI.getEmployees();
      if (response.data?.data) {
        setEmployees(response.data.data);
      } else if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else if (response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      setLoading(true);

      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      if (filters.employeeId && filters.employeeId.trim() !== "") {
        params.employeeId = filters.employeeId;
      }

      if (filters.department && filters.department.trim() !== "") {
        params.department = filters.department;
      }

      let response;

      switch (reportType) {
        case "performance":
          response = await adminAPI.getPerformanceReport(params);
          break;
        case "attendance":
          response = await adminAPI.getAttendanceReport(params);
          break;
        case "productivity":
          response = await adminAPI.getProductivityReport(params);
          break;
        case "employee":
          response = await adminAPI.getEmployeeReport(params);
          break;
        case "daily":
          // ✅ NEW: Call getDailyReports API
          response = await adminAPI.getDailyReports(params);
          break;
        default:
          response = await adminAPI.generateReport({
            reportType,
            ...params,
            filters: {
              ...(filters.employeeId && { employeeId: filters.employeeId }),
              ...(filters.department && { department: filters.department }),
            },
          });
      }

      const reportData = response.data || response;

      if (!reportData) {
        toast.error("No data returned from server");
        return;
      }

      console.log(`📊 ${reportType} Report Data:`, reportData);
      setGeneratedReport(reportData);
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (type) => {
    if (reportType !== type) {
      setGeneratedReport(null);
    }
    setReportType(type);
  };

  const resetFilters = () => {
    setFilters({
      employeeId: "",
      department: "",
    });
  };

  const selectedReport = reportTypes.find((r) => r.id === reportType);

  return (
    <div className="report-generator">
      <div className="page-header">
        <div>
          <h1>
            <FiBarChart2 /> Report Generator
          </h1>
          <p>Generate comprehensive reports with advanced analytics</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      <div className="report-container">
        {/* Report Type Selection */}
        <div className="report-section">
          <h3 className="section-title">
            <FiFileText /> Select Report Type
          </h3>
          <div className="report-types-grid">
            {reportTypes.map((type) => (
              <div
                key={type.id}
                className={`report-type-card ${reportType === type.id ? "active" : ""} ${type.color}`}
                onClick={() => handleReportTypeChange(type.id)}
              >
                <div className={`report-icon ${type.color}`}>{type.icon}</div>
                <h4>{type.name}</h4>
                <p>{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="report-section">
          <h3 className="section-title">
            <FiCalendar /> Select Date Range
          </h3>
          <div className="date-range-container">
            <div className="date-input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                max={dateRange.endDate}
              />
            </div>
            <div className="date-separator">to</div>
            <div className="date-input-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                min={dateRange.startDate}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="quick-ranges">
            <button
              className="quick-range-btn"
              onClick={() => {
                const endDate = new Date();
                const startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 7);
                setDateRange({
                  startDate: startDate.toISOString().split("T")[0],
                  endDate: endDate.toISOString().split("T")[0],
                });
              }}
            >
              Last 7 Days
            </button>
            <button
              className="quick-range-btn"
              onClick={() => {
                const endDate = new Date();
                const startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 30);
                setDateRange({
                  startDate: startDate.toISOString().split("T")[0],
                  endDate: endDate.toISOString().split("T")[0],
                });
              }}
            >
              Last 30 Days
            </button>
            <button
              className="quick-range-btn"
              onClick={() => {
                const endDate = new Date();
                const startDate = new Date(endDate);
                startDate.setMonth(startDate.getMonth() - 3);
                setDateRange({
                  startDate: startDate.toISOString().split("T")[0],
                  endDate: endDate.toISOString().split("T")[0],
                });
              }}
            >
              Last 3 Months
            </button>
            <button
              className="quick-range-btn"
              onClick={() => {
                const endDate = new Date();
                const startDate = new Date(endDate.getFullYear(), 0, 1);
                setDateRange({
                  startDate: startDate.toISOString().split("T")[0],
                  endDate: endDate.toISOString().split("T")[0],
                });
              }}
            >
              This Year
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="report-section filters-section">
            <h3 className="section-title">
              <FiFilter /> Advanced Filters
            </h3>
            <div className="filters-grid">
              {/* ✅ UPDATED: Include daily in filter conditions */}
              {(reportType === "performance" ||
                reportType === "attendance" ||
                reportType === "employee" ||
                reportType === "daily") && (
                <div className="filter-group">
                  <label>Employee</label>
                  <select
                    value={filters.employeeId}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        employeeId: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.userId?.name || emp.name || "Unknown"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(reportType === "performance" ||
                reportType === "attendance" ||
                reportType === "employee" ||
                reportType === "daily") && (
                <div className="filter-group">
                  <label>Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={resetFilters}
                >
                  <FiRefreshCw /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="generate-section">
          <button
            className="btn btn-primary btn-large"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Generating Report...
              </>
            ) : (
              <>
                <FiFileText />
                Generate {selectedReport?.name}
              </>
            )}
          </button>
        </div>

        {/* ✅ UPDATED: Render Specific Report Component */}
        {generatedReport && (
          <>
            {reportType === "performance" && (
              <PerformanceReport
                reportData={generatedReport}
                dateRange={dateRange}
                employees={employees}
              />
            )}
            {reportType === "attendance" && (
              <AttendanceReport
                reportData={generatedReport}
                dateRange={dateRange}
                employees={employees}
              />
            )}
            {reportType === "productivity" && (
              <ProductivityReport
                reportData={generatedReport}
                dateRange={dateRange}
                employees={employees}
              />
            )}
            {reportType === "employee" && (
              <EmployeeReport
                reportData={generatedReport}
                dateRange={dateRange}
                employees={employees}
              />
            )}
            {reportType === "daily" && (
              <DailyReport
                reportData={generatedReport}
                dateRange={dateRange}
                employees={employees}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ReportGenerator;