import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const FresherDashboard = () => {
  const [user, setUser] = useState(null);
  const [fresherProfile, setFresherProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [careerRecommendations, setCareerRecommendations] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [linkedInProfiles, setLinkedInProfiles] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
          if (!data.user.isProfileComplete) {
            navigate('/fresher-profile');
            return;
          }

          // Fetch fresher profile
          const fresherRes = await fetch('http://localhost:5000/api/career/fresher-profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const fresherData = await fresherRes.json();
          if (fresherRes.ok) {
            setFresherProfile(fresherData);
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
      const res = await fetch('http://localhost:5000/api/career/fresher-recommendations', {
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

  const fetchLinkedInProfiles = async (role) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/career/linkedin-profiles/${encodeURIComponent(role)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setLinkedInProfiles(data.profiles);
      }
    } catch (err) {
      console.error('Failed to fetch LinkedIn profiles:', err);
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
                  {fresherProfile?.skills?.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="profile-details">
                <p><strong>Work Mode:</strong> {fresherProfile?.workMode}</p>
                <p><strong>Salary Preference:</strong> ${fresherProfile?.salaryPreferences}</p>
                <h3>Interested Roles</h3>
                <div className="skills-list">
                  {fresherProfile?.interestedRoles?.map((role, index) => (
                    <span key={index} className="skill-tag">{role}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card career-recommendations">
            <h2>Career Recommendations</h2>
            {!careerRecommendations && (
              <button 
                className="btn-primary"
                onClick={fetchCareerRecommendations}
                style={{ marginBottom: '1rem' }}
              >
                Get Career Recommendations
              </button>
            )}
            <div className="career-list">
              {careerRecommendations ? (
                careerRecommendations.careerMatches.map((career, index) => (
                  <div 
                    key={index} 
                    className={`career-card ${selectedRole === career.role ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRole(career.role);
                      fetchSkillGaps(career.role);
                      fetchLinkedInProfiles(career.role);
                    }}
                  >
                    <h3>{career.role}</h3>
                    <div className="match-percentage">
                      Match: {career.matchPercentage}%
                    </div>
                    <p>{career.description}</p>
                    <div className="career-meta">
                      <span>💰 {career.averageSalary}</span>
                      <span>📈 {career.marketDemand} Demand</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="click-prompt">
                  <p>Click the button above to get personalized career recommendations</p>
                </div>
              )}
            </div>
          </div>

          {selectedRole && (
            <>
              <div className="dashboard-card linkedin-profiles">
                <h2>LinkedIn Profiles for {selectedRole}</h2>
                <div className="profiles-list">
                  {linkedInProfiles ? (
                    linkedInProfiles.map((profile, index) => (
                      <div key={index} className="profile-card">
                        <h3>{profile.name}</h3>
                        <p>{profile.title}</p>
                        <p>{profile.company}</p>
                        <a 
                          href={profile.profileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-secondary"
                        >
                          View Profile
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="loading-spinner"></div>
                  )}
                </div>
              </div>

              <div className="dashboard-card skill-analysis">
                {skillGaps ? (
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
                      <div className="roadmap">
                        <h3>Learning Roadmap</h3>
                        <div className="roadmap-steps">
                          {skillGaps.roadmap.map((step, index) => (
                            <div key={index} className="roadmap-step">
                              <div className="step-number">{index + 1}</div>
                              <div className="step-content">
                                <h4>{step.title}</h4>
                                <p>{step.description}</p>
                                {step.resources && (
                                  <div className="resources">
                                    <h5>Recommended Resources:</h5>
                                    <ul>
                                      {step.resources.map((resource, idx) => (
                                        <li key={idx}>
                                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                            {resource.title}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="loading-analysis">
                    <p>Analyzing skill gaps...</p>
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FresherDashboard;
