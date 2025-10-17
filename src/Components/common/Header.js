import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/Header.css";

function Header({ type, bg }) {
  const navigate = useNavigate();

  const getUserLoginData = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return false;
    try {
      const result = jwtDecode(token);
      localStorage.setItem("email", result.email);
      return result;
    } catch {
      localStorage.removeItem("auth_token");
      return false;
    }
  };

  const [user, setUser] = useState(getUserLoginData());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [imgError, setImgError] = useState(false);

  const onSuccess = (response) => {
    const decoded = jwtDecode(response.credential);
    localStorage.setItem("auth_token", response.credential);
    setUser(decoded);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Login Successful!",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => window.location.reload());
  };

  const logout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem("auth_token");
        setUser(null);
        window.location.reload();
      }
    });
  };

  const getInitial = (name, email) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "?";
  };

  return (
    <GoogleOAuthProvider clientId="960137283931-7pijg3qdkd762o9c4d0ov8njrh5e0ri7.apps.googleusercontent.com">
      <header
        className={`custom-header ${
          type === "transparent" ? "transparent-header" : bg || "solid-header"
        }`}
      >
        <div className="header-content">
          {/* Brand */}
          {type !== "transparent" && (
            <p className="brand" onClick={() => navigate("/")}>
              a!
            </p>
          )}

          {/* Header Buttons */}
          <div className={`header-buttons ${menuOpen ? "show" : ""}`}>
            {!user ? (
              <button className="login-btn" onClick={() => setShowLogin(true)}>
                Login
              </button>
            ) : (
              <div className="user-info">
                {user.picture && !imgError ? (
                  <img
                    src={user.picture}
                    alt={getInitial(user.given_name || user.name, user.email)}
                    className="user-pic"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="user-avatar">
                    {getInitial(user.given_name || user.name, user.email)}
                  </div>
                )}

                <span className="welcome-text">
                  Hi, <strong>{user.given_name || user.name || "User"}</strong>
                </span>

                <div className="user-actions">
                  <button className="order-btn" onClick={() => navigate("/MyOrder")}>
                    My Orders
                  </button>
                  <button className="logout-btn" onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Icon */}
          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>

      {/* Google Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Login</h2>
              <button className="close-btn" onClick={() => setShowLogin(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <GoogleLogin
                onSuccess={onSuccess}
                onError={() => console.log("Login Failed")}
              />
            </div>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default Header;
