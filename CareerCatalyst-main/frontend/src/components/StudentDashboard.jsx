import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [careerRecommendations, setCareerRecommendations] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
          // If profile is not complete, redirect to profile completion
          if (!data.user.isProfileComplete) {
            navigate('/student-profile');
          }
        } else {
          setError(data.message || 'Failed to load profile');
          if (res.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
      } catch (err) {
        setError('Server error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchCareerRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/career/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setCareerRecommendations(data);
      }
    } catch (err) {
      console.error('Failed to fetch career recommendations:', err);
    }
  };

  const fetchSkillGaps = async (role) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/career/skill-gaps/${encodeURIComponent(role)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setSkillGaps(data.analysis);
      }
    } catch (err) {
      console.error('Failed to fetch skill gaps:', err);
    }
  };

  // Fetch career recommendations when user data is loaded
  useEffect(() => {
    if (user?.skills?.length > 0) {
      fetchCareerRecommendations();
    }
  }, [user]);

  const getProfileCompletionPercentage = () => {
    if (!user) return 0;
    const requiredFields = ['name', 'email', 'skills'];
    const completedFields = requiredFields.filter(field => {
      if (field === 'skills') {
        return user[field] && user[field].length > 0;
      }
      return user[field] && user[field].trim() !== '';
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p className="last-login">Last login: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card profile-card">
            <h2>Your Profile</h2>
            <div className="profile-info">
              <p><strong>Email:</strong> {user?.email}</p>
              <div className="skills-section">
                <h3>Your Skills</h3>
                <div className="skills-list">
                  {user?.skills?.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/student-profile')}
              style={{ marginTop: '1rem' }}
            >
              Edit Profile
            </button>
          </div>

          <div className="dashboard-card career-recommendations">
            <h2>Career Recommendations</h2>
            <div className="career-list">
              {careerRecommendations ? (
                careerRecommendations.careerMatches.map((career, index) => (
                  <div 
                    key={index} 
                    className={`career-card ${selectedRole === career.role ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRole(career.role);
                      fetchSkillGaps(career.role);
                    }}
                  >
                    <h3>{career.role}</h3>
                    <div className="match-percentage">
                      Match: {career.matchPercentage}
                    </div>
                    <p>{career.description}</p>
                    <div className="career-meta">
                      <span>💰 {career.averageSalary}</span>
                      <span>📈 {career.marketDemand} Demand</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="loading-recommendations">
                  <p>Analyzing your skills to find the best career matches...</p>
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card skill-analysis">
            {selectedRole && skillGaps ? (
              <>
                <h2>Skill Gap Analysis for {selectedRole}</h2>
                <div className="skill-gaps-container">
                  <div className="current-skills">
                    <h3>Your Current Skills</h3>
                    <div className="skills-list">
                      {skillGaps.currentSkillsAssessment.strengths.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="missing-skills">
                    <h3>Skills to Develop</h3>
                    {skillGaps.missingSkills.map((skill, index) => (
                      <div key={index} className="skill-gap-item">
                        <h4>{skill.skill}</h4>
                        <div className="skill-details">
                          <span className={`priority ${skill.priority.toLowerCase()}`}>
                            {skill.priority} Priority
                          </span>
                          <span>⏱️ {skill.timeToAcquire}</span>
                        </div>
                        <p>{skill.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : selectedRole ? (
              <div className="loading-analysis">
                <p>Analyzing skill gaps...</p>
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="select-role-prompt">
                <h2>Skill Analysis</h2>
                <p>Select a career role to see required skills and learning paths</p>
              </div>
            )}
          </div>

          <div className="dashboard-card stats-card">
            <h2>Your Progress</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>Profile Completion</h3>
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: `${getProfileCompletionPercentage()}%` }}
                  ></div>
                </div>
                <p>{getProfileCompletionPercentage()}%</p>
              </div>
              <div className="stat-item">
                <h3>Skills Added</h3>
                <p>{user?.skills?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
