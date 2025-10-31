import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const CareerInsights = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [recommendations, setRecommendations] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [skillGaps, setSkillGaps] = useState(null);
    const [learningPlan, setLearningPlan] = useState(null);
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

            const res = await fetch('http://localhost:5000/api/ai/recommendations', {
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
            setError('Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    };

    const fetchSkillGaps = async (role) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/ai/skill-gaps/${encodeURIComponent(role)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                setSkillGaps(data.skillGaps);
                fetchLearningPlan(data.skillGaps);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch skill gaps');
        }
    };

    const fetchLearningPlan = async (gaps) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/ai/learning-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ skillGaps: gaps })
            });

            const data = await res.json();
            if (res.ok) {
                setLearningPlan(data.roadmap);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch learning plan');
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
                    <h1>Career Insights</h1>
                    <p>Discover career opportunities based on your skills</p>
                </div>

                <div className="dashboard-grid">
                    {/* Career Recommendations */}
                    <div className="dashboard-card">
                        <h2>Recommended Roles</h2>
                        <div className="recommendations-list">
                            {recommendations?.careerRoles.map((role, index) => (
                                <div 
                                    key={index} 
                                    className={`role-card ${selectedRole === role.title ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedRole(role.title);
                                        fetchSkillGaps(role.title);
                                    }}
                                >
                                    <h3>{role.title}</h3>
                                    <div className="role-match">
                                        Match: {role.match}
                                    </div>
                                    <p>{role.description}</p>
                                    <div className="role-details">
                                        <span>💰 {role.salary}</span>
                                        <span>📈 {role.demand}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skill Gaps Analysis */}
                    {selectedRole && skillGaps && (
                        <div className="dashboard-card">
                            <h2>Skill Gaps for {selectedRole}</h2>
                            <div className="skill-gaps-list">
                                {skillGaps.map((gap, index) => (
                                    <div key={index} className="skill-gap-item">
                                        <h3>{gap.skill}</h3>
                                        <div className="gap-details">
                                            <span className={`importance ${gap.importance}`}>
                                                {gap.importance}
                                            </span>
                                            <span>⏱️ {gap.timeToLearn}</span>
                                            <span>🎯 Priority: {gap.priority}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Learning Roadmap */}
                    {learningPlan && (
                        <div className="dashboard-card full-width">
                            <h2>Your Learning Roadmap</h2>
                            <div className="roadmap-timeline">
                                {learningPlan.map((phase, index) => (
                                    <div key={index} className="roadmap-phase">
                                        <div className="phase-header">
                                            <h3>Phase {phase.phase}</h3>
                                            <span>{phase.duration}</span>
                                        </div>
                                        <div className="phase-skills">
                                            {phase.skills.map((skill, skillIndex) => (
                                                <div key={skillIndex} className="skill-plan">
                                                    <h4>{skill.skill}</h4>
                                                    <div className="resources-list">
                                                        {skill.resources.map((resource, resourceIndex) => (
                                                            <a 
                                                                key={resourceIndex}
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="resource-card"
                                                            >
                                                                <span className="resource-type">
                                                                    {resource.type}
                                                                </span>
                                                                <h5>{resource.title}</h5>
                                                                <span className="platform">
                                                                    {resource.platform}
                                                                </span>
                                                                <span className="duration">
                                                                    {resource.duration}
                                                                </span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
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

export default CareerInsights;