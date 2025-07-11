// ✅ AuthContext.jsx
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      window.history.replaceState({}, '', '/dashboard');
    }

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      setAuthLoading(false);
      return;
    }

    fetch('http://localhost:5001/api/current_user', {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
        else localStorage.removeItem('jwt');
        setAuthLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('jwt');
        setAuthLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
