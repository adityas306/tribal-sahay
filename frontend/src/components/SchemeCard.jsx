import { Link } from "react-router-dom";

function SchemeCard({ scheme }) {
  return (
    <article className="card scheme">

      <div className="schemeTop">
        <span className="tag">
          {scheme.short}
        </span>

        <span className="dot">
          ●
        </span>
      </div>

      <h3>{scheme.name}</h3>

      <p>{scheme.desc}</p>

      <div className="meta">
        <span>
          🎓 {scheme.level}
        </span>

        <span>
          {scheme.income}
        </span>
      </div>

      <div className="cardActions">

        <Link
          className="outline"
          to={`/schemes/${scheme.id}`}
        >
          Details
        </Link>

        <a
          className="btn"
          href={scheme.url}
          target="_blank"
          rel="noreferrer"
        >
          Apply on official portal ↗
        </a>

      </div>

    </article>
  );
}

export default SchemeCard;