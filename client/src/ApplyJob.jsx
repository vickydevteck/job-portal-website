import { useState } from "react";
import API_URL from "./api";

function ApplyJob({ jobId }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    resume: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/jobs/${jobId}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log("Application response:", response.status, data);

      if (response.ok) {
        alert("Application submitted successfully!");
        setFormData({ name: "", email: "", resume: "" });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server se connect nahi ho paya.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Apply for Job</h3>

      <input
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        name="resume"
        type="url"
        placeholder="Resume URL"
        value={formData.resume}
        onChange={handleChange}
        required
      />

      <button type="submit">Submit Application</button>
    </form>
  );
}

export default ApplyJob;