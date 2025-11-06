import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const ExperiencedDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [careerRecommendations, setCareerRecommendations] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
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
            navigate('/experienced-profile');
          } else {
            // Fetch experienced profile data
            fetchExperiencedProfile();
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

  const fetchExperiencedProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/career/experienced-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        // After getting profile, fetch career recommendations
        fetchCareerRecommendations(data);
      }
    } catch (err) {
      console.error('Failed to fetch experienced profile:', err);
    }
  };

  const fetchCareerRecommendations = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/career/experienced/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentSkills: profileData.skills,
          experienceYears: profileData.experienceYears,
          reasonForSwitch: profileData.reasonForSwitch,
          workMode: profileData.workMode
        })
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
      const res = await fetch(`http://localhost:5000/api/career/experienced/skill-gaps/${encodeURIComponent(role)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setSkillGaps(data);
        console.log('Skill gaps data:', data);
      }
    } catch (err) {
      console.error('Failed to fetch skill gaps:', err);
    }
  };

  const downloadRoadmap = async (role) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Show loading state
      const loadingToast = alert('Generating your roadmap PDF...');

      const response = await fetch(
        `http://localhost:5000/api/career/experienced/roadmap-pdf/${encodeURIComponent(role)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download PDF');
      }

      if (!response.headers.get('content-type')?.includes('application/pdf')) {
        throw new Error('Invalid response format');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `career-switch-roadmap-${role.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      alert('Roadmap downloaded successfully!');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert(`Failed to download PDF: ${error.message}`);
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
          {/* Profile Card */}
          <div className="dashboard-card profile-card">
            <h2>Your Professional Profile</h2>
            <div className="profile-info">
              <p><strong>Email:</strong> {user?.email}</p>
              <div className="experience-details">
                <p><strong>Experience:</strong> {profile?.experienceYears} years</p>
                <p><strong>Preferred Work Mode:</strong> {profile?.workMode}</p>
                <p><strong>Expected Salary:</strong> ₹{profile?.salaryPreferences}/year</p>
              </div>
              <div className="skills-section">
                <h3>Your Skills</h3>
                <div className="skills-list">
                  {profile?.skills?.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="switch-reason">
                <h3>Career Switch Goals</h3>
                <p>{profile?.reasonForSwitch}</p>
              </div>
              {profile?.additionalAchievements && (
                <div className="achievements">
                  <h3>Additional Achievements</h3>
                  <p>{profile?.additionalAchievements}</p>
                </div>
              )}
            </div>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/edit-experienced-profile')}
              style={{ marginTop: '1rem' }}
            >
              Edit Profile
            </button>
          </div>

          {/* Career Recommendations Card */}
          <div className="dashboard-card career-recommendations">
            <h2>Career Transition Recommendations</h2>
            <div className="career-list">
              {careerRecommendations ? (
                careerRecommendations.recommendations.map((career, index) => (
                  <div 
                    key={index} 
                    className={`career-card ${selectedRole === career.role ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRole(career.role);
                      fetchSkillGaps(career.role);
                    }}
                  >
                    <h3>{career.role}</h3>
                    <div className="compatibility-score">
                      Compatibility: {career.compatibilityScore}%
                    </div>
                    <p>{career.description}</p>
                    <div className="career-meta">
                      <span>💰 {career.averageSalary}</span>
                      <span>📈 {career.marketDemand}</span>
                      <span>⏳ {career.transitionTime}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="loading-recommendations">
                  <p>Analyzing your profile to find the best career transitions...</p>
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>
          </div>

          {/* Skill Gap Analysis and Roadmap Card */}
          <div className="dashboard-card skill-analysis">
            {selectedRole && skillGaps ? (
              <>
                <div className="skill-analysis-header">
                  <h2>Transition Plan to {selectedRole}</h2>
                  <button 
                    className="btn-download"
                    onClick={() => downloadRoadmap(selectedRole)}
                  >
                    <span>📥</span> Download Transition Roadmap
                  </button>
                </div>
                <div className="skill-gaps-container">
                  <div className="current-skills">
                    <h3>Your Current Skills</h3>
                    <div className="skills-list">
                      {profile?.skills?.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="missing-skills">
                    <h3>Skills to Develop</h3>
                    {skillGaps.missingSkills?.map((skill, index) => (
                      <div key={index} className="skill-gap-item">
                        <h4>{skill.skill}</h4>
                        <div className="skill-details">
                          <span className={`priority ${skill.priority.toLowerCase()}`}>
                            {skill.priority} Priority
                          </span>
                          <span>⏱️ {skill.timeToAcquire}</span>
                        </div>
                        <p>{skill.impact}</p>
                        {skill.resources && (
                          <div className="learning-resources">
                            <h5>Learning Resources:</h5>
                            <ul>
                              {skill.resources.map((resource, idx) => (
                                <li key={idx}>
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    {resource.title}
                                  </a>
                                  <span className="resource-type">{resource.type}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {skillGaps.transitionPlan && (
                    <div className="transition-plan">
                      <h3>Transition Timeline</h3>
                      <div className="timeline">
                        {skillGaps.transitionPlan.phases.map((phase, index) => (
                          <div key={index} className="timeline-phase">
                            <h4>{phase.name}</h4>
                            <p>{phase.duration}</p>
                            <ul>
                              {phase.activities.map((activity, idx) => (
                                <li key={idx}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : selectedRole ? (
              <div className="loading-analysis">
                <p>Analyzing transition path...</p>
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="select-role-prompt">
                <h2>Career Transition Analysis</h2>
                <p>Select a recommended role to see your personalized transition plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExperiencedDashboard;
