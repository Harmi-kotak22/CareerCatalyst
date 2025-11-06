import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const ExperiencedProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    skills: [],
    reasonForSwitch: '',
    salaryPreferences: '',
    experienceYears: '',
    workMode: '',
    additionalAchievements: ''
  });
  
  // Initialize all form values
  const [formValues, setFormValues] = useState({
    skills: [],
    reasonForSwitch: '',
    salaryPreferences: '',
    experienceYears: '',
    workMode: '',
    additionalAchievements: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if profile already exists
    checkProfile();
  }, [navigate]);

  const checkProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/career/experienced-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile(data);
          setFormValues({
            skills: data.skills || [],
            reasonForSwitch: data.reasonForSwitch || '',
            salaryPreferences: data.salaryPreferences || '',
            experienceYears: data.experienceYears || '',
            workMode: data.workMode || '',
            additionalAchievements: data.additionalAchievements || ''
          });
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };

  const handleSkillInputKeyPress = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!formValues.skills.includes(newSkill)) {
        const updatedSkills = [...formValues.skills, newSkill];
        setFormValues(prev => ({
          ...prev,
          skills: updatedSkills
        }));
        setProfile(prev => ({
          ...prev,
          skills: updatedSkills
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = formValues.skills.filter(skill => skill !== skillToRemove);
    setFormValues(prev => ({
      ...prev,
      skills: updatedSkills
    }));
    setProfile(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/career/experienced-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/experienced-dashboard');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

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
        <div className="auth-form-container profile-form">
          <h2>Complete Your Profile</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Skills</label>
              <div className="skills-input-container">
                <input
                  type="text"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onKeyPress={handleSkillInputKeyPress}
                  placeholder="Type a skill and press Enter"
                  className="skill-input"
                />
              </div>
              <div className="skills-list">
                {formValues.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Switch</label>
              <textarea
                name="reasonForSwitch"
                value={formValues.reasonForSwitch}
                onChange={handleInputChange}
                placeholder="Why are you looking for a career change?"
                required
              />
            </div>

            <div className="form-group">
              <label>Salary Preferences (Annual in INR)</label>
              <input
                type="number"
                name="salaryPreferences"
                value={formValues.salaryPreferences}
                onChange={handleInputChange}
                placeholder="Expected annual salary"
                required
              />
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="experienceYears"
                value={formValues.experienceYears}
                onChange={handleInputChange}
                placeholder="Total years of experience"
                required
              />
            </div>

            <div className="form-group">
              <label>Preferred Work Mode</label>
              <select
                name="workMode"
                value={formValues.workMode}
                onChange={handleInputChange}
                required
              >
                <option value="">Select work mode</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div className="form-group">
              <label>Additional Achievements (Optional)</label>
              <textarea
                name="additionalAchievements"
                value={formValues.additionalAchievements}
                onChange={handleInputChange}
                placeholder="Any certifications, awards, or notable projects"
              />
            </div>

            <button type="submit" className="btn-primary">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ExperiencedProfile;