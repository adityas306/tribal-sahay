import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import schemes from "../data/schemes";

function SchemeDetails() {
  const { id } = useParams();

  const scheme = schemes.find(
    (item) => item.id === id
  );

  if (!scheme) {
    return (
      <Navigate
        to="/schemes"
        replace
      />
    );
  }

  return (
    <div className="page">

      <Link
        to="/schemes"
        className="back"
      >
        ← All schemes
      </Link>

      <div className="detail">

        <span className="tag">
          {scheme.short}
        </span>

        <h1>
          {scheme.name}
        </h1>

        <p className="lead">
          {scheme.desc}
        </p>

        <div className="detailGrid">

          <div>
            <span>
              Study level
            </span>

            <b>
              {scheme.level}
            </b>
          </div>

          <div>
            <span>
              Income reference
            </span>

            <b>
              {scheme.income}
            </b>
          </div>

          <div>
            <span>
              Scheme type
            </span>

            <b>
              {scheme.type}
            </b>
          </div>

        </div>

        <h2>
          How TribalSahay helps
        </h2>

        <ul>
          <li>
            Stores your common profile so you do
            not repeatedly type the same information.
          </li>

          <li>
            Shows your applications and status in
            one dashboard.
          </li>

          <li>
            Keeps a list of uploaded documents and
            verification status.
          </li>

          <li>
            Takes you directly to the authorized
            application portal for final submission.
          </li>
        </ul>

        <a
          className="btn big"
          href={scheme.url}
          target="_blank"
          rel="noreferrer"
        >
          Open official application portal ↗
        </a>

        <p className="muted">
          This prototype does not submit applications
          to government systems. The button above opens
          the official portal.
        </p>

      </div>
    </div>
  );
}

export default SchemeDetails;