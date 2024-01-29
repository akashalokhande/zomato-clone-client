import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import { GoogleLogin } from "@react-oauth/google";
import Header from "../common/Header";

export default function LoginPage() {
  let [user, setUser] = useState(null);

  let onSuccess = (response) => {
    localStorage.setItem("auth_token", response.credential);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Login Successful!",
      showConfirmButton: false,
      timer: 1500,
    }).then(() =>
      window.location.assign(`/quick-search/${localStorage.getItem("meal_id")}`)
    );
  };

  let onError = () => {
    alert("Login Failed");
  };

  useEffect(() => {
    let token = localStorage.getItem("auth_token");
    if (token) {
      let decoded = jwt_decode(token);
      setUser(decoded);
    } else {
      setUser(null);
    }
  }, []);
  return (
    <>
      <Header bg="bg-danger" login="d-none" />
      <div className=" d-flex justify-content-center mt-5 Poppins fw-bolder">
        <h1 className="login-center">Login with Google to continue</h1>
        </div>
      <section className="d-flex justify-content-center align-items-center" >
      <div className="d-flex justify-content-center align-items-center shadow  col-7  mt-5 ">
        <GoogleOAuthProvider clientId="960137283931-7pijg3qdkd762o9c4d0ov8njrh5e0ri7.apps.googleusercontent.com">
          <div className=" d-flex align-items-center py-3">
            {
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  onSuccess(credentialResponse);
                }}
                onError={() => {
                  onError();
                }}
              />
            }
          </div>
        </GoogleOAuthProvider>
      </div>
      </section>
    </>
  );
}
