
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Login check
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin check
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
