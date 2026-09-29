import schemes from "../data/schemes";
import SchemeCard from "../components/SchemeCard";

function Schemes() {
  return (
    <div className="page">

      <div className="pageTitle">
        <span className="eyebrow">
          SCHOLARSHIP DIRECTORY
        </span>

        <h1>
          Five schemes. One starting point.
        </h1>

        <p>
          Review scheme information and use the
          official application link when you are
          ready to apply.
        </p>
      </div>

      <div className="grid">
        {schemes.map((scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
          />
        ))}
      </div>

      <div className="notice">
        ⚠️ <b>Important:</b>{" "}
        Eligibility, deadlines and required
        documents can change. Always verify the
        current criteria on the official scheme
        portal before submitting an application.
      </div>

    </div>
  );
}

export default Schemes;