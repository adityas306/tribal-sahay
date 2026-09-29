import { Link } from "react-router-dom";
import schemes from "../data/schemes";
import SchemeCard from "../components/SchemeCard";

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="heroContent">
          <span className="pill">
            MINISTRY OF TRIBAL AFFAIRS • SMART AUTOMATION
          </span>

          <h1>
            One place for every{" "}
            <em>tribal scholarship</em>.
          </h1>

          <p>
            Discover five MoTA scholarship and fellowship schemes,
            check your profile, track applications and open the
            official application portal from one mobile-first platform.
          </p>

          <div className="actions">
            <Link className="btn big" to="/register">
              Create free account
            </Link>

            <Link
              className="btn secondary big"
              to="/schemes"
            >
              Explore schemes
            </Link>
          </div>

          <div className="trust">
            <span>✓ Unified dashboard</span>
            <span>✓ Eligibility matching</span>
            <span>✓ Document wallet</span>
            <span>✓ JAGO assistant</span>
          </div>
        </div>

        <div className="heroCard">
          <div className="stat">
            {schemes.length}
            <small>MoTA schemes</small>
          </div>

          <div className="mini">
            <b>Application tracking</b>
            <span>
              Submitted → Verification → Sanction → Disbursement
            </span>
          </div>

          <div className="mini">
            <b>Official portal links</b>
            <span>
              Apply directly on authorized government portals
            </span>
          </div>
        </div>
      </section>

      {/* Schemes */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              THE FIVE SCHEMES
            </span>

            <h2>
              Find the support that fits your journey
            </h2>
          </div>

          <Link to="/schemes">
            View all →
          </Link>
        </div>

        <div className="grid">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;