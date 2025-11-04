import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import './Auth.css';

const FresherProfile = () => {
  const [formData, setFormData] = useState({
    skills: '',
    interestedRoles: '',
    salaryPreferences: '',
    workMode: 'remote'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname === '/edit-fresher-profile';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Only fetch existing profile data if editing
        if (isEditing) {
          const res = await fetch('http://localhost:5000/api/career/fresher-profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await res.json();
          if (res.ok && data) {
            setFormData({
              skills: data.skills.join(', '),
              interestedRoles: data.interestedRoles.join(', '),
              salaryPreferences: data.salaryPreferences,
              workMode: data.workMode
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/career/fresher-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skills: formData.skills.split(',').map(skill => skill.trim()),
          interestedRoles: formData.interestedRoles.split(',').map(role => role.trim()),
          salaryPreferences: parseInt(formData.salaryPreferences),
          workMode: formData.workMode
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Successfully created/updated profile, navigate to dashboard
        navigate('/fresher-dashboard');
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
        <div className="auth-form">
          <h2>{isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., JavaScript, React, Node.js"
                required
              />
            </div>
            <div className="form-group">
              <label>Interested Roles (comma-separated)</label>
              <input
                type="text"
                value={formData.interestedRoles}
                onChange={(e) => setFormData({ ...formData, interestedRoles: e.target.value })}
                placeholder="e.g., Frontend Developer, Full Stack Developer"
                required
              />
            </div>
            <div className="form-group">
              <label>Salary Preferences (in USD)</label>
              <input
                type="number"
                value={formData.salaryPreferences}
                onChange={(e) => setFormData({ ...formData, salaryPreferences: e.target.value })}
                placeholder="e.g., 60000"
                required
              />
            </div>
            <div className="form-group">
              <label>Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                required
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
              {isEditing && (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => navigate('/fresher-dashboard')}
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
      </div>
    </>
  );
};

export default FresherProfile;