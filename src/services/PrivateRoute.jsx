// PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext"; // Ensure correct path to your AuthContext

const PrivateRoute = ({ children }) => {
  const { user } = useAuth(); // Get current user from context

  // Redirect to login page if the user is not authenticated
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
