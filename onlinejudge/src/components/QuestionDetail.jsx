import { useContext, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './QuestionDetail.css';

const QuestionDetail = () => {
  const { user } = useContext(AuthContext);
  const { questionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(location.state?.question || null);
  const [userCode, setUserCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!question);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const [isGettingHint, setIsGettingHint] = useState(false);

  useEffect(() => {
    if (!question && questionId) {
      fetchQuestion();
    }
    if (questionId) {
      fetchUserSubmissions();
    }
  }, [questionId, question]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/questions/${questionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      const data = await response.json();
      setQuestion(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`http://localhost:5001/api/submissions/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  const handleBackToList = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    window.location.href = '/';
  };

  const runCode = async () => {
    if (!userCode.trim()) {
      setOutput('Please enter some code to run.');
      return;
    }

    setIsRunning(true);
    setOutput('Running...');

    try {
      const response = await fetch('http://localhost:3000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: userCode,
          language: language,
          input: question?.testInput || ''
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.output);
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (err) {
      setOutput(`Network Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!userCode.trim()) {
      setOutput('Please enter some code to submit.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setOutput('Submitting code...');

    try {
      const jwt = localStorage.getItem('jwt');
      const submissionResponse = await fetch('http://localhost:5001/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          questionId: question._id,
          code: userCode,
          language: language
        }),
      });

      if (submissionResponse.ok) {
        const submissionData = await submissionResponse.json();

        setSubmissionResult({
          status: submissionData.status,
          output: submissionData.output,
          submissionId: submissionData._id,
          executionTime: submissionData.executionTime
        });

        // Refresh submissions list
        fetchUserSubmissions();

        // Show detailed result in output
        const statusEmoji = submissionData.status === 'accepted' ? '✅' :
                           submissionData.status === 'wrong_answer' ? '❌' : '⚠️';

        setOutput(`${statusEmoji} Submission Result: ${submissionData.status.toUpperCase().replace('_', ' ')}\n` +
                 `Execution Time: ${submissionData.executionTime}ms\n\n` +
                 `Output:\n${submissionData.output}`);
      } else {
        const errorData = await submissionResponse.json();
        setOutput(`Submission Failed: ${errorData.message || 'Please try again.'}`);
      }
    } catch (err) {
      setOutput(`Submission Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAiHint = async () => {
    if (!userCode.trim()) {
      setAiHint('Please write some code first to get AI hints.');
      return;
    }

    setIsGettingHint(true);
    setAiHint('Getting AI feedback...');

    try {
      const response = await fetch('http://localhost:5003/agentic-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem_id: question.qid.toString(),
          user_code: userCode,
          language: language,
          user_plan: 'User is seeking hints for this problem'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiHint(data.message);
      } else {
        const errorData = await response.json();
        setAiHint(`AI Service Error: ${errorData.error || 'Failed to get hints. Please try again.'}`);
      }
    } catch (err) {
      setAiHint(`Network Error: ${err.message}. Make sure the AI service is running on port 5003.`);
    } finally {
      setIsGettingHint(false);
    }
  };

  const getCodeTemplate = (lang) => {
    const templates = {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
      python: `def solution():
    # Your code here
    pass

if __name__ == "__main__":
    solution()`,
      java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
      javascript: `function solution() {
    // Your code here
}

solution();`
    };
    return templates[lang] || templates.cpp;
  };

  const getDifficultyColor = () => {
    const colors = {
      'Easy': '#00b894',
      'Medium': '#fdcb6e',
      'Hard': '#e17055'
    };
    return colors[question?.difficulty] || '#6b7280';
  };

  const getDifficultyText = () => {
    const icons = {
      'Easy': '🟢',
      'Medium': '🟡',
      'Hard': '🔴'
    };
    const difficulty = question?.difficulty || 'Easy';
    return `${icons[difficulty]} ${difficulty}`;
  };

  if (loading) {
    return (
      <div className="question-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="question-container">
        <div className="error-message">
          <h2>Error loading question</h2>
          <p>{error || 'Question not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="retry-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-container">
      {/* Header */}
      <header className="question-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBackToList} className="back-btn">
              ← Back to Dashboard
            </button>
            <div className="question-info">
              <h1 className="question-title-header">
                #{question.qid}. {question.title}
              </h1>
              <span 
                className="difficulty-badge"
                style={{ 
                  backgroundColor: getDifficultyColor(),
                  color: '#ffffff'
                }}
              >
                {getDifficultyText()}
              </span>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.email?.split('@')[0]}</span>
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

      {/* Main Content - Split View */}
      <main className="question-main">
        <div className="question-layout">
          {/* Left Panel - Problem Description */}
          <div className="problem-panel">
            <div className="problem-content">
              <div className="section">
                <h2 className="section-title">Problem Description</h2>
                <div className="description-content">
                  {question.description.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="description-paragraph">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Example</h2>
                <div className="example-container">
                  <div className="example-item">
                    <h3 className="example-label">Input:</h3>
                    <pre className="example-code">{question.sampleInput}</pre>
                  </div>
                  <div className="example-item">
                    <h3 className="example-label">Expected Output:</h3>
                    <pre className="example-code">{question.sampleOutput}</pre>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Constraints</h2>
                <div className="constraints-content">
                  <ul className="constraints-list">
                    <li>Time Limit: 2 seconds</li>
                    <li>Memory Limit: 256 MB</li>
                    <li>Input will be provided via standard input</li>
                    <li>Output should be written to standard output</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="code-panel">
            <div className="code-header">
              <div className="code-title">
                <h2>Solution</h2>
              </div>
              <div className="code-controls">
                <div className="language-selector">
                  <label htmlFor="language">Language:</label>
                  <select 
                    id="language"
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="language-select"
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <button
                  onClick={getAiHint}
                  disabled={isGettingHint || !userCode.trim()}
                  className="run-btn"
                  style={{
                    background: !userCode.trim() ? '#4b5563' : 'rgba(168, 85, 247, 0.15)',
                    color: !userCode.trim() ? '#9ca3af' : '#a855f7',
                    borderColor: !userCode.trim() ? '#4b5563' : 'rgba(168, 85, 247, 0.3)'
                  }}
                >
                  {isGettingHint ? '🤖 Getting Hint...' : '🤖 Get AI Hint'}
                </button>
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="run-btn"
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button
                  onClick={submitCode}
                  disabled={isSubmitting || isRunning}
                  className="submit-btn"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            <div className="code-editor-container">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder={`// Write your ${language} solution here...\n\n${getCodeTemplate(language)}`}
                className="code-editor"
              />
            </div>

            {output && (
              <div className="output-section">
                <div className="output-header">
                  <h3>Output</h3>
                  <button
                    className="clear-btn"
                    onClick={() => setOutput('')}
                  >
                    Clear
                  </button>
                </div>
                <pre className="output-content">{output}</pre>
              </div>
            )}

            {/* AI Hint Section */}
            {aiHint && (
              <div className="output-section" style={{
                border: '1px solid rgba(168, 85, 247, 0.3)',
                background: 'rgba(168, 85, 247, 0.05)'
              }}>
                <div className="output-header" style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderBottom: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                  <h3 style={{color: '#a855f7'}}>🤖 AI Hint</h3>
                  <button
                    className="clear-btn"
                    onClick={() => setAiHint('')}
                    style={{
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      color: '#a855f7'
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="output-content" style={{
                  background: 'rgba(168, 85, 247, 0.02)',
                  color: '#e0e0e0',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>{aiHint}</div>
              </div>
            )}

            {/* Submissions History */}
            {submissions.length > 0 && (
              <div className="submissions-section">
                <div className="submissions-header">
                  <h3>Your Submissions</h3>
                </div>
                <div className="submissions-list">
                  {submissions.slice(0, 5).map((submission, index) => (
                    <div key={submission._id || index} className="submission-item">
                      <div className="submission-info">
                        <span className={`submission-status ${submission.status}`}>
                          {submission.status === 'accepted' ? '✓' : '✗'} {submission.status.replace('_', ' ').toUpperCase()}
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionDetail;



