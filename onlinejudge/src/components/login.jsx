import { useState, useEffect } from 'react';
import './Login.css';

const Login = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: "⚡",
      title: "Lightning-Fast Code Execution",
      description: "Execute your code in milliseconds with our optimized compiler infrastructure",
      details: "Support for real-time code execution with instant feedback"
    },
    {
      icon: "🌐",
      title: "Multi-Language Support",
      description: "Code in Python, Java, C++, JavaScript, and Python",
      details: "Comprehensive language ecosystem with latest versions"
    },
    {
      icon: "🤖",
      title: "AI-Powered Assistance",
      description: "Get intelligent code suggestions and debugging help from our AI",
      details: "Advanced AI integration for enhanced coding experience"
    },
    {
      icon: "🏆",
      title: "Competitive Programming",
      description: "Practice with thousands of problems and compete with others",
      details: "Complete online judge platform for skill development"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    window.open("http://localhost:5001/auth/google", "_self");
  };

  return (
    <div className="onboarding-container">
      {/* Background Elements */}
      <div className="background-grid"></div>
      <div className="floating-elements">
        <div className="floating-element" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>{'<>'}</div>
        <div className="floating-element" style={{ top: '20%', right: '15%', animationDelay: '1s' }}>{'{ }'}</div>
        <div className="floating-element" style={{ bottom: '30%', left: '5%', animationDelay: '2s' }}>{'[ ]'}</div>
        <div className="floating-element" style={{ bottom: '15%', right: '10%', animationDelay: '3s' }}>{'( )'}</div>
      </div>

      {/* Main Content */}
      <div className="onboarding-content">
        {/* Header Section */}
        <div className="header-section">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            <h1 className="platform-title">CodeJudge Pro</h1>
          </div>
          <p className="platform-subtitle">
            The ultimate online coding platform for developers and competitive programmers
          </p>
        </div>

        {/* Features Showcase */}
        <div className="features-showcase">
          <div className="feature-carousel">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${index === currentFeature ? 'active' : ''}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <span className="feature-details">{feature.details}</span>
              </div>
            ))}
          </div>

          {/* Feature Indicators */}
          <div className="feature-indicators">
            {features.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentFeature ? 'active' : ''}`}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">15+</div>
            <div className="stat-label">Languages</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Problems</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Developers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2 className="cta-title">Ready to Start Coding?</h2>
          <p className="cta-subtitle">Join thousands of developers improving their skills</p>

          <button className="google-login-btn" onClick={handleGoogleLogin}>
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="login-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Instant access to all features</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Save your progress automatically</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Join the coding community</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
