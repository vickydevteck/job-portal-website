import { useEffect, useMemo, useState } from "react";
import API_URL from "./api";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Clock3,
  CircleCheck,
  CircleX,
  RefreshCw,
  Search,
  FileText,
  ArrowUpRight,
  Sparkles,
  Building2,
  Moon,
  Sun,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { useTheme } from "./ThemeContext.jsx";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { darkMode, toggleTheme } = useTheme();

  const getToken = () => localStorage.getItem("token");

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Applications load nahi ho paaye.");
      }

      const data = await response.json();

      setApplications(
        Array.isArray(data) ? data : data.applications || []
      );

      setError("");
    } catch (err) {
      setError(err.message || "Applications load karne mein problem hui.");
    }
  };

  const fetchTotalJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Jobs load nahi ho paaye.");
      }

      const data = await response.json();
      const jobs = Array.isArray(data) ? data : data.jobs || [];

      setTotalJobs(jobs.length);
    } catch (err) {
      console.error("Jobs fetch error:", err);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);
    setMessage("");

    try {
      await Promise.all([fetchApplications(), fetchTotalJobs()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/applications/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update nahi hua.");
      }

      setApplications((previous) =>
        previous.map((application) =>
          application._id === id
            ? {
                ...application,
                status: data.application?.status || status,
              }
            : application
        )
      );

      setMessage("Application status successfully update ho gaya.");
    } catch (err) {
      setError(err.message || "Status update karne mein problem hui.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const name = application.name || "";
      const email = application.email || "";
      const jobTitle = application.jobId?.title || "";
      const company = application.jobId?.company || "";

      const searchText =
        `${name} ${email} ${jobTitle} ${company}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const status = application.status || "Pending";
      const matchesFilter = filter === "All" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, search, filter]);

  const pendingCount = applications.filter(
    (application) => (application.status || "Pending") === "Pending"
  ).length;

  const selectedCount = applications.filter(
    (application) => application.status === "Selected"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const getInitials = (name) => {
    if (!name) return "A";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getResumeUrl = (resume) => {
    if (!resume) return "";

    if (resume.startsWith("http://") || resume.startsWith("https://")) {
      return resume;
    }

    return `${API_URL}/${resume.replace(/^\/+/, "")}`;
  };

  return (
    <div className={`admin-layout ${darkMode ? "dark-mode" : ""}`}>
      <aside
        className={`admin-sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
      >
        <div className="admin-brand">
          <div className="brand-icon">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <h2>
              Job<span className="brand-highlight">Sphere</span>
            </h2>
            <p>ADMIN CONSOLE</p>
          </div>

          <button
            type="button"
            className="mobile-close-button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <a
            href="#overview"
            className="sidebar-link active"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a
            href="#jobs-stat"
            className="sidebar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BriefcaseBusiness size={19} />
            <span>Jobs Overview</span>
          </a>

          <a
            href="#applications"
            className="sidebar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={19} />
            <span>Applications</span>
            <span className="sidebar-count">{applications.length}</span>
          </a>
        </nav>

        <div className="sidebar-tip">
          <div className="tip-icon">
            <Sparkles size={19} />
          </div>
          <h3>Recruit smarter</h3>
          <p>
            Review candidates and keep your hiring process organized.
          </p>
        </div>

        <div className="sidebar-footer">
          <div className="admin-avatar">AD</div>
          <div className="admin-profile-text">
            <strong>Administrator</strong>
            <span>
              <span className="online-dot" /> Dashboard active
            </span>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="admin-main" id="overview">
        <header className="admin-topbar">
          <div className="topbar-heading">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="breadcrumb">
                Workspace <span>/</span> Dashboard
              </div>
              <h1>Admin Dashboard</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              type="button"
              className="refresh-button"
              onClick={refreshDashboard}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "spin-icon" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <section className="admin-content">
          <div className="welcome-section">
            <div>
              <div className="overview-label">
                <span className="live-indicator" />
                LIVE OVERVIEW
              </div>
              <h2>Welcome back, Admin! 👋</h2>
              <p className="page-subtitle">
                Here&apos;s what&apos;s happening with your hiring activity.
              </p>
            </div>

            <div className="overview-decoration">
              <Sparkles size={23} />
            </div>
          </div>

          {error && (
            <div className="admin-alert error-alert" role="alert">
              <CircleX size={18} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="admin-alert success-alert" role="status">
              <CircleCheck size={18} />
              <span>{message}</span>
            </div>
          )}

          <section className="stats-grid" aria-label="Dashboard statistics">
            <article className="stat-card stat-blue" id="jobs-stat">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <BriefcaseBusiness size={22} />
                </div>
                <span className="stat-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p>Total Jobs</p>
              <h3>{totalJobs}</h3>
              <span className="stat-caption">Jobs in your portal</span>
            </article>

            <article className="stat-card stat-purple">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Users size={22} />
                </div>
                <span className="stat-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p>Total Applications</p>
              <h3>{applications.length}</h3>
              <span className="stat-caption">Candidates applied</span>
            </article>

            <article className="stat-card stat-orange">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Clock3 size={22} />
                </div>
                <span className="stat-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p>Pending Review</p>
              <h3>{pendingCount}</h3>
              <span className="stat-caption">Awaiting a decision</span>
            </article>

            <article className="stat-card stat-green">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <CircleCheck size={22} />
                </div>
                <span className="stat-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p>Selected</p>
              <h3>{selectedCount}</h3>
              <span className="stat-caption">Successful candidates</span>
            </article>

            <article className="stat-card stat-red">
              <div className="stat-card-top">
                <div className="stat-icon">
                  <CircleX size={22} />
                </div>
                <span className="stat-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p>Rejected</p>
              <h3>{rejectedCount}</h3>
              <span className="stat-caption">Applications declined</span>
            </article>
          </section>

          <section className="applications-panel" id="applications">
            <div className="panel-heading">
              <div>
                <div className="panel-title-row">
                  <div className="panel-title-icon">
                    <Users size={20} />
                  </div>
                  <h2>Job Applications</h2>
                  <span className="application-count">
                    {filteredApplications.length}
                  </span>
                </div>
                <p className="panel-subtitle">
                  Manage candidates and update application status.
                </p>
              </div>
            </div>

            <div className="application-toolbar">
              <label className="search-wrapper">
                <Search size={18} />
                <input
                  type="search"
                  className="application-search"
                  placeholder="Search name, email, job or company..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                className="filter-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter applications by status"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <div className="empty-state">
                <RefreshCw size={28} className="spin-icon" />
                <h3>Loading applications...</h3>
                <p>Please wait a moment.</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={29} />
                </div>
                <h3>No applications found</h3>
                <p>
                  {search || filter !== "All"
                    ? "Try changing your search or status filter."
                    : "Applications will appear here when candidates apply."}
                </p>
              </div>
            ) : (
              <div className="application-list">
                {filteredApplications.map((application, index) => {
                  const status = application.status || "Pending";
                  const resumeUrl = getResumeUrl(application.resume);

                  return (
                    <article
                      className="application-card"
                      key={application._id}
                      style={{ "--card-index": index }}
                    >
                      <div className="candidate-avatar">
                        {getInitials(application.name)}
                      </div>

                      <div className="candidate-details">
                        <h3>{application.name || "Unknown Applicant"}</h3>
                        <p className="candidate-email">
                          <Mail size={14} />
                          {application.email || "No email provided"}
                        </p>
                      </div>

                      <div className="job-details">
                        <span className="job-detail-label">APPLIED FOR</span>
                        <h4 className="job-title-text">
                          {application.jobId?.title || "Job details unavailable"}
                        </h4>
                        <p className="job-company-text">
                          <Building2 size={14} />
                          {application.jobId?.company || "Company not available"}
                        </p>
                      </div>

                      <div className="application-actions">
                        <span
                          className={`status-badge status-${status.toLowerCase()}`}
                        >
                          <span className="status-dot" />
                          {status}
                        </span>

                        <select
                          className="status-select"
                          value={status}
                          disabled={updatingId === application._id}
                          onChange={(event) =>
                            updateStatus(application._id, event.target.value)
                          }
                          aria-label={`Update status for ${application.name || "applicant"}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        {resumeUrl ? (
                          <a
                            className="resume-button"
                            href={resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FileText size={16} />
                            Resume
                            <ArrowUpRight size={14} />
                          </a>
                        ) : (
                          <span className="resume-unavailable">
                            No resume
                          </span>
                        )}

                        {updatingId === application._id && (
                          <span className="updating-text">
                            Saving status...
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="admin-footer">
            <span>
              <span className="footer-dot" />
              JobSphere Admin
            </span>
            <span>Manage your hiring process with confidence.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;