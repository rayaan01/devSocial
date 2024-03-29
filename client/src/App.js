import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/layouts/navbar";
import Landing from "./components/layouts/landing";
import Register from "./components/auth/register";
import Login from "./components/auth/login";
import Dashboard from "./components/dashboard/dashboard";
import PrivateRoute from "./components/routing/privateRoutes";
import createProfile from "./components/profile-forms/createProfile";
import AddExperience from "./components/profile-forms/addExperience";
import AddEducation from "./components/profile-forms/addEducation";
import Profiles from "./components/profiles/profiles";
import Profile from "./components/profile/profile";
import Posts from "./components/posts/posts";
import Post from "./components/post/post";
//Redux
import { Provider } from "react-redux";
import store from "./store";
import Alert from "./components/layouts/alert";
import { loadUser } from "./actions/auth";
import setAuthToken from "./utils/setAuthToken";
import EditProfile from "./components/profile-forms/editProfile";
//Styling
import "./App.css";

if (localStorage.token) setAuthToken(localStorage.token);

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path="/" component={Landing} />
          <section className="container">
            <Alert />
            <Switch>
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <Route path="/profiles" component={Profiles} />
              <Route path="/profile/:id" component={Profile} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <PrivateRoute path="/create-profile" component={createProfile} />
              <PrivateRoute path="/edit-profile" component={EditProfile} />
              <PrivateRoute path="/add-experience" component={AddExperience} />
              <PrivateRoute path="/add-education" component={AddEducation} />
              <PrivateRoute exact path="/posts" component={Posts} />
              <PrivateRoute exact path="/posts/:id" component={Post} />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;
