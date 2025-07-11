const Login = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    window.open("http://localhost:5001/auth/google", "_self");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login with Google</h2>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;