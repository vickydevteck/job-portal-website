
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API_URL from "./api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = searchParams.get("token");

    if (!token) {
      setMessage("Reset token missing. Please request a new link.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      setMessage(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Backend connection failed. Please check the server."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p>Enter your new password below.</p>

        <input
          type="password"
          placeholder="New Password (minimum 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {message && <p role="status">{message}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;
