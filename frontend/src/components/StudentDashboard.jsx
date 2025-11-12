import React, { useState, useEffect, useRef } from 'react';
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
    padding: 0; /* inner padding moved to card wrapper */
    background: transparent;
    color: var(--text-primary);
    border-radius: 8px;
  }

  /* card wrapper to visually enclose the educational pathway */
  /* Swapped: outer card uses darker background and inner cards use card background */
  .educational-card {
    margin-top: 1rem;
    background: var(--bg-dark); /* outer card is dark now */
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    border: 1px solid var(--border-color);
  }

  .context-section {
    margin-bottom: 1.5rem;
  }

  /* Make section headings and content use white/primary text for contrast */
  .context-section h4 {
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  .courses-list {
    display: grid;
    gap: 1rem;
  }

  /* inner course cards now use the card background (swapped) */
  .course-item {
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    color: var(--text-primary);
  }

  .course-details {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.9em;
    color: var(--text-secondary);
  }

  .prerequisites-list {
    display: grid;
    gap: 0.8rem;
  }

  .prerequisite-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--bg-card);
    padding: 0.8rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    color: var(--text-primary);
  }

  .prereq-skill {
    font-weight: 600;
    color: var(--text-primary);
  }

  .prereq-level {
    color: var(--text-primary);
  }

  .prereq-importance {
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    background-color: rgba(255,255,255,0.04);
    color: var(--text-primary);
    font-size: 0.8em;
  }

  .academic-pathway {
    background: var(--bg-card);
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    color: var(--text-primary);
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
  const [careerRecommendations, setCareerRecommendations] = useState({ recommendations: [], careerMatches: [] });
  const [selectedRole, setSelectedRole] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [educationalContext, setEducationalContext] = useState(null);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const hideTimeoutRef = useRef(null);
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
    return () => {
      // cleanup any pending hide timeout when component unmounts
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [navigate]);

  const fetchCareerRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // First ensure we have the student profile
      const profileRes = await fetch('http://localhost:5000/api/career/student-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!profileRes.ok) {
        throw new Error('Failed to fetch student profile');
      }

      // Get career recommendations
      const res = await fetch('http://localhost:5000/api/career/student/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      console.log('Career recommendations response:', data); // Debug log

      if (res.ok) {
        if (!data || !data.recommendations) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from server');
        }
        setCareerRecommendations({
          careerMatches: data.recommendations.map(rec => ({
            role: rec.role,
            matchPercentage: rec.compatibilityScore,
            description: rec.description,
            averageSalary: rec.averageSalary,
            marketDemand: rec.marketDemand,
            transitionTime: rec.transitionTime,
            keyBenefits: rec.keyBenefits || [],
            growthPotential: rec.growthPotential || {},
            skillTransferability: rec.skillTransferability || {},
            industryTrends: rec.industryTrends || {}
          }))
        });
      } else {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('Failed to fetch career recommendations:', err);
      setError('Failed to load career recommendations. Please try again.');
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
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="last-login">Last login: {new Date().toLocaleDateString()}</p>
          </div>

          <div
            className="profile-icon-wrapper"
            onMouseEnter={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
              setShowProfilePopover(true);
            }}
            onMouseLeave={() => {
              // add a small delay so user can move pointer to popover without it closing
              hideTimeoutRef.current = setTimeout(() => setShowProfilePopover(false), 180);
            }}
          >
            <button
              className="profile-icon"
              onClick={() => setShowProfilePopover((s) => !s)}
              title="View Profile"
              aria-label="View Profile"
            >
              👤
            </button>

            {showProfilePopover && (
              <div
                className="profile-popover"
                role="dialog"
                aria-label="Profile preview"
                onMouseEnter={() => {
                  if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                  }
                  setShowProfilePopover(true);
                }}
                onMouseLeave={() => {
                  hideTimeoutRef.current = setTimeout(() => setShowProfilePopover(false), 180);
                }}
              >
                <div className="popover-header">
                  <div className="avatar">
                    {user?.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'U'}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>

                <div className="popover-body">
                  <h4>Skills</h4>
                  <div className="popover-skills">
                    {user?.skills && user.skills.length > 0 ? (
                      user.skills.map((s, i) => (
                        <span key={i} className="skill-tag">{s}</span>
                      ))
                    ) : (
                      <p className="text-muted">No skills added</p>
                    )}
                  </div>

                  <div className="profile-actions">
                    <button
                      className="btn-primary"
                      onClick={() => {
                        // explicit navigation only on button click
                        navigate('/student-profile');
                        setShowProfilePopover(false);
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Profile card removed — use the profile icon in the header to view/edit profile */}

          <div className="dashboard-card career-recommendations">
            <h2>Career Recommendations</h2>
            <div className="career-list">
              {loading ? (
                <div className="loading-recommendations">
                  <p>Analyzing your skills to find the best career matches...</p>
                  <div className="loading-spinner"></div>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button className="btn-primary" onClick={fetchCareerRecommendations}>
                    Try Again
                  </button>
                </div>
              ) : careerRecommendations?.careerMatches?.length > 0 ? (
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
                      Match: {career.matchPercentage}%
                    </div>
                    <p>{career.description}</p>
                    <div className="career-meta">
                      <span>💰 {career.averageSalary || 'Not specified'}</span>
                      <span>📈 {career.marketDemand || 'High'} Demand</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-recommendations">
                  <p>No career recommendations found. Please update your profile with more skills and try again.</p>
                  <button className="btn-primary" onClick={() => navigate('/student-profile')}>
                    Update Profile
                  </button>
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
                      <div className="educational-card">
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

          {/* Progress card removed per request - skill analysis will occupy the space */}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
