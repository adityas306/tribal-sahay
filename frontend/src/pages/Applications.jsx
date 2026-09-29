import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/api";
import schemes from "../data/schemes";
import Empty from "../components/Empty";

function Applications() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response =
          await API.get("/api/applications");

        setApplications(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  return (
    <div className="page">

      <div className="pageTitle">
        <span className="eyebrow">
          TRACKING
        </span>

        <h1>
          My applications
        </h1>

        <p>
          One consolidated view of your scholarship
          applications.
        </p>
      </div>

      <section className="panel">

        {loading ? (
          <div className="loading">
            Loading applications...
          </div>
        ) : applications.length ? (
          applications.map((application) => {

            const scheme = schemes.find(
              (item) =>
                item.id ===
                application.scheme_id
            );

            return (
              <div
                className="timeline"
                key={application.id}
              >
                <div className="lineDot" />

                <div>

                  <div className="applicationTitle">
                    <b>
                      {scheme?.name ||
                        application.scheme_id}
                    </b>

                    <span className="status">
                      {application.status}
                    </span>
                  </div>

                  <small>
                    Submitted:{" "}
                    {new Date(
                      application.submitted_at
                    ).toLocaleString()}
                  </small>

                  <div className="steps">
                    <span className="done">
                      ✓ Submitted
                    </span>

                    <span>
                      ○ Verification
                    </span>

                    <span>
                      ○ Sanction
                    </span>

                    <span>
                      ○ Disbursement
                    </span>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <Empty
            text="No applications have been started."
            link="/schemes"
            label="Explore schemes"
          />
        )}

      </section>
    </div>
  );
}

export default Applications;