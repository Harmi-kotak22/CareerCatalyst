import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const StudentProfile = () => {
  const [skills, setSkills] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok && data.user.skills?.length > 0) {
          setSkills(data.user.skills);
        } else {
          setSkills(['']);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, [navigate]);

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = value;
    setSkills(updatedSkills);
  };

  const addSkillField = () => {
    setSkills([...skills, '']);
  };

  const removeSkillField = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Filter out empty skills
    const filteredSkills = skills.filter(skill => skill.trim() !== '');

    if (filteredSkills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills: filteredSkills }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/student-dashboard');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const location = useLocation();
  const isEditing = location.pathname === '/edit-profile';

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h2 className="auth-title">
          {isEditing ? 'Edit Your Skills' : 'Complete Your Profile'}
        </h2>
        <p className="auth-subtitle">
          {isEditing 
            ? 'Update your skills to improve your profile'
            : 'Add your skills to get started'}
        </p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="skills-container">
            {skills.map((skill, index) => (
              <div key={index} className="skill-input-group">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder="Enter a skill"
                  className="skill-input"
                />
                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkillField(index)}
                    className="remove-skill-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addSkillField}
            className="btn-secondary"
          >
            + Add Another Skill
          </button>

          {error && <div className="auth-error">{error}</div>}
          
          <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
            {isEditing && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/student-dashboard')}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary-large">
              {isEditing ? 'Save Changes' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default StudentProfile;