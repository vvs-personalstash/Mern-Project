import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
  const handleLogin = async (credentialResponse) => {
    const { credential } = credentialResponse;
    try {
      await axios.get("http://localhost:5000/auth/google", {
        withCredentials: true,
      });
    } catch (error) {
      alert("gdsigh");
      console.error("Google Login Error:", error);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <GoogleLogin onSuccess={handleLogin} onError={() => console.log('Login Failed')} />
    </div>
  );
};
export default Login;