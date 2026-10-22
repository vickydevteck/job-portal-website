
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "./api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim(), password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("Login token was not received");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful!");

      navigate("/");
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Server connection failed. Please check the backend."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Welcome Back!</h2>
        <p>Login to your Job Portal account</p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <input
          type="password"
          
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        
<p style={{ textAlign: "right" }}>
  <Link to="/forgot-password">Forgot Password?</Link>
</p>


        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p role="status">{message}</p>}

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
