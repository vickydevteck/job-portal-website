
import ApplyJob from "./ApplyJob";
import { useEffect, useState } from "react";
import API_URL from "./api";

function JobList({ search, setSearch }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
  });

  async function fetchJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/jobs`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Jobs load nahi hui.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Server se jobs ki list nahi mili.");
      }

      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function startEdit(job) {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      salary: job.salary ?? "",
      description: job.description || "",
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      company: "",
      location: "",
      salary: "",
      description: "",
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function saveEdit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Job edit karne ke liye admin login zaroori hai.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/jobs/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            salary:
              form.salary === "" ? "" : Number(form.salary),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Job update nahi hui.");
      }

      if (!data.job) {
        throw new Error(
          "Server ne updated job return nahi ki. Backend route check karein."
        );
      }

      setJobs((previousJobs) =>
        previousJobs.map((job) =>
          job._id === editingId ? data.job : job
        )
      );

      cancelEdit();
      alert("Job updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteJob(jobId) {
    const confirmDelete = window.confirm(
      "Kya aap sach mein is job ko delete karna chahte hain?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Job delete karne ke liye admin login zaroori hai.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Job delete nahi hui.");
      }

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job._id !== jobId)
      );

      if (editingId === jobId) {
        cancelEdit();
      }

      alert("Job deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredJobs = jobs.filter((job) =>
    `${job.title || ""} ${job.company || ""} ${job.location || ""}`
      .toLowerCase()
      .includes((search || "").toLowerCase())
  );

  return (
    <div id="jobs">
      <h2>Available Jobs</h2>

      <input
        type="text"
        placeholder="Search by job, company or location"
        value={search || ""}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button type="button" onClick={fetchJobs} disabled={loading}>
        {loading ? "Loading..." : "Refresh Jobs"}
      </button>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {loading && <p>Loading jobs...</p>}

      {!loading && filteredJobs.length === 0 && (
        <p>No jobs found.</p>
      )}

      {filteredJobs.map((job) => (
        <div key={job._id}>
          {editingId === job._id ? (
            <form onSubmit={saveEdit}>
              <h3>Edit Job</h3>

              <input
                name="title"
                placeholder="Job title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                name="company"
                placeholder="Company"
                value={form.company}
                onChange={handleChange}
                required
              />

              <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                required
              />

              <input
                name="salary"
                type="number"
                min="0"
                placeholder="Salary"
                value={form.salary}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Job description"
                value={form.description}
                onChange={handleChange}
                required
              />

              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <h3>{job.title}</h3>
              <p>Company: {job.company}</p>
              <p>Location: {job.location}</p>
              <p>Salary: ₹{job.salary}</p>
              <p>{job.description}</p>

              <ApplyJob jobId={job._id} />

              <button
                type="button"
                onClick={() => startEdit(job)}
              >
                Edit Job
              </button>

              <button
                type="button"
                onClick={() => deleteJob(job._id)}
              >
                Delete Job
              </button>
            </>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}

export default JobList;
