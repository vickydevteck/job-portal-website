import { useState } from "react";
import API_URL from "./api";

function AddJob() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
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
      const response = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Job added successfully!");
        setFormData({
          title: "",
          company: "",
          location: "",
          salary: "",
          description: "",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server se connect nahi ho paya.");
    }
  };

  return (
    <div>
      <h2>Add New Job</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <input
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <input
          name="salary"
          type="number"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Job</button>
      </form>
    </div>
  );
}

export default AddJob;