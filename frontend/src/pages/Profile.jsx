import { useState } from "react";

import API from "../api/api";
import { getUser } from "../utils/auth";

function Profile() {
  const [form, setForm] =
    useState(getUser() || {});

  const [message, setMessage] =
    useState("");

  const updateField = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response =
        await API.put(
          "/api/auth/profile",
          form
        );

      localStorage.setItem(
        "ts_user",
        JSON.stringify(response.data)
      );

      setForm(response.data);

      setMessage(
        "Profile saved successfully."
      );
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Unable to save profile."
      );
    }
  };

  return (
    <div className="page narrow">

      <div className="pageTitle">

        <span className="eyebrow">
          STUDENT PROFILE
        </span>

        <h1>
          Your profile
        </h1>

        <p>
          Complete your profile to make scholarship
          matching more useful.
        </p>

      </div>

      <section className="panel">

        <form
          className="formGrid"
          onSubmit={handleSubmit}
        >

          <label>
            Full name

            <input
              value={form.name || ""}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Email

            <input
              disabled
              value={form.email || ""}
            />
          </label>

          <label>
            Phone

            <input
              value={form.phone || ""}
              onChange={(e) =>
                updateField(
                  "phone",
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Course

            <input
              value={form.course || ""}
              onChange={(e) =>
                updateField(
                  "course",
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Study level

            <select
              value={
                form.study_level || ""
              }
              onChange={(e) =>
                updateField(
                  "study_level",
                  e.target.value
                )
              }
            >
              <option value="">
                Select
              </option>

              <option>
                Class IX-X
              </option>

              <option>
                Post-Matric
              </option>

              <option>
                UG
              </option>

              <option>
                PG
              </option>

              <option>
                PhD
              </option>
            </select>
          </label>

          <label>
            Annual family income

            <input
              type="number"
              min="0"
              value={form.income || 0}
              onChange={(e) =>
                updateField(
                  "income",
                  Number(e.target.value)
                )
              }
            />
          </label>

          <div>

            <button className="btn">
              Save profile
            </button>

            {message && (
              <span className="success">
                {" "}
                {message}
              </span>
            )}

          </div>

        </form>

      </section>
    </div>
  );
}

export default Profile;