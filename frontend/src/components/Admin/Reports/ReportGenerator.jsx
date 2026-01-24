import React, { useState } from 'react';
import { adminAPI } from '../../../utils/api';
import { 
  FiFileText, 
  FiDownload, 
  FiCalendar, 
  FiUsers,
  FiActivity,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ReportGenerator.css';

function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('performance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [generatedReport, setGeneratedReport] = useState(null);

  const reportTypes = [
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Employee performance and productivity metrics',
      icon: <FiTrendingUp />,
      color: 'primary'
    },
    {
      id: 'attendance',
      name: 'Attendance Report',
      description: 'Employee attendance and punctuality statistics',
      icon: <FiClock />,
      color: 'success'
    },
    {
      id: 'productivity',
      name: 'Productivity Report',
      description: 'Task completion and project progress',
      icon: <FiActivity />,
      color: 'warning'
    },
    {
      id: 'employee',
      name: 'Employee Report',
      description: 'Comprehensive employee data and insights',
      icon: <FiUsers />,
      color: 'info'
    }
  ];

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.generateReport(reportType, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      setGeneratedReport(response.data);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    if (!generatedReport) {
      toast.error('No report to download');
      return;
    }

    try {
      const response = await adminAPI.exportReport(generatedReport.id, format);
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().getTime()}.${format}`;
      link.click();
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const selectedReport = reportTypes.find(r => r.id === reportType);

  return (
    <div className="report-generator">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Report Generator</h1>
          <p>Generate and download comprehensive reports</p>
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
                className={`report-type-card ${reportType === type.id ? 'active' : ''}`}
                onClick={() => setReportType(type.id)}
              >
                <div className={`report-icon ${type.color}`}>
                  {type.icon}
                </div>
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
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                max={dateRange.endDate}
              />
            </div>
            <div className="date-separator">to</div>
            <div className="date-input-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                min={dateRange.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Quick Date Ranges */}
          <div className="quick-ranges">
            <button
              className="quick-range-btn"
              onClick={() => {
                const endDate = new Date();
                const startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 7);
                setDateRange({
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0]
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
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0]
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
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0]
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
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0]
                });
              }}
            >
              This Year
            </button>
          </div>
        </div>

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
                Generating...
              </>
            ) : (
              <>
                <FiFileText />
                Generate {selectedReport?.name}
              </>
            )}
          </button>
        </div>

        {/* Generated Report Preview */}
        {generatedReport && (
          <div className="report-section">
            <h3 className="section-title">
              <FiFileText /> Generated Report
            </h3>
            <div className="report-preview">
              <div className="preview-header">
                <div className="preview-info">
                  <h4>{selectedReport?.name}</h4>
                  <p>
                    {new Date(dateRange.startDate).toLocaleDateString()} - 
                    {new Date(dateRange.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="download-buttons">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownload('pdf')}
                  >
                    <FiDownload /> Download PDF
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDownload('csv')}
                  >
                    <FiDownload /> Download CSV
                  </button>
                </div>
              </div>

              <div className="preview-content">
                <div className="preview-stats">
                  <div className="preview-stat">
                    <span className="stat-label">Total Records</span>
                    <span className="stat-value">{generatedReport.totalRecords || 0}</span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-label">Date Generated</span>
                    <span className="stat-value">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-label">Report ID</span>
                    <span className="stat-value">#{generatedReport.id}</span>
                  </div>
                </div>

                {generatedReport.summary && (
                  <div className="report-summary">
                    <h5>Summary</h5>
                    <p>{generatedReport.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportGenerator;