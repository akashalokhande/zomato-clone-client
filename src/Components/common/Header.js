import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import { useState, useEffect } from "react";
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

  const onSuccess = (response) => {
    localStorage.setItem("auth_token", response.credential);
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
        window.location.reload();
      }
    });
  };

  return (
    <GoogleOAuthProvider clientId="960137283931-7pijg3qdkd762o9c4d0ov8njrh5e0ri7.apps.googleusercontent.com">
      <header
        className={`custom-header ${
          type === "transparent" ? "transparent-header" : bg || "solid-header"
        }`}
      >
        <div className="header-content">
          {/* Brand only for non-transparent headers */}
          {type !== "transparent" && (
            <p className="brand" onClick={() => navigate("/")}>
              a!
            </p>
          )}

          <div className="header-buttons">
            {!user ? (
              <button
                className="login-btn"
                onClick={() =>
                  (document.getElementById("google-login").style.display = "flex")
                }
              >
                Login
              </button>
            ) : (
              <>
                <span className="welcome-text">
                  Welcome, <strong>{user.email.split("@")[0]}</strong>
                </span>
                <button className="logout-btn" onClick={logout}>
                  Logout
                </button>
                <button
                  className="order-btn"
                  onClick={() => navigate("/MyOrder")}
                >
                  My Orders
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Google Login Modal */}
      <div id="google-login" className="modal-overlay">
        <div className="modal-card">
          <div className="modal-header">
            <h2>Login</h2>
            <button
              className="close-btn"
              onClick={() =>
                (document.getElementById("google-login").style.display = "none")
              }
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            <GoogleLogin onSuccess={onSuccess} onError={() => console.log("Login Failed")} />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Header;
