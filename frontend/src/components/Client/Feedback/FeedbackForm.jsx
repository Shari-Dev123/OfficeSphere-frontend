import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../../utils/api';
import { FiStar, FiMessageCircle, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { BiTask } from 'react-icons/bi';
import Card from '../../Shared/Card/Card';
import Loader from '../../Shared/Loader/Loader';
import { toast } from 'react-toastify';
import './FeedbackForm.css';

function FeedbackForm() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
    satisfactionLevel: 5
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchFeedbackHistory();
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

  const fetchFeedbackHistory = async () => {
    try {
      const response = await clientAPI.getFeedbackHistory(selectedProject);
      setFeedbackHistory(response.data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback history:', error);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setSubmitting(true);
      await clientAPI.submitFeedback(selectedProject, {
        ...formData,
        rating
      });

      toast.success('Feedback submitted successfully!');
      resetForm();
      fetchFeedbackHistory();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateSatisfaction = async (projectRating) => {
    try {
      await clientAPI.rateSatisfaction(selectedProject, projectRating);
      toast.success('Thank you for your rating!');
    } catch (error) {
      console.error('Error rating satisfaction:', error);
      toast.error('Failed to submit rating');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'general',
      subject: '',
      message: '',
      satisfactionLevel: 5
    });
    setRating(0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (count, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <FiStar
          key={index}
          className={`star ${starValue <= (interactive ? (hoveredRating || rating) : count) ? 'filled' : ''}`}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      );
    });
  };

  if (loading && projects.length === 0) {
    return <Loader />;
  }

  if (projects.length === 0) {
    return (
      <div className="feedback-form">
        <div className="no-data-container">
          <BiTask className="no-data-icon" />
          <h3>No Projects Available</h3>
          <p>You don't have any active projects to provide feedback for</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form">
      {/* Header */}
      <div className="feedback-header">
        <div className="header-content">
          <h1>Project Feedback</h1>
          <p>Share your thoughts and help us improve</p>
        </div>
      </div>

      <div className="feedback-grid">
        {/* Feedback Form Card */}
        <Card className="form-card">
          <h3>
            <FiMessageCircle /> Submit Feedback
          </h3>

          <form onSubmit={handleSubmitFeedback}>
            {/* Project Selection */}
            <div className="form-group">
              <label>Select Project *</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div className="form-group">
              <label>Overall Rating *</label>
              <div className="rating-container">
                <div className="stars-wrapper">
                  {renderStars(rating, true)}
                </div>
                <span className="rating-text">
                  {rating === 0 ? 'Click to rate' : `${rating} out of 5 stars`}
                </span>
              </div>
            </div>

            {/* Feedback Type */}
            <div className="form-group">
              <label>Feedback Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="general">General Feedback</option>
                <option value="quality">Quality of Work</option>
                <option value="communication">Communication</option>
                <option value="timeline">Timeline & Delivery</option>
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            {/* Message */}
            <div className="form-group">
              <label>Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share your detailed feedback here..."
                rows="6"
                required
              />
            </div>

            {/* Satisfaction Level */}
            <div className="form-group">
              <label>Satisfaction Level</label>
              <div className="satisfaction-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.satisfactionLevel}
                  onChange={(e) => setFormData({ ...formData, satisfactionLevel: e.target.value })}
                />
                <div className="satisfaction-labels">
                  <span>Not Satisfied</span>
                  <span className="satisfaction-value">{formData.satisfactionLevel}/10</span>
                  <span>Very Satisfied</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </Card>

        {/* Feedback History Card */}
        <Card className="history-card">
          <h3>
            <FiCheckCircle /> Feedback History
          </h3>

          {feedbackHistory.length > 0 ? (
            <div className="feedback-list">
              {feedbackHistory.map((feedback) => (
                <div key={feedback._id} className="feedback-item">
                  <div className="feedback-item-header">
                    <div className="feedback-type-badge" data-type={feedback.type}>
                      {feedback.type}
                    </div>
                    <div className="feedback-stars">
                      {renderStars(feedback.rating, false)}
                    </div>
                  </div>

                  <h4>{feedback.subject}</h4>
                  <p>{feedback.message}</p>

                  <div className="feedback-meta">
                    <span className="feedback-date">{formatDate(feedback.createdAt)}</span>
                    {feedback.response && (
                      <span className="response-badge">
                        <FiCheckCircle /> Responded
                      </span>
                    )}
                  </div>

                  {feedback.response && (
                    <div className="admin-response">
                      <strong>Admin Response:</strong>
                      <p>{feedback.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-feedback">
              <FiAlertCircle className="no-feedback-icon" />
              <p>No feedback submitted yet for this project</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default FeedbackForm;