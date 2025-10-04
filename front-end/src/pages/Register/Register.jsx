import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    subject: "Marketing",
    jobTitle: "Manager",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      role: "instructor",
      subject: formData.subject,
      jobTitle: formData.jobTitle,
    });

    if (result.success) {
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-illustration">
          <img
            src="/students-studying-together-with-books-and-laptops-.jpg"
            alt="Students learning together"
          />
        </div>

        <div className="register-form-section">
          <h2>Create Your Instructor Account</h2>
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
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject(s) You Want to Teach</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="Marketing">Marketing</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Languages">Languages</option>
                <option value="Music">Music</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="jobTitle">Job Title</label>
              <select
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
              >
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
                <option value="Professor">Professor</option>
                <option value="Instructor">Instructor</option>
                <option value="Consultant">Consultant</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Other">Other</option>
              </select>
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

export default Register;
