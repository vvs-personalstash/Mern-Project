import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    easyQuestions: 0,
    mediumQuestions: 0,
    hardQuestions: 0,
    solvedQuestions: 0
  });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);

      // Calculate stats
      const totalQuestions = data.length;
      const easyQuestions = data.filter(q => q.difficulty === 'Easy').length;
      const mediumQuestions = data.filter(q => q.difficulty === 'Medium').length;
      const hardQuestions = data.filter(q => q.difficulty === 'Hard').length;

      setStats({
        totalQuestions,
        easyQuestions,
        mediumQuestions,
        hardQuestions,
        solvedQuestions: 0 // This would come from user progress in a real app
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    window.location.href = '/';
  };

  const handleQuestionClick = (question) => {
    navigate(`/question/${question._id}`, { state: { question } });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': '#00b894',
      'Medium': '#fdcb6e',
      'Hard': '#e17055'
    };
    return colors[difficulty] || '#6b7280';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      'Easy': '🟢',
      'Medium': '🟡',
      'Hard': '🔴'
    };
    return icons[difficulty] || '⚪';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Error loading dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchQuestions} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="platform-title">
              <span className="logo-icon">⚡</span>
              CodeJudge Pro
            </h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">Welcome, {user?.email?.split('@')[0]}</span>
              <div className="user-dropdown">
                <div
                  className="user-avatar"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                {showProfileDropdown && (
                  <div className="dropdown-menu">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileDropdown(false);
                      }}
                      className="dropdown-item"
                    >
                      <span className="dropdown-icon">👤</span>
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowProfileDropdown(false);
                      }}
                      className="dropdown-item"
                    >
                      <span className="dropdown-icon">🏠</span>
                      Dashboard
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout"
                    >
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Ready to Code?</h1>
            <p className="hero-subtitle">
              Challenge yourself with our collection of coding problems and improve your programming skills.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalQuestions}</h3>
                <p className="stat-label">Total Problems</p>
              </div>
            </div>

            <div className="stat-card easy">
              <div className="stat-icon">🟢</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.easyQuestions}</h3>
                <p className="stat-label">Easy</p>
              </div>
            </div>

            <div className="stat-card medium">
              <div className="stat-icon">🟡</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.mediumQuestions}</h3>
                <p className="stat-label">Medium</p>
              </div>
            </div>

            <div className="stat-card hard">
              <div className="stat-icon">🔴</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.hardQuestions}</h3>
                <p className="stat-label">Hard</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Problems Section */}
        <section className="problems-section">
          <div className="section-header">
            <h2 className="section-title">Available Problems</h2>
            <p className="section-subtitle">Start solving problems to improve your coding skills</p>
          </div>

          <div className="problems-grid">
            {questions.slice(0, 6).map((question, index) => (
              <div
                key={question._id}
                className="problem-card"
                onClick={() => handleQuestionClick(question)}
              >
                <div className="problem-header">
                  <div className="problem-id">#{question.qid}</div>
                  <div
                    className="difficulty-badge"
                    style={{
                      backgroundColor: getDifficultyColor(question.difficulty || 'Easy'),
                      color: '#ffffff'
                    }}
                  >
                    {getDifficultyIcon(question.difficulty || 'Easy')} {question.difficulty || 'Easy'}
                  </div>
                </div>

                <div className="problem-content">
                  <h3 className="problem-title">{question.title}</h3>
                  <p className="problem-description">
                    {question.description.length > 100
                      ? question.description.substring(0, 100) + '...'
                      : question.description}
                  </p>
                </div>

                <div className="problem-footer">
                  <div className="problem-status">
                    <span className="status-dot"></span>
                    <span className="status-text">Not Attempted</span>
                  </div>
                  <div className="solve-arrow">→</div>
                </div>
              </div>
            ))}
          </div>

          {questions.length > 6 && (
            <div className="view-all-section">
              <button
                className="view-all-btn"
                onClick={() => navigate('/problems')}
              >
                View All Problems ({questions.length})
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
