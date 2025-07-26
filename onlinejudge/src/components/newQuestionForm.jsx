import { useState } from 'react';
import axios from 'axios';
import '../index.css'; // make sure this import includes .two-column-wrapper

export default function NewQuestionForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
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
      setForm({ title: '', description: '', difficulty: 'Easy', testInput: '', testOutput: '' });
    } catch (err) {
      showDialogMessage(err.response?.data?.message || 'Error creating question.', false);
    }
  };

  return (
    <>
      <div className="two-column-wrapper">
        {/* Left Column */}
        <div className="flex flex-col p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-6">Problem Details</h1>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">
              Problem Title *
            </label>
            <input
              name="title"
              placeholder="e.g., Two Sum, Reverse Linked List..."
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">
              Difficulty Level *
            </label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-3">
              Problem Description *
            </label>
            <textarea
              name="description"
              placeholder="Write a detailed problem description here..."
              value={form.description}
              onChange={handleChange}
              required
              className="w-full h-full px-6 py-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <div className="text-center border-b border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold">Test Cases</h1>
          </div>
          <div className="flex-1 flex flex-col p-8 space-y-6">
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-semibold mb-3">
                Sample Input *
              </label>
              <textarea
                name="testInput"
                placeholder="Example:&#10;[2,7,11,15]&#10;9..."
                value={form.testInput}
                onChange={handleChange}
                required
                className="flex-1 w-full px-6 py-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-semibold mb-3">
                Expected Output *
              </label>
              <textarea
                name="testOutput"
                placeholder="Example:&#10;[0,1]..."
                value={form.testOutput}
                onChange={handleChange}
                required
                className="flex-1 w-full px-6 py-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Submit Button */}
      <div className="submit-container">
        <button
          onClick={handleSubmit}
          className="submit-btn"
        >
          <span>Create Problem</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Dialog Box */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className={`dialog-box ${isSuccess ? 'dialog-success' : 'dialog-error'}`}>
            <div className="dialog-icon">
              {isSuccess ? '✅' : '❌'}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isSuccess ? 'Success!' : 'Error!'}
            </h3>
            <p className="text-gray-300">{message}</p>
          </div>
        </div>
      )}
    </>
  );
}