import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import StudentProfile from './components/StudentProfile';
import './App.css';

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <Navbar />
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Accelerate Your <span className="highlight">Career Journey</span>
            </h1>
            <p className="hero-subtitle">
              Empower your professional growth with personalized guidance, resources, and opportunities tailored for students, freshers, and experienced professionals.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={() => navigate('/register')}>Start Your Journey</button>
              <button className="btn-outline-large">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration">
              <div className="illustration-circle circle-1"></div>
              <div className="illustration-circle circle-2"></div>
              <div className="illustration-circle circle-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-container">
          <div className="section-header">
            <h2>Why Choose CareerCatalyst?</h2>
            <p>Everything you need to build a successful career</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon icon-students">👨‍🎓</div>
              <h3>For Students</h3>
              <p>Get career guidance, internship opportunities, and skill development resources to kickstart your professional journey.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-freshers">🚀</div>
              <h3>For Freshers</h3>
              <p>Access entry-level job opportunities, resume building tools, and interview preparation resources.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-experienced">💼</div>
              <h3>For Experienced</h3>
              <p>Discover advanced career opportunities, networking events, and professional development programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3 className="stat-number">10K+</h3>
            <p className="stat-label">Active Users</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Partner Companies</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">95%</h3>
            <p className="stat-label">Success Rate</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">24/7</h3>
            <p className="stat-label">Support Available</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-content">
          <div className="about-text">
            <h2>About CareerCatalyst</h2>
            <p>
              CareerCatalyst is your trusted partner in professional development. We connect talented individuals with opportunities that match their skills, aspirations, and career goals.
            </p>
            <p>
              Our platform leverages cutting-edge technology and industry expertise to provide personalized career guidance, helping you navigate every stage of your professional journey.
            </p>
            <button className="btn-primary">Discover More</button>
          </div>
          <div className="about-image">
            <div className="about-placeholder">
              <div className="placeholder-icon">🎯</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Career?</h2>
          <p>Join thousands of professionals who have already accelerated their career growth with CareerCatalyst.</p>
          <button className="btn-primary-large" onClick={() => navigate('/register')}>Get Started Free</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CareerCatalyst</h3>
            <p>Empowering careers, one step at a time.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>Email: info@careercatalyst.com</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" className="social-icon">LinkedIn</a>
              <a href="#" className="social-icon">Twitter</a>
              <a href="#" className="social-icon">Facebook</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CareerCatalyst. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/edit-profile" element={<StudentProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
