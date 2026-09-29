import { Link } from "react-router-dom";

function Empty({ text, link, label }) {
  return (
    <div className="empty">
      <div>✦</div>

      <p>{text}</p>

      <Link
        className="outline"
        to={link}
      >
        {label}
      </Link>
    </div>
  );
}

export default Empty;
