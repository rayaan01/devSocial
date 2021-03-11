import axios from "axios";
import React, { Fragment, useRef } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = JSON.stringify({
      email: emailRef.current.value,
      password: passwordRef.current.value,
    });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post("/api/auth", body, config);
    console.log(response.data);
  };

  return (
    <Fragment>
      <div className="alert alert-danger">Invalid credentials</div>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Sign into Your Account
      </p>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            required
            ref={emailRef}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            required
            ref={passwordRef}
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </Fragment>
  );
};

export default Login;
