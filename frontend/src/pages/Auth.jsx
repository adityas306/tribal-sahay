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

  // Password show/hide
  const [showPassword, setShowPassword] = useState(false);

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
                  type="text"
                  inputMode="numeric"
                  value={
                    form.income === 0
                      ? ""
                      : form.income
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    updateField(
                      "income",
                      value === ""
                        ? 0
                        : Number(value)
                    );
                  }}
                  placeholder="Enter annual income"
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

          {/* PASSWORD */}
          <label>
            Password

            <div className="passwordInputWrap">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                minLength="6"
                value={form.password}
                onChange={(e) =>
                  updateField(
                    "password",
                    e.target.value
                  )
                }
                placeholder="Enter password"
              />

              <button
                type="button"
                className="passwordToggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  /* Eye slash */
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M10.6 10.6C10.22 10.98 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13.02 13.78 13.4 13.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M9.9 4.24C10.57 4.08 11.27 4 12 4C18 4 21 12 21 12C20.36 13.7 19.4 15.13 18.25 16.25"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M6.61 6.61C4.58 8.05 3 10.18 3 12C3 12 6 20 12 20C13.27 20 14.47 19.7 15.55 19.17"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  /* Normal eye */
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 12C2.5 12 6 6 12 6C18 6 21.5 12 21.5 12C21.5 12 18 18 12 18C6 18 2.5 12 2.5 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>
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
