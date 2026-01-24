import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiDownload, FiCalendar, FiTrendingUp, FiFileText } from 'react-icons/fi';
import { BiTask } from 'react-icons/bi';
import Card from '../../Shared/Card/Card';
import Loader from '../../Shared/Loader/Loader';
import { toast } from 'react-toastify';
import './ClientReports.css';

function ClientReports() {
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [projectSummary, setProjectSummary] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectReports();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getMyProjects();
      const projectsList = response.data.projects || [];
      setProjects(projectsList);
      if (projectsList.length > 0) {
        setSelectedProject(projectsList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectReports = async () => {
    try {
      setLoading(true);
      const [reportsRes, summaryRes] = await Promise.all([
        clientAPI.getProjectReports(selectedProject),
        clientAPI.getProjectProgress(selectedProject)
      ]);

      setWeeklyReports(reportsRes.data.reports || []);
      setProjectSummary(summaryRes.data.summary || null);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await clientAPI.downloadReport(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && projects.length === 0) {
    return <Loader />;
  }

  if (projects.length === 0) {
    return (
      <div className="client-reports">
        <div className="no-data-container">
          <BiTask className="no-data-icon" />
          <h3>No Projects Available</h3>
          <p>You don't have any projects to view reports for</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1>Project Reports</h1>
          <p>Track progress and download detailed reports</p>
        </div>
      </div>

      {/* Project Selector */}
      <Card className="project-selector-card">
        <label>Select Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="project-select"
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </Card>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Project Summary */}
          {projectSummary && (
            <Card className="summary-card">
              <h3>
                <FiTrendingUp /> Project Summary
              </h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-icon" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                    <BiTask />
                  </div>
                  <div className="summary-details">
                    <span className="summary-label">Total Tasks</span>
                    <span className="summary-value">{projectSummary.totalTasks}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-icon" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                    <FiTrendingUp />
                  </div>
                  <div className="summary-details">
                    <span className="summary-label">Completed</span>
                    <span className="summary-value">{projectSummary.completedTasks}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-icon" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                    <FiCalendar />
                  </div>
                  <div className="summary-details">
                    <span className="summary-label">In Progress</span>
                    <span className="summary-value">{projectSummary.inProgressTasks}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-icon" style={{ backgroundColor: '#ede9fe', color: '#5b21b6' }}>
                    <FiFileText />
                  </div>
                  <div className="summary-details">
                    <span className="summary-label">Overall Progress</span>
                    <span className="summary-value">{projectSummary.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span>Overall Completion</span>
                  <span className="progress-percentage">{projectSummary.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${projectSummary.progress}%`,
                      backgroundColor: projectSummary.progress >= 80 ? '#10b981' : '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>
            </Card>
          )}

          {/* Weekly Reports */}
          <Card className="weekly-reports-card">
            <h3>
              <FiFileText /> Weekly Reports
            </h3>

            {weeklyReports.length > 0 ? (
              <div className="reports-list">
                {weeklyReports.map((report) => (
                  <div key={report._id} className="report-item">
                    <div className="report-icon">
                      <FiFileText />
                    </div>
                    <div className="report-content">
                      <h4>{report.title}</h4>
                      <p>{report.description}</p>
                      <div className="report-meta">
                        <span className="report-date">
                          <FiCalendar />
                          {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
                        </span>
                        <span className="report-status">
                          {report.tasksCompleted} tasks completed
                        </span>
                      </div>
                    </div>
                    <button 
                      className="download-btn"
                      onClick={() => handleDownloadReport(report._id)}
                    >
                      <FiDownload />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reports">
                <p>No weekly reports available yet</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default ClientReports;