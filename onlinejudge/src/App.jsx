import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/login";
import Dashboard from "./components/Dashboard";
import QuestionDetail from "./components/QuestionDetail";
import Profile from "./components/Profile";
import PrivateRoute from "./components/privateRoute";
import AdminRoute from "./components/AdminRoute";
import NewQuestionForm from "./components/newQuestionForm";

function App() {
  console.log('App component rendering');
  
  return (
    <GoogleOAuthProvider clientId="398334627069-dfnfq05pn3lf9k2slr494otj0qj50d1b.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/question/:questionId" element={
              <PrivateRoute>
                <QuestionDetail />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route element={<AdminRoute />}>
              <Route path="/admin/questions/new" element={<NewQuestionForm />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App