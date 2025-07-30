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

    // Wrap async logic in an inner function
    const fetchUser = async () => {
      try {
        // Fetch user data
        const response = await fetch('/api/current_user', {
          headers: { Authorization: `Bearer ${jwt}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('jwt');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('jwt');
      } finally {
        setAuthLoading(false);
      }
    };

    fetchUser();
  }, []); // Empty dependency array - only run once on mount

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
