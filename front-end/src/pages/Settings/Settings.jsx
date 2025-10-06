import { useState } from "react";
import { FaLock, FaPencilAlt, FaTrash } from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [profile, setProfile] = useState({
    fullName: "ABC",
    email: "abc@courseflow.com",
    avatar: "/diverse-user-avatars.png",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    marketing: false,
  });

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1>User Settings</h1>
          <p className="subtitle">
            Manage your CourseFlow account, preferences, and notification
            settings.
          </p>
        </div>

        <section className="settings-section">
          <h2>Account Information</h2>
          <p className="section-description">
            Manage your profile details and preferences.
          </p>

          <div className="account-info">
            <div className="profile-photo-section">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt="Profile"
                className="profile-photo"
              />
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  className="form-input"
                  readOnly
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={profile.email}
                className="form-input disabled"
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-field">
                <input
                  type="password"
                  value="********"
                  className="form-input"
                  readOnly
                />
                <button className="change-btn">
                  <FaLock /> Change
                </button>
              </div>
            </div>

            <button className="edit-profile-btn">
              <FaPencilAlt /> Edit Profile
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2>Notification Settings</h2>
          <p className="section-description">
            Control how you receive alerts and updates.
          </p>

          <div className="notification-options">
            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-icon email">📧</span>
                <span className="notification-label">Email Notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationToggle("email")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-icon bell">🔔</span>
                <span className="notification-label">In-App Notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.inApp}
                  onChange={() => handleNotificationToggle("inApp")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-icon marketing">💡</span>
                <span className="notification-label">
                  Marketing & Promotions
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={() => handleNotificationToggle("marketing")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section danger-zone">
          <h2>⚠️ Danger Zone</h2>
          <p className="section-description">
            Proceed with caution. These actions are irreversible.
          </p>

          <div className="danger-content">
            <div>
              <h3>Delete Account</h3>
              <p>
                Permanently delete your CourseFlow account and all associated
                data.
              </p>
            </div>
            <button className="delete-btn">
              <FaTrash /> Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
