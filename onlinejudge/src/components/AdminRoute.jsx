import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) return <p>Loading...</p>;
  if(!user) return <Navigate to="/" />;
  if (user.role !== 'admin') return <Navigate to="/no-access" />;
  return <Outlet />;
}