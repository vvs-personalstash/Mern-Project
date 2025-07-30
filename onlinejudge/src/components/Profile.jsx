import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    wrongAnswerSubmissions: 0,
    runtimeErrorSubmissions: 0,
    acceptanceRate: 0
  });

  useEffect(() => {
    fetchUserSubmissions();
  }, []);

  const fetchUserSubmissions = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      console.log('JWT token:', jwt ? 'Present' : 'Missing');

      const response = await fetch('/api/user/submissions', {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Submissions data:', data);
        setSubmissions(data);
        calculateStats(data);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`Failed to fetch submissions: ${response.status}`);
      }
    } catch (err) {
      setError('Error loading submissions');
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (submissionsData) => {
    const total = submissionsData.length;
    const accepted = submissionsData.filter(s => s.status === 'accepted').length;
    const wrongAnswer = submissionsData.filter(s => s.status === 'wrong_answer').length;
    const runtimeError = submissionsData.filter(s => s.status === 'runtime_error').length;
    const acceptanceRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : 0;

    setStats({
      totalSubmissions: total,
      acceptedSubmissions: accepted,
      wrongAnswerSubmissions: wrongAnswer,
      runtimeErrorSubmissions: runtimeError,
      acceptanceRate: acceptanceRate
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    window.location.href = '/';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#10b981';
      case 'wrong_answer': return '#ef4444';
      case 'runtime_error': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return '✅';
      case 'wrong_answer': return '❌';
      case 'runtime_error': return '⚠️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <h1 className="page-title">My Profile</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.email?.split('@')[0]}</span>
              <div className="user-avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* User Info Section */}
        <section className="user-section">
          <div className="user-card">
            <div className="user-avatar-large">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h2 className="user-display-name">{user?.displayName || user?.email?.split('@')[0]}</h2>
              <p className="user-email">{user?.email}</p>
              <p className="user-join-date">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <h3 className="section-title">Submission Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalSubmissions}</h3>
                <p className="stat-label">Total Submissions</p>
              </div>
            </div>

            <div className="stat-card accepted">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.acceptedSubmissions}</h3>
                <p className="stat-label">Accepted</p>
              </div>
            </div>

            <div className="stat-card wrong">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.wrongAnswerSubmissions}</h3>
                <p className="stat-label">Wrong Answer</p>
              </div>
            </div>

            <div className="stat-card rate">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.acceptanceRate}%</h3>
                <p className="stat-label">Acceptance Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Submissions */}
        <section className="submissions-section">
          <h3 className="section-title">Recent Submissions</h3>
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>No submissions yet</h4>
              <p>Start solving problems to see your submission history here!</p>
              <button onClick={() => navigate('/dashboard')} className="start-coding-btn">
                Start Coding
              </button>
            </div>
          ) : (
            <div className="submissions-list">
              {submissions.slice(0, 20).map((submission, index) => (
                <div key={submission._id || index} className="submission-item">
                  <div className="submission-main">
                    <div className="submission-question">
                      <div className="question-header">
                        <h4 className="question-title">
                          #{submission.questionId?.qid || 'N/A'}. {submission.questionId?.title || 'Unknown Question'}
                        </h4>
                        {submission.questionId?.difficulty && (
                          <span className={`difficulty-badge ${submission.questionId.difficulty.toLowerCase()}`}>
                            {submission.questionId.difficulty === 'Easy' && '🟢'}
                            {submission.questionId.difficulty === 'Medium' && '🟡'}
                            {submission.questionId.difficulty === 'Hard' && '🔴'}
                            {submission.questionId.difficulty}
                          </span>
                        )}
                      </div>
                      <div className="submission-meta">
                        <span className={`submission-status ${submission.status}`}>
                          {getStatusIcon(submission.status)} {submission.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="submission-language">{submission.language}</span>
                        {submission.executionTime && (
                          <span className="submission-execution-time">
                            {submission.executionTime}ms
                          </span>
                        )}
                        <span className="submission-time">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="view-question-btn"
                      onClick={() => navigate(`/question/${submission.questionId._id}`)}
                    >
                      View Question →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <style jsx="true" global="true">{`
        .profile-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Header Styles */
        .profile-header {
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .back-btn {
          background: rgba(100, 108, 255, 0.15);
          color: #646cff;
          border: 1px solid rgba(100, 108, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .back-btn:hover {
          background: rgba(100, 108, 255, 0.25);
          border-color: rgba(100, 108, 255, 0.5);
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-name {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #646cff, #535bf2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
        }

        /* Main Content */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        /* User Section */
        .user-section {
          margin-bottom: 4rem;
        }

        .user-card {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3rem;
          display: flex;
          align-items: center;
          gap: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .user-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #646cff, #535bf2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 2.5rem;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(100, 108, 255, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.1);
        }

        .user-details h2 {
          margin: 0 0 0.75rem 0;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-email {
          color: rgba(100, 108, 255, 0.9);
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .user-join-date {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Stats Section */
        .stats-section {
          width: 100%;
          margin: 0 auto 4rem auto;
          padding: 0;
          position: relative;
          z-index: 1;
          display: block;
          overflow: visible;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 2rem 0;
          padding: 0;
          color: #ffffff;
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          text-align: left;
          line-height: 1.4;
          background: linear-gradient(135deg, #ffffff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stats-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          width: 100%;
          justify-content: center;
          align-items: stretch;
          position: relative;
          z-index: 1;
          clear: both;
        }

        .stat-card {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.75rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s ease;
          min-height: 120px;
          flex: 1 1 calc(25% - 1rem);
          max-width: calc(25% - 1rem);
          min-width: 220px;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
          z-index: 1;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          background: rgba(30, 30, 30, 0.9);
        }

        .stat-card.total:hover {
          border-color: rgba(100, 108, 255, 0.4);
        }

        .stat-card.accepted:hover {
          border-color: rgba(16, 185, 129, 0.4);
        }

        .stat-card.wrong:hover {
          border-color: rgba(239, 68, 68, 0.4);
        }

        .stat-card.rate:hover {
          border-color: rgba(245, 158, 11, 0.4);
        }

        .stat-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
          opacity: 0.9;
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1);
          opacity: 1;
        }

        .stat-content {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
          background: linear-gradient(135deg, #ffffff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.5px;
        }

        /* Submissions Section */
        .submissions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .submission-item {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .submission-item:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          background: rgba(30, 30, 30, 0.9);
        }

        .submission-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .question-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .question-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #ffffff;
          flex: 1;
        }

        .difficulty-badge {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .difficulty-badge.easy {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .difficulty-badge.medium {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .difficulty-badge.hard {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .submission-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .submission-status {
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .submission-status.accepted {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .submission-status.wrong_answer {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .submission-status.runtime_error {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .submission-language {
          background: rgba(100, 108, 255, 0.15);
          color: #646cff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .submission-execution-time {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .submission-time {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
        }

        .view-question-btn {
          background: linear-gradient(135deg, #646cff, #535bf2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .view-question-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: rgba(26, 26, 26, 0.8);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1.5rem;
        }

        .start-coding-btn {
          background: linear-gradient(135deg, #646cff, #535bf2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .start-coding-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(100, 108, 255, 0.3);
        }

        /* Loading Spinner */
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid #646cff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Error Message */
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 1rem;
          color: #ef4444;
          text-align: center;
        }

        /* Tablet Responsiveness */
        @media (max-width: 1024px) {
          .main-content {
            padding: 2rem 1.5rem;
          }

          .stats-grid {
            gap: 1rem;
          }

          .stat-card {
            flex: 1 1 calc(50% - 0.5rem);
            max-width: calc(50% - 0.5rem);
            min-width: 280px;
            padding: 1.5rem;
            min-height: 100px;
          }

          .stat-icon {
            font-size: 2rem;
          }

          .stat-number {
            font-size: 1.75rem;
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .main-content {
            padding: 1.5rem 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .user-card {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
            padding: 2rem;
          }

          .user-avatar-large {
            width: 80px;
            height: 80px;
            font-size: 2rem;
          }

          .user-details h2 {
            font-size: 1.75rem;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .stats-grid {
            gap: 0.75rem;
          }

          .stat-card {
            flex: 1 1 calc(50% - 0.375rem);
            max-width: calc(50% - 0.375rem);
            min-width: 160px;
            padding: 1.25rem;
            min-height: 90px;
            gap: 1rem;
          }

          .stat-icon {
            font-size: 1.75rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.85rem;
          }

          .submission-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .submission-meta {
            gap: 0.5rem;
          }

          .main-content {
            padding: 1rem;
          }
        }

        /* Very Small Screens */
        @media (max-width: 480px) {
          .stats-grid {
            gap: 0.5rem;
          }

          .stat-card {
            flex: 1 1 100%;
            max-width: 100%;
            min-width: 100%;
            padding: 1rem;
            min-height: 80px;
          }

          .stat-icon {
            font-size: 1.5rem;
          }

          .stat-number {
            font-size: 1.25rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
