// import { useEffect, useState } from "react";

// const Dashboard = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     fetch("http://localhost:5001/api/current_user", {
//       credentials: "include",
//     })
//       .then(res => res.json())
//       .then(data => setUser(data.user));
//   }, []);

//   const handleLogout = () => {
//     fetch("http://localhost:5001/api/logout", {
//       credentials: "include",
//     })
//       .then(() => {
//         setUser(null);
//         window.location.href = "/"; // Redirect to login page
//       });
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "100px" }}>
//       <h2>Dashboard</h2>
//       {user ? (
//         <>
//           <p>Name: {user.displayName}</p>
//           <p>Email: {user.email}</p>
//           <img src={user.photo} alt="User avatar" width="100" />
//           <br />
//           <button onClick={handleLogout} style={{ marginTop: "20px" }}>
//             Logout
//           </button>
//         </>
//       ) : (
//         <p>Loading user...</p>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
// import { useEffect, useState } from 'react';

//   function Dashboard() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get('token');

//     if (token) {
//       localStorage.setItem('jwt', token); // or store in state/cookie
//       window.history.replaceState({}, '', '/dashboard'); // clean up URL
//     }

//     const jwt = localStorage.getItem('jwt');
//     if (!jwt) {
//       window.location.href = '/';
//       return;
//     }

//     fetch('http://localhost:5001/api/current_user', {
//       headers: {
//         Authorization: `Bearer ${jwt}`,
//       },
//     })
//       .then(res => res.json())
//       .then(data => setUser(data))
//       .catch(() => {
//         localStorage.removeItem('jwt');
//         window.location.href = '/';
//       });
//   }, []);

//   if (!user) return <p>Loading...</p>;

//   return (
//     <div>
//       <h1>Welcome {user.email}</h1>
//     </div>
//   );
// }

// export default Dashboard;
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome {user?.email}</h1>
    </div>
  );
}

export default Dashboard;