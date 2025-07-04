import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadDocument from "./pages/UploadDocument";
import DocumentList from "./pages/DocumentList";
import { AuthProvider } from "./context/AuthContext"; // no need to import useAuth here
import PrivateRoute from "./components/PrivateRoute";
import SignatureReview from "./pages/SignatureReview";
import AdminDashboard from "./pages/AdminDashboard";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
        <Route path="/upload" element={<PrivateRoute><UploadDocument /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DocumentList /></PrivateRoute>} />
        <Route path="/review" element={<SignatureReview />} />
        <Route path="/admin" element={<AdminDashboard />} />

          {/* Redirect unknown paths */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
