import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./RegisterLearner.css";

const RegisterLearner = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.agreeTerms) {
      alert("Please agree to the Terms of Use and Privacy Policy");
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: "student",
    });

    if (result.success) {
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="register-learner-page">
      <div className="register-learner-container">
        <div className="register-learner-illustration">
          <img
            src="/images/register-learner-illustration.png"
            alt="Students learning together"
          />
        </div>

        <div className="register-learner-form-section">
          <h2>Create Your Learner Account</h2>
          <p className="subtitle">
            Fill out the form below to start building and sharing your courses
            with students across the globe
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label className="terms-checkbox">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span>
                By signing up, I agree with the{" "}
                <Link to="/terms">Terms of Use</Link> &{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </button>

            <p className="login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterLearner;
