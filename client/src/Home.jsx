function Home({ search = "", setSearch = () => {} }) {
  function handleSearch(event) {
    event.preventDefault();

    document.getElementById("jobs")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="home-hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Your next opportunity starts here
        </div>

        <h1>
          Find the work you
          <br />
          <span className="hero-gradient-text">love to do.</span>
        </h1>

        <p className="hero-description">
          Discover opportunities that match your skills, grow your career,
          and take the next step toward your dream job.
        </p>

        <form className="hero-search" onSubmit={handleSearch}>
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            type="search"
            placeholder="Job title, company or location"
            aria-label="Search jobs by title, company or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" className="hero-search-button">
            Find Jobs <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="popular-searches">
          <span>Popular searches:</span>
          {["Frontend Developer", "React", "Software Engineer"].map(
            (item) => (
              <button
                type="button"
                className="search-chip"
                key={item}
                onClick={() => {
                  setSearch(item);
                  document.getElementById("jobs")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      <div className="hero-decoration" aria-hidden="true">
        <div className="decoration-circle circle-one"></div>
        <div className="decoration-circle circle-two"></div>

        <div className="floating-card floating-card-top">
          <span className="floating-card-icon">✦</span>
          <div>
            <strong>New opportunities</strong>
            <small>Your next chapter awaits</small>
          </div>
        </div>

        <div className="floating-card floating-card-bottom">
          <span className="floating-card-icon">↗</span>
          <div>
            <strong>Grow your career</strong>
            <small>Find your next big move</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;