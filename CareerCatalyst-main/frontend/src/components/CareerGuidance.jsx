import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const CareerGuidance = () => {
    const [recommendations, setRecommendations] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [skillGaps, setSkillGaps] = useState(null);
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCareerRecommendations();
    }, []);

    const fetchCareerRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch('http://localhost:5000/api/career/recommendations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                setRecommendations(data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch career recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/career/skill-gaps/${encodeURIComponent(role.role)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                setSkillGaps(data.analysis);
                // Request roadmap for missing skills
                const targetSkills = data.analysis.missingSkills.map(skill => skill.skill);
                fetchRoadmap(targetSkills);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch skill gaps');
        }
    };

    const fetchRoadmap = async (targetSkills) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/career/roadmap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetSkills })
            });

            const data = await res.json();
            if (res.ok) {
                setRoadmap(data.roadmap);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch learning roadmap');
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
                    <h1>Career Guidance</h1>
                    <p>Explore career paths based on your skills</p>
                </div>

                <div className="career-guidance-grid">
                    {/* Career Recommendations Section */}
                    <div className="dashboard-card">
                        <h2>Recommended Career Paths</h2>
                        <div className="career-cards">
                            {recommendations?.careerMatches.map((role, index) => (
                                <div 
                                    key={index}
                                    className={`career-card ${selectedRole?.role === role.role ? 'selected' : ''}`}
                                    onClick={() => handleRoleSelect(role)}
                                >
                                    <h3>{role.role}</h3>
                                    <div className="match-percentage">
                                        Match: {role.matchPercentage}
                                    </div>
                                    <p>{role.description}</p>
                                    <div className="career-details">
                                        <span>💰 {role.averageSalary}</span>
                                        <span>📈 {role.marketDemand} Demand</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skill Gap Analysis Section */}
                    {skillGaps && (
                        <div className="dashboard-card">
                            <h2>Skill Gap Analysis</h2>
                            <div className="skill-assessment">
                                <div className="current-skills">
                                    <h3>Your Strengths</h3>
                                    <div className="skills-list">
                                        {skillGaps.currentSkillsAssessment.strengths.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="missing-skills">
                                    <h3>Skills to Acquire</h3>
                                    {skillGaps.missingSkills.map((skill, index) => (
                                        <div key={index} className="missing-skill-item">
                                            <h4>{skill.skill}</h4>
                                            <div className="skill-details">
                                                <span className={`priority ${skill.priority.toLowerCase()}`}>
                                                    {skill.priority} Priority
                                                </span>
                                                <span>⏱️ {skill.timeToAcquire}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Learning Roadmap Section */}
                    {roadmap && (
                        <div className="dashboard-card full-width">
                            <h2>Your Learning Roadmap</h2>
                            <p className="total-duration">
                                Estimated completion time: {roadmap.estimatedTotalDuration}
                            </p>
                            <div className="learning-roadmap">
                                {roadmap.phases.map((phase, index) => (
                                    <div key={index} className="roadmap-phase">
                                        <div className="phase-header">
                                            <h3>Phase {phase.phase}: {phase.title}</h3>
                                            <span className="phase-duration">{phase.duration}</span>
                                        </div>
                                        <div className="phase-content">
                                            <div className="focus-areas">
                                                {phase.focusAreas.map((area, idx) => (
                                                    <span key={idx} className="focus-tag">{area}</span>
                                                ))}
                                            </div>
                                            {phase.skills.map((skill, skillIdx) => (
                                                <div key={skillIdx} className="skill-learning-plan">
                                                    <h4>{skill.skill}</h4>
                                                    <p>Target Level: {skill.level}</p>
                                                    <div className="learning-resources">
                                                        <h5>Resources:</h5>
                                                        <div className="resources-grid">
                                                            {skill.resources.map((resource, resIdx) => (
                                                                <a
                                                                    key={resIdx}
                                                                    href={resource.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="resource-card"
                                                                >
                                                                    <span className="resource-type">
                                                                        {resource.type}
                                                                    </span>
                                                                    <h6>{resource.name}</h6>
                                                                    <span className="platform-name">
                                                                        {resource.platform}
                                                                    </span>
                                                                    <div className="resource-meta">
                                                                        <span>{resource.duration}</span>
                                                                        <span>{resource.cost}</span>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {skill.projects && (
                                                        <div className="practice-projects">
                                                            <h5>Practice Projects:</h5>
                                                            {skill.projects.map((project, projIdx) => (
                                                                <div key={projIdx} className="project-card">
                                                                    <h6>{project.title}</h6>
                                                                    <p>{project.description}</p>
                                                                    <div className="project-meta">
                                                                        <span className="difficulty">
                                                                            {project.difficulty}
                                                                        </span>
                                                                        <div className="project-skills">
                                                                            {project.skills.map((skill, skillIdx) => (
                                                                                <span key={skillIdx} className="skill-tag">
                                                                                    {skill}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="phase-milestones">
                                                <h5>Milestones:</h5>
                                                <ul>
                                                    {phase.milestones.map((milestone, milestoneIdx) => (
                                                        <li key={milestoneIdx}>{milestone}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CareerGuidance;