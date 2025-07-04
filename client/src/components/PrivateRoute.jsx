import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  console.log("🧪 PrivateRoute user:", user); // Add this line
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;