
import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setMessage("Signup successful! You can now log in.");

      setFormData({
        name: "",
        email: "",
        password: "",
      });
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
        <h2>Create Account</h2>
        <p>Join our Job Portal today!</p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {message && <p role="status">{message}</p>}

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
