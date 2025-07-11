// src/components/PrivateRoute.jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) return <p>Loading...</p>;

  return user ? children : <Navigate to="/" />;
}