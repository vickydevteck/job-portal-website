
import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "./api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setMessage(data.message);
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Forgot Password?</h2>
        <p>Enter your registered email to receive a reset link.</p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && <p role="status">{message}</p>}

        <p>
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
