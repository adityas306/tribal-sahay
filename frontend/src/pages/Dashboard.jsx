import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/api";
import schemes from "../data/schemes";

import Empty from "../components/Empty";
import { getUser } from "../utils/auth";

function Dashboard() {
  const currentUser = getUser();

  const [applications, setApplications] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [applicationsResponse, documentsResponse] =
          await Promise.all([
            API.get("/api/applications"),
            API.get("/api/documents"),
          ]);

        setApplications(
          applicationsResponse.data
        );

        setDocuments(
          documentsResponse.data
        );
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="page">

      {/* Welcome */}
      <div className="welcome">
        <div>
          <span className="eyebrow">
            PERSONAL DASHBOARD
          </span>

          <h1>
            Welcome,{" "}
            {currentUser?.name?.split(" ")[0] ||
              "Student"}{" "}
            👋
          </h1>

          <p>
            Everything about your scholarship
            journey, in one place.
          </p>
        </div>

        <Link
          className="btn"
          to="/schemes"
        >
          Find scholarships
        </Link>
      </div>

      {/* Stats */}
      <div className="stats">

        <div>
          <b>{schemes.length}</b>
          <span>Schemes available</span>
        </div>

        <div>
          <b>{applications.length}</b>
          <span>Applications</span>
        </div>

        <div>
          <b>{documents.length}</b>
          <span>Documents</span>
        </div>

        <div>
          <b>0</b>
          <span>Pending actions</span>
        </div>

      </div>

      <div className="dashboardGrid">

        {/* Applications */}
        <section className="panel">

          <div className="panelHead">
            <h2>
              My applications
            </h2>

            <Link to="/applications">
              View all
            </Link>
          </div>

          {applications.length > 0 ? (
            applications.map((application) => (
              <div
                className="row"
                key={application.id}
              >
                <div>
                  <b>
                    {
                      schemes.find(
                        (scheme) =>
                          scheme.id ===
                          application.scheme_id
                      )?.short ||
                      application.scheme_id
                    }
                  </b>

                  <small>
                    Submitted{" "}
                    {new Date(
                      application.submitted_at
                    ).toLocaleDateString()}
                  </small>
                </div>

                <span className="status">
                  {application.status}
                </span>
              </div>
            ))
          ) : (
            <Empty
              text="No applications yet"
              link="/schemes"
              label="Explore scholarships"
            />
          )}

        </section>

        {/* Quick Actions */}
        <section className="panel">

          <div className="panelHead">
            <h2>
              Quick actions
            </h2>
          </div>

          <div className="quick">

            <Link to="/profile">
              👤 Complete profile
            </Link>

            <Link to="/documents">
              📁 Upload documents
            </Link>

            <Link to="/jago">
              🤖 Ask JAGO
            </Link>

            <a
              href="https://tribal.nic.in/ScholarshiP.aspx"
              target="_blank"
              rel="noreferrer"
            >
              🏛 Official MoTA portal ↗
            </a>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Dashboard;