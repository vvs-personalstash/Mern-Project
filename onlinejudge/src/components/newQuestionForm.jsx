import { useState } from 'react';
import axios from 'axios';
import '../index.css'; // make sure this import includes .two-column-wrapper

export default function NewQuestionForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    hints: '',
    sampleInput: '',
    sampleOutput: '',
    testInput: '',
    testOutput: ''
  });
  const [message, setMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showDialogMessage = (msg, success) => {
    setMessage(msg);
    setIsSuccess(success);
    setShowDialog(true);
    setTimeout(() => {
      setShowDialog(false);
      setMessage('');
    }, 3000);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        showDialogMessage('You must be logged in as an admin to create questions.', false);
        return;
      }
      await axios.post(
        'http://localhost:5001/admin/questions',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showDialogMessage('Question created successfully!', true);
      setForm({ title: '', description: '', difficulty: 'Easy', hints: '', sampleInput: '', sampleOutput: '', testInput: '', testOutput: '' });
    } catch (err) {
      showDialogMessage(err.response?.data?.message || 'Error creating question.', false);
    }
  };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '2rem 0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '0.5rem'
            }}>Create New Problem</h1>
            <p style={{
              color: '#9ca3af'
            }}>Add a new coding challenge to your platform</p>
          </div>

          {/* Main Form Container */}
          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '2rem',
              padding: '2rem'
            }}>
              
              {/* Left Column - Problem Details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{
                  borderBottom: '1px solid #374151',
                  paddingBottom: '1rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    📝 Problem Details
                  </h2>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#d1d5db',
                    marginBottom: '0.5rem'
                  }}>
                    Problem Title *
                  </label>
                  <input
                    name="title"
                    placeholder="e.g., Two Sum, Reverse Linked List..."
                    value={form.title}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#374151',
                      border: '1px solid #4b5563',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4b5563';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#d1d5db',
                    marginBottom: '0.5rem'
                  }}>
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#374151',
                      border: '1px solid #4b5563',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Easy" style={{background: '#374151'}}>🟢 Easy</option>
                    <option value="Medium" style={{background: '#374151'}}>🟡 Medium</option>
                    <option value="Hard" style={{background: '#374151'}}>🔴 Hard</option>
                  </select>
                </div>

                <div style={{flex: '1'}}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#d1d5db',
                    marginBottom: '0.5rem'
                  }}>
                    Problem Description *
                  </label>
                  <textarea
                    name="description"
                    placeholder="Write a detailed problem description here..."
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={8}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#374151',
                      border: '1px solid #4b5563',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                      fontSize: '0.875rem',
                      resize: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4b5563';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#d1d5db',
                    marginBottom: '0.5rem'
                  }}>
                    💡 Hints (one per line, optional)
                  </label>
                  <textarea
                    name="hints"
                    placeholder="Hint 1: Try using a hash map for O(1) lookups&#10;Hint 2: Consider the two-pointer technique&#10;Hint 3: Think about edge cases..."
                    value={form.hints}
                    onChange={handleChange}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#374151',
                      border: '1px solid #4b5563',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                      fontSize: '0.875rem',
                      resize: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4b5563';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Right Column - Examples & Test Cases */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{
                  borderBottom: '1px solid #374151',
                  paddingBottom: '1rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    🔍 Examples & Test Cases
                  </h2>
                </div>

                {/* Sample Input/Output Section */}
                <div style={{
                  background: 'rgba(31, 41, 55, 0.6)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '1px solid #4b5563'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#ffffff',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    👁️ Visible to Users
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#d1d5db',
                        marginBottom: '0.5rem'
                      }}>
                        Sample Input *
                      </label>
                      <textarea
                        name="sampleInput"
                        placeholder="nums = [2,7,11,15]&#10;target = 9"
                        value={form.sampleInput}
                        onChange={handleChange}
                        required
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#374151',
                          border: '1px solid #4b5563',
                          color: '#ffffff',
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                          fontSize: '0.875rem',
                          resize: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#4b5563';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#d1d5db',
                        marginBottom: '0.5rem'
                      }}>
                        Sample Output *
                      </label>
                      <textarea
                        name="sampleOutput"
                        placeholder="[0,1]"
                        value={form.sampleOutput}
                        onChange={handleChange}
                        required
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#374151',
                          border: '1px solid #4b5563',
                          color: '#ffffff',
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                          fontSize: '0.875rem',
                          resize: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#4b5563';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Test Cases Section */}
                <div style={{
                  background: 'rgba(127, 29, 29, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '1px solid rgba(185, 28, 28, 0.5)'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#ffffff',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    🔒 Hidden Test Cases
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#d1d5db',
                        marginBottom: '0.5rem'
                      }}>
                        Test Input *
                      </label>
                      <textarea
                        name="testInput"
                        placeholder="Test case input for evaluation..."
                        value={form.testInput}
                        onChange={handleChange}
                        required
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#374151',
                          border: '1px solid #dc2626',
                          color: '#ffffff',
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                          fontSize: '0.875rem',
                          resize: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444';
                          e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#dc2626';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#d1d5db',
                        marginBottom: '0.5rem'
                      }}>
                        Test Output *
                      </label>
                      <textarea
                        name="testOutput"
                        placeholder="Expected output for test case..."
                        value={form.testOutput}
                        onChange={handleChange}
                        required
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#374151',
                          border: '1px solid #dc2626',
                          color: '#ffffff',
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                          fontSize: '0.875rem',
                          resize: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444';
                          e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#dc2626';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              padding: '2rem',
              borderTop: '1px solid #374151'
            }}>
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: '#ffffff',
                  fontWeight: '600',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontSize: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                }}
              >
                <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Problem
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Box */}
      {showDialog && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '50',
          transition: 'opacity 0.3s'
        }}>
          <div style={{
            background: '#1f2937',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%',
            margin: '0 1rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            border: `1px solid ${isSuccess ? '#10b981' : '#ef4444'}`,
            transform: 'scale(1)',
            transition: 'all 0.3s'
          }}>
            <div style={{textAlign: 'center'}}>
              <div style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1rem auto',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isSuccess ? '#10b981' : '#ef4444'
              }}>
                {isSuccess ? (
                  <svg style={{width: '2rem', height: '2rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg style={{width: '2rem', height: '2rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '0.5rem'
              }}>
                {isSuccess ? 'Success!' : 'Error!'}
              </h3>
              <p style={{color: '#d1d5db'}}>{message}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}