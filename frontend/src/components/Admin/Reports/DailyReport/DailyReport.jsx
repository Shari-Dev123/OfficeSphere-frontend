// DailyReport/DailyReport.jsx
import React, { useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiFileText,
  FiMail,
} from 'react-icons/fi';
import { MdAssignment } from 'react-icons/md';
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
} from 'recharts';
import { toast } from 'react-toastify';
import './DailyReport.css';

function DailyReport({ reportData, dateRange, employees }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Extract reports from API response
  const reports = reportData?.data || reportData?.reports || [];

  // Calculate statistics
  const calculateStats = () => {
    const total = reports.length;
    const submitted = reports.filter((r) => r.status === 'Submitted').length;
    const reviewed = reports.filter(
      (r) => r.status === 'Reviewed' || r.status === 'Approved'
    ).length;

    const totalHours = reports.reduce(
      (sum, r) => sum + (r.totalHoursWorked || 0),
      0
    );
    const avgHoursWorked = total > 0 ? (totalHours / total).toFixed(2) : '0';

    return {
      total,
      submitted,
      reviewed,
      avgHoursWorked,
    };
  };

  const stats = calculateStats();

  // Get employee name from report
  const getEmployeeName = (report) => {
    return (
      report.employee?.name ||
      report.employee?.userId?.name ||
      report.employeeName ||
      'Unknown Employee'
    );
  };

  // Get employee department
  const getEmployeeDepartment = (report) => {
    return (
      report.employee?.department ||
      report.employee?.userId?.department ||
      report.department ||
      'N/A'
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Reviewed':
        return 'info';
      case 'Submitted':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Prepare chart data - Average hours per employee
  const getChartData = () => {
    const employeeHours = {};

    reports.forEach((report) => {
      const name = getEmployeeName(report);
      const hours = report.totalHoursWorked || 0;

      if (!employeeHours[name]) {
        employeeHours[name] = {
          name: name.split(' ')[0] || name,
          totalHours: 0,
          count: 0,
        };
      }

      employeeHours[name].totalHours += hours;
      employeeHours[name].count += 1;
    });

    return Object.values(employeeHours)
      .map((emp) => ({
        name: emp.name,
        avgHours: parseFloat((emp.totalHours / emp.count).toFixed(2)),
        reports: emp.count,
      }))
      .slice(0, 10);
  };

  // Prepare pie chart data - Status distribution
  const getPieChartData = () => {
    const statusCounts = {
      Submitted: 0,
      Reviewed: 0,
      Approved: 0,
    };

    reports.forEach((report) => {
      const status = report.status || 'Submitted';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const chartData = getChartData();
  const pieData = getPieChartData();

  // View report details
  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  // Download handler
  const handleDownload = (format) => {
    toast.info(`${format.toUpperCase()} export coming soon!`);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Email handler
  const handleEmail = () => {
    toast.info('Email feature coming soon!');
  };
  

  return (
    <div className="daily-report-results">
      <div className="report-results-header">
        <h3 className="section-title">
          <FiEye /> Daily Report Results
        </h3>
        <div className="download-buttons">
          <button
            className="btn btn-icon"
            onClick={() => handleDownload('pdf')}
          >
            <FiDownload /> PDF
          </button>
          <button
            className="btn btn-icon"
            onClick={() => handleDownload('excel')}
          >
            <FiDownload /> Excel
          </button>
          <button
            className="btn btn-icon"
            onClick={() => handleDownload('csv')}
          >
            <FiDownload /> CSV
          </button>
          <button className="btn btn-icon" onClick={handlePrint}>
            <FiFileText /> Print
          </button>
          <button className="btn btn-icon" onClick={handleEmail}>
            <FiMail /> Email
          </button>
        </div>
      </div>

      <div className="report-preview">
        {/* Report Header */}
        <div className="preview-header">
          <div className="preview-info">
            <h4>Daily Reports</h4>
            <p className="report-period">
              <FiCalendar />
              {new Date(dateRange.startDate).toLocaleDateString()} -{' '}
              {new Date(dateRange.endDate).toLocaleDateString()}
            </p>
            <p className="report-generated">
              Generated: {new Date().toLocaleString()}
            </p>
            <p className="report-record-count">Records: {reports.length}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card primary">
            <div className="card-icon">
              <MdAssignment />
            </div>
            <div className="card-content">
              <h5>Total Reports</h5>
              <p className="card-value">{stats.total}</p>
            </div>
          </div>

          <div className="summary-card warning">
            <div className="card-icon">
              <FiAlertCircle />
            </div>
            <div className="card-content">
              <h5>Pending Review</h5>
              <p className="card-value">{stats.submitted}</p>
            </div>
          </div>

          <div className="summary-card success">
            <div className="card-icon">
              <FiCheckCircle />
            </div>
            <div className="card-content">
              <h5>Reviewed/Approved</h5>
              <p className="card-value">{stats.reviewed}</p>
            </div>
          </div>

          <div className="summary-card info">
            <div className="card-icon">
              <FiClock />
            </div>
            <div className="card-content">
              <h5>Avg Hours/Day</h5>
              <p className="card-value">{stats.avgHoursWorked}h</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {(chartData.length > 0 || pieData.length > 0) && (
          <div className="charts-section">
            <div className="charts-grid">
              {/* Bar Chart */}
              {chartData.length > 0 && (
                <div className="chart-container">
                  <h5 className="chart-title">
                    Average Hours Worked per Employee
                  </h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="avgHours"
                        fill="#0088FE"
                        name="Avg Hours/Day"
                      />
                      <Bar
                        dataKey="reports"
                        fill="#00C49F"
                        name="Total Reports"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pie Chart */}
              {pieData.length > 0 && (
                <div className="chart-container">
                  <h5 className="chart-title">Report Status Distribution</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="insights-section">
          <h5 className="section-subtitle">
            <FiAlertCircle /> Key Insights
          </h5>
          <div className="insights-list">
            {parseFloat(stats.avgHoursWorked) < 6 && (
              <div className="insight-item">
                <span className="insight-icon">💡</span>
                <p>
                  Average work hours ({stats.avgHoursWorked}h) is below
                  standard (8h)
                </p>
              </div>
            )}
            {parseFloat(stats.avgHoursWorked) > 10 && (
              <div className="insight-item">
                <span className="insight-icon">⚠️</span>
                <p>
                  Average work hours ({stats.avgHoursWorked}h) indicates
                  possible overwork
                </p>
              </div>
            )}
            {stats.submitted > 0 && (
              <div className="insight-item">
                <span className="insight-icon">📋</span>
                <p>{stats.submitted} report(s) are pending review</p>
              </div>
            )}
            {reports.filter((r) => r.challenges).length > 0 && (
              <div className="insight-item">
                <span className="insight-icon">🚧</span>
                <p>
                  {reports.filter((r) => r.challenges).length} report(s) mention
                  challenges or blockers
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        {reports.length > 0 && (
          <div className="data-table-section">
            <h5 className="section-subtitle">
              <FiFileText /> Detailed Reports ({reports.length} records)
            </h5>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Achievements</th>
                    <th>Challenges</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 20).map((report, index) => (
                    <tr key={index}>
                      <td>{getEmployeeName(report)}</td>
                      <td>{getEmployeeDepartment(report)}</td>
                      <td>{formatDate(report.date)}</td>
                      <td>{report.totalHoursWorked || 0}h</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusColor(report.status)}`}
                        >
                          {report.status || 'Submitted'}
                        </span>
                      </td>
                      <td>
                        {report.achievements
                          ? report.achievements.substring(0, 50) +
                            (report.achievements.length > 50 ? '...' : '')
                          : 'None'}
                      </td>
                      <td>
                        {report.challenges ? (
                          <span className="badge-danger">Yes</span>
                        ) : (
                          <span className="badge-success">No</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => viewReportDetails(report)}
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reports.length > 20 && (
              <div className="show-more">
                <p>
                  Showing first 20 of {reports.length} records. Download full
                  report for complete data.
                </p>
              </div>
            )}
          </div>
        )}

        {reports.length === 0 && (
          <div className="no-data">
            <p>
              No daily reports available for the selected criteria. Try
              different filters or date range.
            </p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Daily Report Details</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Employee & Date Info */}
              <div className="report-info-section">
                <div className="info-row">
                  <div className="info-item">
                    <label>Employee:</label>
                    <span>{getEmployeeName(selectedReport)}</span>
                  </div>
                  <div className="info-item">
                    <label>Department:</label>
                    <span>{getEmployeeDepartment(selectedReport)}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedReport.date)}</span>
                  </div>
                  <div className="info-item">
                    <label>Hours Worked:</label>
                    <span>{selectedReport.totalHoursWorked || 0} hours</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <label>Submitted At:</label>
                    <span>{formatDate(selectedReport.submittedAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span
                      className={`status-badge ${getStatusColor(selectedReport.status)}`}
                    >
                      {selectedReport.status || 'Submitted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="detail-section">
                <h3>
                  <MdAssignment /> Tasks Accomplished
                </h3>
                <div className="detail-content">
                  {selectedReport.achievements || 'No achievements reported'}
                </div>
              </div>

              {/* Challenges */}
              {selectedReport.challenges && (
                <div className="detail-section">
                  <h3>
                    <FiAlertCircle /> Challenges/Blockers
                  </h3>
                  <div className="detail-content challenges">
                    {selectedReport.challenges}
                  </div>
                </div>
              )}

              {/* Tomorrow's Plan */}
              {selectedReport.plannedForTomorrow &&
                selectedReport.plannedForTomorrow.length > 0 && (
                  <div className="detail-section">
                    <h3>
                      <FiCalendar /> Planned for Tomorrow
                    </h3>
                    <div className="detail-content">
                      <ul>
                        {selectedReport.plannedForTomorrow.map(
                          (plan, index) => (
                            <li key={index}>{plan.description}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Suggestions */}
              {selectedReport.suggestions && (
                <div className="detail-section">
                  <h3>
                    <FiAlertCircle /> Suggestions/Notes
                  </h3>
                  <div className="detail-content">
                    {selectedReport.suggestions}
                  </div>
                </div>
              )}

              {/* Tasks Details */}
              {selectedReport.tasksCompleted &&
                selectedReport.tasksCompleted.length > 0 && (
                  <div className="detail-section">
                    <h3>
                      <FiCheckCircle /> Completed Tasks
                    </h3>
                    <div className="tasks-list">
                      {selectedReport.tasksCompleted.map((task, index) => (
                        <div key={index} className="task-item">
                          <span className="task-desc">{task.description}</span>
                          {task.hoursSpent && (
                            <span className="task-hours">{task.hoursSpent}h</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button className="btn btn-primary">
                <FiCheckCircle /> Mark as Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyReport;