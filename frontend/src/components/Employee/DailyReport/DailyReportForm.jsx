import React, { useState } from 'react';
import { employeeAPI } from '../../../utils/api';
import { toast } from 'react-toastify';
import { FiSave, FiCalendar, FiClock } from 'react-icons/fi';
import { MdAssignment } from 'react-icons/md';
import './DailyReportForm.css';

function DailyReportForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tasksAccomplished: '',
    challengesFaced: '',
    tomorrowPlan: '',
    workingHours: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.tasksAccomplished.trim()) {
    toast.error('Please enter tasks accomplished');
    return;
  }

  if (!formData.workingHours) {
    toast.error('Please enter working hours');
    return;
  }

  try {
    setLoading(true);

    const reportData = {
      reportId: 'RPT-' + Date.now(), // unique string
      employee: 'EMPLOYEE_ID_HERE', // backend needs actual ObjectId
      date: formData.date,
      totalHoursWorked: parseFloat(formData.workingHours),
      status: 'Submitted', // must match schema enum
      achievements: formData.tasksAccomplished,
      challenges: formData.challengesFaced || '',
      blockers: formData.challengesFaced || '',
      suggestions: formData.notes || '',
      tasksCompleted: [], // optional
      tasksInProgress: [], // optional
      plannedForTomorrow: [] // optional
    };

    await employeeAPI.submitDailyReport(reportData);

    toast.success('Daily report submitted successfully!');
    setSubmitted(true);

    setTimeout(() => {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        tasksAccomplished: '',
        challengesFaced: '',
        tomorrowPlan: '',
        workingHours: '',
        notes: ''
      });
      setSubmitted(false);
    }, 2000);

  } catch (error) {
    console.error('Error submitting report:', error);
    toast.error(error.response?.data?.message || 'Failed to submit report');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="daily-report-form">
      <div className="form-header">
        <div>
          <h1><MdAssignment /> Daily Work Report</h1>
          <p>Share your daily progress and plans</p>
        </div>
        <div className="current-date">
          <FiCalendar />
          <span>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {/* Date Selection */}
        <div className="form-section">
          <label htmlFor="date" className="section-label">
            <FiCalendar /> Report Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="date-input"
            required
          />
        </div>

        {/* Tasks Accomplished */}
        <div className="form-section">
          <label htmlFor="tasksAccomplished" className="section-label">
            <MdAssignment /> Tasks Accomplished Today *
          </label>
          <textarea
            id="tasksAccomplished"
            name="tasksAccomplished"
            value={formData.tasksAccomplished}
            onChange={handleChange}
            placeholder="List all tasks you completed today...&#10;• Task 1&#10;• Task 2&#10;• Task 3"
            rows="6"
            className="form-textarea"
            required
          />
          <span className="help-text">
            Be specific and list each completed task
          </span>
        </div>

        {/* Challenges Faced */}
        <div className="form-section">
          <label htmlFor="challengesFaced" className="section-label">
            Challenges/Blockers Faced
          </label>
          <textarea
            id="challengesFaced"
            name="challengesFaced"
            value={formData.challengesFaced}
            onChange={handleChange}
            placeholder="Describe any challenges or blockers you encountered..."
            rows="4"
            className="form-textarea"
          />
          <span className="help-text">
            Optional: Mention any obstacles that affected your work
          </span>
        </div>

        {/* Tomorrow's Plan */}
        <div className="form-section">
          <label htmlFor="tomorrowPlan" className="section-label">
            Tomorrow's Plan
          </label>
          <textarea
            id="tomorrowPlan"
            name="tomorrowPlan"
            value={formData.tomorrowPlan}
            onChange={handleChange}
            placeholder="What do you plan to work on tomorrow?&#10;• Planned Task 1&#10;• Planned Task 2"
            rows="4"
            className="form-textarea"
          />
          <span className="help-text">
            Optional: Outline your tasks for the next working day
          </span>
        </div>

        {/* Working Hours */}
        <div className="form-section">
          <label htmlFor="workingHours" className="section-label">
            <FiClock /> Total Working Hours *
          </label>
          <input
            type="number"
            id="workingHours"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleChange}
            placeholder="8"
            min="0"
            max="24"
            step="0.5"
            className="hours-input"
            required
          />
          <span className="help-text">
            Enter hours worked today (e.g., 8 or 8.5)
          </span>
        </div>

        {/* Additional Notes */}
        <div className="form-section">
          <label htmlFor="notes" className="section-label">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any other information or comments..."
            rows="3"
            className="form-textarea"
          />
          <span className="help-text">
            Optional: Add any extra information
          </span>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || submitted}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Submitting...
              </>
            ) : submitted ? (
              <>
                <FiSave />
                Submitted!
              </>
            ) : (
              <>
                <FiSave />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Message */}
      {submitted && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h3>Report Submitted Successfully!</h3>
          <p>Your daily report has been recorded</p>
        </div>
      )}

      {/* Tips Section */}
      <div className="tips-section">
        <h3>Tips for Writing Great Reports</h3>
        <ul>
          <li>Be specific about what you accomplished</li>
          <li>Mention any blockers early so they can be addressed</li>
          <li>Plan ahead for better time management</li>
          <li>Include measurable results when possible</li>
          <li>Submit your report daily for best tracking</li>
        </ul>
      </div>
    </div>
  );
}

export default DailyReportForm;
