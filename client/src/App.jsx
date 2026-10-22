
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Signup from "./components/Signup";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import AddJob from "./AddJob";
import JobList from "./JobList";
import AdminDashboard from "./AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Navbar />

      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Reset Password */}
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Home and Jobs: login required */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Home search={search} setSearch={setSearch} />
                <AddJob />
                <JobList
                  search={search}
                  setSearch={setSearch}
                />
              </>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard: admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
