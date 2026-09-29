import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../api/api";
import { saveAuth } from "../utils/auth";

function Auth({ register = false }) {
  const navigate = useNavigate();

  const [form, setForm] = useState(
    register
      ? {
          name: "",
          email: "",
          password: "",
          phone: "",
          course: "",
          study_level: "",
          income: 0,
        }
      : {
          email: "",
          password: "",
        }
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = register
        ? "/api/auth/register"
        : "/api/auth/login";

      const response = await API.post(
        endpoint,
        form
      );

      saveAuth(response.data);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="authCard">

        <span className="pill">
          TRIBALSAHAY
        </span>

        <h1>
          {register
            ? "Create your account"
            : "Welcome back"}
        </h1>

        <p>
          {register
            ? "Create one profile and manage your scholarship journey."
            : "Sign in to view your scholarship dashboard."}
        </p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {register && (
            <>
              <label>
                Full name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Mobile number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Course / programme
                <input
                  type="text"
                  value={form.course}
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
                  value={form.study_level}
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
                Annual family income (₹)

                <input
                  type="number"
                  min="0"
                  value={form.income}
                  onChange={(e) =>
                    updateField(
                      "income",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </>
          )}

          <label>
            Email

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                updateField(
                  "email",
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Password

            <input
              type="password"
              required
              minLength="6"
              value={form.password}
              onChange={(e) =>
                updateField(
                  "password",
                  e.target.value
                )
              }
            />
          </label>

          <button
            className="btn full"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : register
              ? "Create account"
              : "Login"}
          </button>
        </form>

        <div className="switch">
          {register
            ? "Already have an account? "
            : "New here? "}

          <Link
            to={
              register
                ? "/login"
                : "/register"
            }
          >
            {register
              ? "Login"
              : "Create Account"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Auth;