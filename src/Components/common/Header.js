import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function Header(props) {
  let navigate = useNavigate();
  let getUserLoginData = () => {
    let token = localStorage.getItem("auth_token");
    if (token == null) {
      return false;
    } else {
      try {
        let result = jwtDecode(token);
        localStorage.setItem("email", result.email);
        return result;
      } catch (error) {
        localStorage.removeItem("auth_token");
        return false;
      }
    }
  };

  let [user, setUser] = useState(getUserLoginData());

  let onSuccess = (response) => {
    localStorage.setItem("auth_token", response.credential); //can be like token= response.cred..
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Login Successful!",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => window.location.reload());
  };
  let onError = () => {
    console.log("Login Failed");
  };

  let logout = () => {
    Swal.fire({
      title: "Are you sure to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("auth_token");
        window.location.reload();
      }
    });
  };

  return (
    <>
      <GoogleOAuthProvider clientId="960137283931-7pijg3qdkd762o9c4d0ov8njrh5e0ri7.apps.googleusercontent.com">
        <div
          className="modal fade"
          id="google-login"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  Login
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <GoogleLogin onSuccess={onSuccess} onError={onError} />;
              </div>
            </div>
          </div>
        </div>
        <div className={`row ${props.bg} justify-content-center`}>
          <div className="col-11 d-flex justify-content-between align-items-center py-2">
            {props.bg ? (
              <p
                className="m-0 brand"
                role="button"
                onClick={() => navigate("/")}
              >
                e!
              </p>
            ) : (
              <p className="btn btn-primary" onClick={() => navigate("/MyOrder")}>
                MyOrder
              </p>
            )}
            <div className={props.login}>
              {user === false ? (
                <button
                  className="btn  btn-outline-light"
                  data-bs-toggle="modal"
                  data-bs-target="#google-login"
                >
                  Login
                </button>
              ) : (
                <>
                  <span className="fw-bold text-white">
                    Welcome, {user.email.split("@")[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="btn btn-outline-light ms-3 btn-sm"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    </>
  );
}

export default Header;
