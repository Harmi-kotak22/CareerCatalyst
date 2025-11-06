import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

// Add custom styles for the download button
const styleElement = document.createElement('style');
styleElement.textContent = `
  .skill-analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .btn-download {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s ease;
  }

  .btn-download:hover {
    background-color: #45a049;
  }

  .btn-download span {
    font-size: 1.2em;
  }

  .educational-context {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .context-section {
    margin-bottom: 1.5rem;
  }

  .context-section h4 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .courses-list {
    display: grid;
    gap: 1rem;
  }

  .course-item {
    background-color: white;
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .course-details {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.9em;
    color: #666;
  }

  .prerequisites-list {
    display: grid;
    gap: 0.8rem;
  }

  .prerequisite-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: white;
    padding: 0.8rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .prereq-skill {
    font-weight: 600;
  }

  .prereq-level {
    color: #666;
  }

  .prereq-importance {
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    background-color: #e9ecef;
    font-size: 0.8em;
  }

  .academic-pathway {
    background-color: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .recommendations ul,
  .certifications ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .recommendations li,
  .certifications li {
    margin-bottom: 0.5rem;
  }

  .timeline {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
`;
document.head.appendChild(styleElement);

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [careerRecommendations, setCareerRecommendations] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [educationalContext, setEducationalContext] = useState(null);
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
      const res = await fetch(`http://localhost:5000/api/career/student/skill-gaps/${encodeURIComponent(role)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Student skill gaps data:', data); // Add logging to see the response
      setSkillGaps(data.skillGapAnalysis);
      
      // Store educational context if available
      if (data.educationalContext) {
        setEducationalContext(data.educationalContext);
      }
    } catch (err) {
      console.error('Failed to fetch skill gaps:', err);
      setError('Failed to fetch skill analysis. Please try again.');
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
                <div className="skill-analysis-header">
                  <h2>Skill Gap Analysis for {selectedRole}</h2>
                  <button 
                    className="btn-download"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(
                          `http://localhost:5000/api/career/student/roadmap-pdf/${encodeURIComponent(selectedRole)}`,
                          {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          }
                        );
                        
                        if (!response.ok) {
                          throw new Error('Failed to download PDF');
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `career-roadmap-${selectedRole.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Failed to download PDF:', error);
                        alert('Failed to download PDF. Please try again.');
                      }
                    }}
                  >
                    <span>📥</span> Download Roadmap PDF
                  </button>
                </div>
                <div className="skill-gaps-container">
                  <div className="current-skills">
                    <h3>Your Current Skills</h3>
                    <div className="skills-list">
                      {user?.skills?.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      )) || (
                        <p>No current skills available</p>
                      )}
                    </div>
                  </div>
                  <div className="missing-skills">
                    <h3>Skills to Develop</h3>
                    {skillGaps?.missingSkills?.map((skill, index) => (
                      <div key={index} className="skill-gap-item">
                        <h4>{skill.skill}</h4>
                        <div className="skill-details">
                          <span className={`priority ${(skill.priority || '').toLowerCase()}`}>
                            {skill.priority || 'Medium'} Priority
                          </span>
                          <span>⏱️ {skill.timeToAcquire || 'Not specified'}</span>
                        </div>
                        <p>{skill.impact || 'Improves job readiness'}</p>
                        {skill.prerequisiteSkills?.length > 0 && (
                          <div className="prerequisites">
                            <h5>Prerequisites:</h5>
                            <div className="skills-list">
                              {skill.prerequisiteSkills.map((prereq, idx) => (
                                <span key={idx} className="skill-tag prerequisite">{prereq}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )) || (
                      <p>No skill gaps identified</p>
                    )}
                  </div>
                  {educationalContext && (
                    <div className="educational-context">
                      <h3>Educational Pathway</h3>
                      <div className="context-section">
                        <h4>Relevant Courses</h4>
                        <div className="courses-list">
                          {educationalContext.relevantCourses.map((course, idx) => (
                            <div key={idx} className="course-item">
                              <h5>{course.name}</h5>
                              <div className="course-details">
                                <span>🏫 {course.provider}</span>
                                <span>⏱️ {course.duration}</span>
                                <span>📊 {course.level}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="context-section">
                        <h4>Prerequisites</h4>
                        <div className="prerequisites-list">
                          {educationalContext.prerequisites.map((prereq, idx) => (
                            <div key={idx} className="prerequisite-item">
                              <span className="prereq-skill">{prereq.skill}</span>
                              <span className="prereq-level">{prereq.level}</span>
                              <span className="prereq-importance">{prereq.importance}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="context-section">
                        <h4>Academic Pathway</h4>
                        <div className="academic-pathway">
                          <div className="recommendations">
                            <h5>Recommended Steps</h5>
                            <ul>
                              {educationalContext.academicPathway.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="certifications">
                            <h5>Recommended Certifications</h5>
                            <ul>
                              {educationalContext.academicPathway.certifications.map((cert, idx) => (
                                <li key={idx}>{cert}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="timeline">
                            <h5>Estimated Timeline</h5>
                            <p>{educationalContext.academicPathway.timeline}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
