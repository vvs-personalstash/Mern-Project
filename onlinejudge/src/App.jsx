import './App.css'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./components/login";
import Dashboard from "./components/Dashboard";
import QuestionDetail from "./components/QuestionDetail";
import Profile from "./components/Profile";
import PrivateRoute from "./components/privateRoute";
import AdminRoute from "./components/AdminRoute";
import NewQuestionForm from "./components/newQuestionForm";

function App() {
  return (
    <GoogleOAuthProvider clientId="398334627069-dfnfq05pn3lf9k2slr494otj0qj50d1b.apps.googleusercontent.com">
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

    </GoogleOAuthProvider>
  );
}

export default App
