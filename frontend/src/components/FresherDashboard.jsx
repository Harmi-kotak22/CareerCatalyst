import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

// Add custom styles to the head of the document
const styleElement = document.createElement('style');
styleElement.textContent = `
  .profile-actions {
    display: flex;
    gap: 10px;
    margin-top: auto;
  }

  .profile-actions button,
  .profile-actions a {
    flex: 1;
    padding: 8px 16px;
    text-align: center;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9em;
    transition: all 0.2s ease;
  }

  .profile-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
    border: none;
  }

  .btn-danger:hover {
    background-color: #c82333;
  }

  .saved-profiles {
    margin-bottom: 2rem;
  }
`;
document.head.appendChild(styleElement);

const FresherDashboard = () => {
  const [user, setUser] = useState(null);
  const [fresherProfile, setFresherProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [careerRecommendations, setCareerRecommendations] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [linkedInProfiles, setLinkedInProfiles] = useState(null);
  const [learningRoadmap, setLearningRoadmap] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillExperts, setSkillExperts] = useState(null);
  const [developmentPath, setDevelopmentPath] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const navigate = useNavigate();

  const handleSaveProfile = async (profile) => {
    try {
      setSavingProfile(true);
      // Add required fields
      const profileWithRole = {
        ...profile,
        role: selectedRole, // Add the currently selected role
        savedAt: new Date().toISOString(),
        name: profile.name,
        title: profile.title,
        company: profile.company || '',
        profileUrl: profile.profileUrl,
        thumbnailUrl: profile.thumbnailUrl || ''
      };

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/career/fresher/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileWithRole)
      });

      const data = await res.json();
      if (res.ok && data.profile) {
        setSavedProfiles(prevProfiles => {
          const updatedProfiles = Array.isArray(prevProfiles) ? [...prevProfiles] : [];
          return [...updatedProfiles, data.profile];
        });
      } else {
        console.error('Failed to save profile:', data.message);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveProfile = async (profileId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/career/fresher/remove-profile/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSavedProfiles(prevProfiles => {
          if (!Array.isArray(prevProfiles)) return [];
          return prevProfiles.filter(profile => profile._id !== profileId);
        });
      } else {
        console.error('Failed to remove profile');
      }
    } catch (err) {
      console.error('Failed to remove profile:', err);
    }
  };

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
          // No need to check isProfileComplete here since login handles it
          
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

          // Fetch saved profiles
          const savedProfilesRes = await fetch('http://localhost:5000/api/career/fresher/saved-profiles', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const savedProfilesData = await savedProfilesRes.json();
          if (savedProfilesRes.ok && Array.isArray(savedProfilesData.savedProfiles)) {
            setSavedProfiles(savedProfilesData.savedProfiles);
          } else {
            setSavedProfiles([]); // Initialize with empty array if no profiles
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
      // Include top skills in the request if available
      const skillsQuery = fresherProfile?.skills ? 
        `?skills=${encodeURIComponent(fresherProfile.skills.slice(0, 3).join(','))}` : '';
      
      const res = await fetch(
        `http://localhost:5000/api/career/linkedin-profiles/${encodeURIComponent(role)}${skillsQuery}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      if (res.ok) {
        setLinkedInProfiles(data.profiles);
      } else {
        console.error('Failed to fetch LinkedIn profiles:', data.message);
      }
    } catch (err) {
      console.error('Failed to fetch LinkedIn profiles:', err);
    }
  };

  const fetchSkillGaps = async (role) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/career/fresher/skill-gaps/${encodeURIComponent(role)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setSkillGaps(data.skillGapAnalysis);
        setLearningRoadmap(data.learningRoadmap);
      }
    } catch (err) {
      console.error('Failed to fetch skill gaps:', err);
    }
  };

  const fetchSkillDevelopmentPath = async (skills) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/career/fresher/skill-development', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills })
      });

      const data = await res.json();
      if (res.ok) {
        setDevelopmentPath(data.developmentPath);
        setSkillExperts(data.skillExperts);
      }
    } catch (err) {
      console.error('Failed to fetch skill development path:', err);
    }
  };

  const handleSkillSelect = (skill) => {
    const isSelected = selectedSkills.includes(skill);
    if (isSelected) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
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
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Your Profile</h2>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/edit-fresher-profile')}
                style={{ padding: '0.5rem 1rem' }}
              >
                Edit Profile
              </button>
            </div>
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
                    linkedInProfiles?.length > 0 ? (
                      linkedInProfiles.map((profile, index) => (
                        <div key={index} className="profile-card">
                          {profile.thumbnailUrl && (
                            <img 
                              src={profile.thumbnailUrl} 
                              alt={profile.name} 
                              className="profile-image"
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%',
                                marginBottom: '10px'
                              }}
                            />
                          )}
                          <h3>{profile.name}</h3>
                          <p className="profile-title">{profile.title}</p>
                          <p className="profile-company">{profile.company}</p>
                          {profile.description && (
                            <p className="profile-description" style={{ 
                              fontSize: '0.9em',
                              color: '#666',
                              margin: '10px 0'
                            }}>
                              {profile.description}
                            </p>
                          )}
                          <div className="profile-actions">
                            <a 
                              href={profile.profileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-secondary"
                            >
                              View Profile
                            </a>
                            {savedProfiles?.some(saved => saved.profileUrl === profile.profileUrl) ? (
                              <button
                                className="btn-danger"
                                onClick={() => {
                                  const savedProfile = savedProfiles.find(p => p.profileUrl === profile.profileUrl);
                                  if (savedProfile) {
                                    handleRemoveProfile(savedProfile._id);
                                  }
                                }}
                              >
                                Unsave
                              </button>
                            ) : (
                              <button
                                className="btn-primary"
                                onClick={() => handleSaveProfile(profile)}
                              >
                                Save Profile
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-profiles-message" style={{ textAlign: 'center', padding: '20px' }}>
                        <p>No profiles found for this role. Try adjusting your search criteria.</p>
                      </div>
                    )
                  ) : (
                    <div className="loading-spinner"></div>
                  )}
                </div>
              </div>

              {/* Saved Profiles Section */}
              <div className="dashboard-card saved-profiles">
                <h2>Saved Profiles</h2>
                <div className="profiles-list">
                  {savedProfiles?.length > 0 ? (
                    savedProfiles.map((profile, index) => (
                      <div key={index} className="profile-card">
                        {profile.thumbnailUrl && (
                          <img 
                            src={profile.thumbnailUrl} 
                            alt={profile.name} 
                            className="profile-image"
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              borderRadius: '50%',
                              marginBottom: '10px'
                            }}
                          />
                        )}
                        <h3>{profile.name}</h3>
                        <p className="profile-title">{profile.title}</p>
                        <p className="profile-company">{profile.company}</p>
                        {profile.description && (
                          <p className="profile-description" style={{ 
                            fontSize: '0.9em',
                            color: '#666',
                            margin: '10px 0'
                          }}>
                            {profile.description}
                          </p>
                        )}
                        <div className="profile-actions">
                          <a 
                            href={profile.profileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-secondary"
                          >
                            View Profile
                          </a>
                          <button
                            className="btn-danger"
                            onClick={() => handleRemoveProfile(profile._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-profiles-message">No saved profiles yet. Browse profiles below and save them for future reference.</p>
                  )}
                </div>
              </div>

              <div className="dashboard-card skill-analysis">
                {skillGaps ? (
                  <>
                    <div className="skill-analysis-header">
                      <h2>Skill Gap Analysis for {selectedRole}</h2>
                      <button 
                        className="btn-download"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(
                              `http://localhost:5000/api/career/fresher/roadmap-pdf/${encodeURIComponent(selectedRole)}`,
                              {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              }
                            );
                            
                            if (!response.ok) {
                              throw new Error('Failed to download PDF');
                            }

                            // Get the blob from the response
                            const blob = await response.blob();
                            
                            // Create a URL for the blob
                            const url = window.URL.createObjectURL(blob);
                            
                            // Create a temporary link element
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `career-roadmap-${selectedRole.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                            
                            // Append to document, click, and cleanup
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
                          {skillGaps?.currentSkillsAssessment?.strengths?.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          )) || (
                            <p>No current skills assessment available</p>
                          )}
                        </div>
                        <p className="skills-relevance">{skillGaps?.currentSkillsAssessment?.relevance}</p>
                      </div>

                      <div className="missing-skills">
                        <h3>Skills to Develop</h3>
                        <div className="skills-selection">
                          {skillGaps?.missingSkills?.map((skill, index) => (
                            <div key={index} className="skill-gap-item">
                              <div className="skill-header">
                                <h4>{skill.skill}</h4>
                                <button 
                                  className={`btn-select ${selectedSkills.includes(skill.skill) ? 'selected' : ''}`}
                                  onClick={() => handleSkillSelect(skill.skill)}
                                >
                                  {selectedSkills.includes(skill.skill) ? '✓ Selected' : 'Select for Development'}
                                </button>
                              </div>
                              <div className="skill-details">
                                <span className={`priority ${skill.priority?.toLowerCase()}`}>
                                  {skill.priority || 'Medium'} Priority
                                </span>
                                <span>⏱️ {skill.timeToAcquire || 'Not specified'}</span>
                              </div>
                              <p className="skill-impact">{skill.impact || 'Improves job readiness'}</p>
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

                        {selectedSkills.length > 0 && (
                          <button 
                            className="btn-primary"
                            onClick={() => fetchSkillDevelopmentPath(selectedSkills)}
                            style={{ marginTop: '1rem' }}
                          >
                            Get Development Path for Selected Skills
                          </button>
                        )}
                      </div>

                      {developmentPath && (
                        <div className="development-path">
                          <h3>Your Learning Journey</h3>
                          <p className="total-duration">
                            Estimated Total Duration: {developmentPath.estimatedTotalDuration}
                          </p>
                          <div className="learning-phases">
                            {developmentPath.phases.map((phase, index) => (
                              <div key={index} className="phase-card">
                                <div className="phase-header">
                                  <h4>Phase {phase.phase}: {phase.title}</h4>
                                  <span className="phase-duration">{phase.duration}</span>
                                </div>
                                <div className="focus-areas">
                                  {phase.focusAreas.map((area, idx) => (
                                    <span key={idx} className="focus-tag">{area}</span>
                                  ))}
                                </div>
                                <div className="phase-skills">
                                  {phase.skills.map((skill, idx) => (
                                    <div key={idx} className="skill-card">
                                      <h5>{skill.skill}</h5>
                                      <p>Target Level: {skill.level}</p>
                                      <div className="learning-resources">
                                        {skill.resources.map((resource, resIdx) => (
                                          <a 
                                            key={resIdx}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resource-link"
                                          >
                                            <span className="resource-type">{resource.type}</span>
                                            <span className="resource-name">{resource.name}</span>
                                            <span className="resource-duration">{resource.duration}</span>
                                            <span className={`resource-cost ${resource.cost}`}>
                                              {resource.cost}
                                            </span>
                                          </a>
                                        ))}
                                      </div>
                                      {skill.projects?.length > 0 && (
                                        <div className="practice-projects">
                                          <h6>Practice Projects</h6>
                                          {skill.projects.map((project, projIdx) => (
                                            <div key={projIdx} className="project-card">
                                              <h6>{project.title}</h6>
                                              <p>{project.description}</p>
                                              <span className="difficulty-tag">
                                                {project.difficulty}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="phase-milestones">
                                  <h6>Milestones:</h6>
                                  <ul>
                                    {phase.milestones.map((milestone, idx) => (
                                      <li key={idx}>{milestone}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {skillExperts && (
                        <div className="expert-profiles">
                          <h3>Learn from the Experts</h3>
                          {skillExperts.map((skillExpert, index) => (
                            <div key={index} className="skill-experts-section">
                              <h4>{skillExpert.skill} Experts</h4>
                              <div className="expert-cards">
                                {skillExpert.expertProfiles.map((expert, idx) => (
                                  <div key={idx} className="expert-card">
                                    {expert.thumbnailUrl && (
                                      <img 
                                        src={expert.thumbnailUrl}
                                        alt={expert.name}
                                        className="expert-image"
                                      />
                                    )}
                                    <div className="expert-info">
                                      <h5>{expert.name}</h5>
                                      <p className="expert-title">{expert.title}</p>
                                      <p className="expert-company">{expert.company}</p>
                                      <div className="expert-certifications">
                                        {expert.certifications?.map((cert, certIdx) => (
                                          <span key={certIdx} className="cert-tag">{cert}</span>
                                        ))}
                                      </div>
                                      <a 
                                        href={expert.profileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary"
                                      >
                                        View Profile
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
